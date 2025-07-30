import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CommentService } from 'src/comment/comment.service';
import { ClientKafka } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostQueryDto } from './dto/post-query.dto';
import { paginate } from 'src/common/pagination';
import { firstValueFrom } from 'rxjs';
import { ReactionService } from 'src/reaction/reaction.service';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { User } from 'src/common/type/user';
import {
  RpcConflictException,
  RpcNotFoundException,
  RpcUnauthorizedException,
} from 'src/common/exception/rpc.exception';
import * as _ from 'lodash';
import { InjectQueue } from '@nestjs/bullmq';
import { postHideJobName, postHideQueueName } from 'src/jobs/post-hide.job';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostService implements OnModuleInit {
  private readonly logger = new Logger(PostService.name);
  constructor(
    private prisma: PrismaService,
    private commentService: CommentService,
    private reactionService: ReactionService,
    @Inject(CONSTANTS.KAFKA_SERVICE.AUTH)
    private readonly authClient: ClientKafka,
    @InjectQueue(postHideQueueName) private postHideQueue: Queue,
  ) {}

  async onModuleInit() {
    this.authClient.subscribeToResponseOf(
      CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USER,
    );
    this.authClient.subscribeToResponseOf(
      CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS,
    );

    const cronPattern = '0 0 * * *';
    const existing = await this.postHideQueue.getRepeatableJobs();
    const hasJob = existing.some(
      (job) => job.name === postHideJobName && job.pattern === cronPattern,
    );

    if (!hasJob) {
      await this.postHideQueue.add(
        postHideJobName,
        {},
        {
          repeat: { pattern: cronPattern },
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    }
  }

  async create(createPostDto: CreatePostDto) {
    const user = await firstValueFrom(
      this.authClient.send(
        CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USER,
        createPostDto.userId,
      ),
    );
    if (!user) {
      throw new RpcUnauthorizedException('Unauthorized');
    }

    await Promise.all(
      createPostDto.tagIds.map(async (tagId) => {
        const tag = await this.prisma.tag.findUnique({
          where: {
            id: tagId.tagId,
          },
        });
        if (!tag) {
          throw new RpcConflictException(`Không tồn tại TagId: ${tagId.tagId}`);
        }
      }),
    );

    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        userId: createPostDto.userId,

        tags: {
          create: createPostDto.tagIds.map((tag) => ({
            tagId: tag.tagId,
          })),
        },

        ...(createPostDto.postImages
          ? {
              image: {
                create: createPostDto.postImages.map((postImage) => ({
                  url: postImage.url,
                  altText: postImage.altText,
                })),
              },
            }
          : {}),
      },
      include: {
        image: true,
      },
    });

    return { data: post };
  }

  async findAll(postQueryDto: PostQueryDto) {
    const paginateCondition = paginate(postQueryDto.page, postQueryDto.limit);

    const searchCondition: Prisma.PostWhereInput = {
      isHidden: false,
      deletedAt: null,
    };

    if (postQueryDto.search) {
      delete searchCondition.isHidden;
      searchCondition.OR = [
        {
          content: {
            contains: postQueryDto.search,
          },
        },
        {
          title: {
            contains: postQueryDto.search,
          },
        },
      ];
    }

    const [posts, totalItem] = await Promise.all([
      this.prisma.post.findMany({
        omit: {
          updatedAt: true,
          deletedAt: true,
        },
        include: {
          comments: {
            take: 2,
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              content: true,
              userId: true,
              createdAt: true,
              _count: {
                select: {
                  childComment: true,
                },
              },
            },
          },
          image: {
            omit: {
              updatedAt: true,
              deletedAt: true,
              postId: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          ...(postQueryDto.userId && {
            reactions: {
              where: {
                userId: postQueryDto.userId,
                deletedAt: null,
              },
            },
          }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: { ...searchCondition },
        ...paginateCondition,
      }),
      this.prisma.post.count({ where: searchCondition }),
    ]);

    // Lay danh sach userIds tu cac post va comment
    const userIds = [
      ...new Set(
        posts.map((post) => [
          post.userId,
          ...post.comments.map((comment) => comment.userId),
        ]),
      ),
    ].flat();

    const users: User[] = (
      await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS, {
          ids: userIds,
        }),
      )
    ).data;

    // Anh xa lai response
    const result = await Promise.all(
      posts.map(async (post) => {
        // Nguoi dang bai
        const author = users.find((user) => user.id === post.userId);

        // Anh xa comment voi user info
        const commentMapper = post.comments.map((comment) => {
          const commentUser = users.find((user) => user.id === comment.userId);
          return {
            ..._.omit(comment, ['userId', 'postId', 'parentId', '_count']),
            childComment: comment._count.childComment,
            user: _.pick(commentUser, ['id', 'email', 'username']),
          };
        });

        // Tong so luong comment va reaction summary
        const [totalComment, reaction] = await Promise.all([
          this.commentService.countCommentsByPostId(post.id),
          this.reactionService.getReactionsSummaryByPostId(post.id),
        ]);

        // Lay tag details
        const tagDetail = post.tags.map((tag) => ({
          id: tag.tag.id,
          name: tag.tag.name,
        }));

        return {
          ..._.omit(post, ['userId', 'tags']),
          tags: tagDetail,
          user: _.pick(author, ['id', 'username', 'email']),
          comments: commentMapper,
          totalComment: totalComment.data,
          reaction: reaction.data,
        };
      }),
    );

    return {
      data: result,
      meta: {
        page: postQueryDto.page,
        limit: postQueryDto.limit,
        totalItem: totalItem,
        totalPage: Math.ceil(totalItem / postQueryDto.limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      omit: {
        updatedAt: true,
        deletedAt: true,
      },
      include: {
        image: {
          omit: {
            updatedAt: true,
            deletedAt: true,
          },
        },
        reactions: {
          where: {
            userId: userId,
            deletedAt: null,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new RpcNotFoundException('Không tìm thấy bài Post');
    }

    // User dang bai
    const author = (
      await firstValueFrom(
        this.authClient.send(
          CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USER,
          post.userId,
        ),
      )
    ).data;

    const tagDetail = post.tags.map((tag) => {
      return {
        id: tag.tag.id,
        name: tag.tag.name,
      };
    });

    const [comments, reaction, totalComment] = await Promise.all([
      this.commentService.getCommentsByPostId(post.id, 1, 100),
      this.reactionService.getReactionsSummaryByPostId(post.id),
      this.commentService.countCommentsByPostId(post.id),
    ]);

    return {
      data: {
        ..._.pick(post, [
          'id',
          'title',
          'reactions',
          'content',
          'createdAt',
          'image',
        ]),
        tags: tagDetail,
        user: _.pick(author, ['id', 'email', 'username']),
        comments: comments.data,
        reaction: reaction.data,
        totalComment: totalComment.data,
      },
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
      },
    });
    if (!post) {
      throw new RpcNotFoundException('Post not found');
    }
    const updatedPost = await this.prisma.post.update({
      where: {
        id,
      },
      data: updatePostDto,
    });
    return { data: updatedPost, meta: {} };
  }

  async delete(id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: id },
    });
    if (!post) {
      throw new RpcNotFoundException('Post not found');
    }
    return this.prisma.post.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
