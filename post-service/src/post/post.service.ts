import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CommentService } from 'src/comment/comment.service';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostQueryDto } from './dto/post-query.dto';
import { paginate } from 'src/common/pagination';
import { Post, Prisma } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { ReactionService } from 'src/reaction/reaction.service';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { User } from 'src/common/type/user';
import { RpcNotFoundException } from 'src/common/exception/rpc.exception';
import * as _ from 'lodash';

@Injectable()
export class PostService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private commentService: CommentService,
    private reactionService: ReactionService,
    @Inject(CONSTANTS.KAFKA_SERVICE.AUTH)
    private readonly authClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.authClient.subscribeToResponseOf(
      CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USER,
    );
    this.authClient.subscribeToResponseOf(
      CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS,
    );
  }

  async create(createPostDto: CreatePostDto) {
    const user = await firstValueFrom(
      this.authClient.send(
        CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USER,
        createPostDto.userId,
      ),
    );
    if (!user) {
      throw new RpcException({
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      });
    }

    await Promise.all(
      createPostDto.tagIds.map(async (tagId) => {
        const tag = await this.prisma.tag.findUnique({
          where: {
            id: tagId.tagId,
          },
        });
        if (!tag) {
          throw new RpcException({
            statusCode: 409,
            message: `Không tồn tại tagId: ${tagId.tagId}`,
            error: 'Conflick database',
          });
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
    console.log(postQueryDto);
    const paginateCondition = paginate(postQueryDto.page, postQueryDto.limit);

    const searchConditon = postQueryDto.search
      ? {
          OR: [
            {
              content: {
                contains: postQueryDto.search,
              },
            },
          ],
        }
      : {};

    const [posts, totalItem] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        omit: {
          updatedAt: true,
          deletedAt: true,
        },
        include: {
          comments: {
            omit: {
              deletedAt: true,
              updatedAt: true,
            },
          },
          image: {
            omit: {
              updatedAt: true,
              deletedAt: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          ...(postQueryDto.userId && {
            reactions: {
              where: {
                userId: postQueryDto.userId,
              },
            },
          }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        where: searchConditon,
        ...paginateCondition,
      }),
      this.prisma.post.count({ where: searchConditon }),
    ]);

    // Lay danh sach userIds tu cac post va comment
    const userIds = [
      ...new Set(
        posts.map((post) => [
          ...post.userId,
          ...post.comments.map((comment) => comment.userId),
        ]),
      ),
    ].flat();

    console.log('debug here');
    console.log('userIds', userIds);

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
            ..._.omit(comment, ['userId']),
            user: _.pick(commentUser, ['id', 'email', 'username']),
          };
        });

        // Tong so luong comment va reaction summary
        const [totalComment, reaction] = await Promise.all([
          this.commentService.countCommentsByPostId(post.id),
          this.reactionService.getReactionsSummaryByPostId(post.id),
        ]);

        // Lay tag details
        const tagDetail = post.tags.map((tag) => {
          return {
            id: tag.tag.id,
            name: tag.tag.name,
          };
        });
        return {
          ..._.omit(post, ['userId']),
          tag: tagDetail,
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

  async findOne(id: string) {
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

    console.log('author', author);

    const tagDetail = post.tags.map((tag) => {
      return {
        id: tag.tag.id,
        name: tag.tag.name,
      };
    });

    const [comments, reaction, reactionSummary, commentCount] =
      await Promise.all([
        this.commentService.getCommentsByPostId(post.id),
        this.reactionService.getReactionsByPostId(post.id),
        this.reactionService.getReactionsSummaryByPostId(post.id),
        this.commentService.countCommentsByPostId(post.id),
      ]);

    return {
      data: {
        ..._.pick(post, ['id', 'title', 'content', 'createdAt', 'images']),
        tags: tagDetail,
        user: _.pick(author.data, ['id', 'email', 'username']),
        comments: comments.data,
        reaction: reaction.data,
        reactionSummary: reactionSummary.data,
        totalComment: commentCount.data,
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
