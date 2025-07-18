import { Injectable } from '@nestjs/common';
import { PostTag, Tag } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PostTagDto, CreateTagDto, UpdateTagDto } from './tag.dto';
import { RpcException } from '@nestjs/microservices';
import { ConsumerResult } from 'src/common/type/consumer-result';

@Injectable()
export class TagService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTags(): Promise<ConsumerResult<Tag[]>> {
    const tags = await this.prismaService.tag.findMany({
      where: {
        deletedAt: null,
      },
    });
    return { data: tags, meta: {} };
  }

  async createTag(createTagDto: CreateTagDto): Promise<ConsumerResult<Tag>> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        name: createTagDto.name,
      },
    });
    if (tag) {
      throw new RpcException({ status: 409, message: 'Tag already exists' });
    }
    const createdTag = await this.prismaService.tag.create({
      data: createTagDto,
    });
    return { data: createdTag, meta: {} };
  }

  async updateTag(updateTagDto: UpdateTagDto): Promise<ConsumerResult<Tag>> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        id: updateTagDto.id,
      },
    });
    if (!tag) {
      throw new RpcException({ status: 404, message: 'Tag not found' });
    }
    const updatedTag = await this.prismaService.tag.update({
      where: {
        id: updateTagDto.id,
      },
      data: updateTagDto,
    });
    return { data: updatedTag, meta: {} };
  }

  async deleteTag(id: string): Promise<ConsumerResult<Tag>> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        id: id,
      },
    });
    if (!tag) {
      throw new RpcException({ status: 404, message: 'Tag not found' });
    }

    const deletedTag = await this.prismaService.tag.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { data: deletedTag, meta: {} };
  }

  async getTagsByPostId(postId: string): Promise<ConsumerResult<Tag[]>> {
    const tagIds = await this.prismaService.postTag.findMany({
      where: {
        postId: postId,
      },
    });
    const tags = await this.prismaService.tag.findMany({
      where: {
        id: {
          in: tagIds.map((tagId) => tagId.tagId),
        },
        deletedAt: null,
      },
    });
    return { data: tags, meta: {} };
  }

  async createPostTag(
    PostTagDto: PostTagDto,
  ): Promise<ConsumerResult<PostTag>> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        id: PostTagDto.tagId,
        deletedAt: null,
      },
    });
    const post = await this.prismaService.post.findFirst({
      where: {
        id: PostTagDto.postId,
        deletedAt: null,
      },
    });
    if (!tag || !post) {
      throw new RpcException({ status: 404, message: 'Tag or post not found' });
    }

    const postTag = await this.prismaService.postTag.findFirst({
      where: {
        postId: PostTagDto.postId,
        tagId: PostTagDto.tagId,
      },
    });
    if (postTag) {
      throw new RpcException({
        status: 409,
        message: 'Post tag already exists',
      });
    }

    const createdPostTag = await this.prismaService.postTag.create({
      data: PostTagDto,
    });

    return { data: createdPostTag, meta: {} };
  }

  async deletePostTag(
    postTagDto: PostTagDto,
  ): Promise<ConsumerResult<PostTag>> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        id: postTagDto.tagId,
        deletedAt: null,
      },
    });
    const post = await this.prismaService.post.findFirst({
      where: {
        id: postTagDto.postId,
        deletedAt: null,
      },
    });
    if (!tag || !post) {
      throw new RpcException({ status: 404, message: 'Tag or post not found' });
    }

    const postTag = await this.prismaService.postTag.findFirst({
      where: {
        postId: postTagDto.postId,
        tagId: postTagDto.tagId,
      },
    });
    if (!postTag) {
      throw new RpcException({ status: 404, message: 'Post tag not found' });
    }

    const deletedPostTag = await this.prismaService.postTag.update({
      where: {
        postId_tagId: {
          postId: postTagDto.postId,
          tagId: postTagDto.tagId,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { data: deletedPostTag, meta: {} };
  }
}
