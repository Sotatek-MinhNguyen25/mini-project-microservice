import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CommentService } from 'src/comment/comment.service';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { PostQueryDto } from './dto/post-query.dto';
import { paginate } from 'src/common/pagination';
import { Post, Prisma, PrismaClient } from '@prisma/client';
import { PrismaClientOptions } from '@prisma/client/runtime/library';
import { ReactionService } from 'src/reaction/reaction.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private commentService: CommentService,
    private reactionService: ReactionService,
  ) {}

  async create(createPostDto: CreatePostDto) {
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

    const prismaConditon: Prisma.PostFindManyArgs = {
      select: {
        id: true,
        title: true,
        content: true,
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

      // where: {
      //   OR: [
      //     {
      //       content: {
      //         contains: postQueryDto.search,
      //       },
      //     },
      //   ],
      // },
    };

    const posts = await this.prisma.post.findMany({
      ...paginateCondition,
      ...prismaConditon,
    });

    const totalItem = await this.prisma.post.count({
      where: prismaConditon.where,
    });

    const result = await Promise.all(
      posts.map(async (post) => ({
        ...post,
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
        comments: {
          select: {
            id: true,
            content: true,
            userId: true,
            createdAt: true,
          },
        },
        reactions: {
          select: {
            id: true,
            userId: true,
            type: true,
          },
        },
        createdAt: true,
      },
    });
    if (!post) {
      throw new RpcException({ status: 400, message: 'Post không tồn tại' });
    }

    return {
      data: {
        post: post,
      },
      meta: {},
    };
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
