import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CommentService } from 'src/comment/comment.service';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostQueryDto } from './dto/post-query.dto';
import { paginate } from 'src/common/pagination';
import { Post, Prisma, PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { ReactionService } from 'src/reaction/reaction.service';
import { CONSTANTS } from 'constants/app.constants';
import { User } from 'src/common/type/user';

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

    const prismaConditon: Prisma.PostFindManyArgs = {
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        image: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
        },
        comments: {
          take: 5,
          select: {
            id: true,
            content: true,
            userId: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdAt: true,
      },
      where: searchConditon,
      orderBy: {
        createdAt: 'desc',
      },
    };

    const posts = await this.prisma.post.findMany({
      ...paginateCondition,
      ...prismaConditon,
    });

    // Lay danh sach userIds tu cac post
    const userIds = [...new Set(posts.map((post) => post.userId))];

    // Thay thong tin user tu service auth
    const users: User[] = (
      await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS, userIds),
      )
    ).data;

    const totalItem = await this.prisma.post.count({
      where: prismaConditon.where,
    });

    // Anh xa lai response
    const result = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        user: users.find((value) => value.id === post.userId),
        totalComment: (await this.commentService.countCommentsByPostId(post.id))
          .data,
        reaction: (
          await this.reactionService.getReactionsSummaryByPostId(post.id)
        ).data,
      })),
    );

    return {
      data: result,
      meta: {
        page: postQueryDto.page,
        limit: postQueryDto.limit,
        totalItem,
        totalPage: Math.ceil(totalItem / postQueryDto.limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        image: {
          select: {
            id: true,
            altText: true,
            url: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });

    if (!post) {
      throw new RpcException({ status: 400, message: 'Post không tồn tại' });
    }

    // User dang bai
    const author = await firstValueFrom(
      this.authClient.send(
        CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USER,
        post.userId,
      ),
    );

    const comments = await this.commentService.getCommentsByPostId(post.id);

    const reaction = await this.reactionService.getReactionsSummaryByPostId(
      post.id,
    );
    const commentCount = await this.commentService.countCommentsByPostId(
      post.id,
    );
    const { userId, ...result } = post;
    return {
      data: {
        ...result,
        user: author,
        comments: comments.data,
        reactionSummary: reaction.data,
        totalComment: commentCount.data,
      },
    };
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
