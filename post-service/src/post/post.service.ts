import { Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaClient } from '@prisma/client';
import { CommentService } from 'src/comment/comment.service';

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
      },
    });
    return { data: post, meta: {} };
  }

  async findAll() {
    const posts = await this.prisma.post.findMany();
    const result = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        totalComment: await this.commentService.countAll(post.id),
      })),
    );
    return {
      data: result,
      meta: {},
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
