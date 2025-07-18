import { Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaClient } from '@prisma/client';
import { CommentService } from 'src/comment/comment.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaClient,
    private commentService: CommentService,
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

    return { data: post, meta: {} };
  }

  async findAll() {
    const posts = await this.prisma.post.findMany({
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
        createdAt: true,
      },
    });
    return {
      data: posts,
      meta: {},
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
