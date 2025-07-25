import { Injectable } from '@nestjs/common';
import { PostTag, Tag } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PostTagDto, CreateTagDto, UpdateTagDto } from './tag.dto';
import { ConsumerResult } from 'src/common/type/consumer-result';
import {
  RpcConflictException,
  RpcNotFoundException,
} from 'src/common/exception/rpc.exception';

@Injectable()
export class TagService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTags(): Promise<ConsumerResult<Tag[]>> {
    const tags = await this.prismaService.tag.findMany({
      where: {
        deletedAt: null,
      },
    });
    return { data: tags };
  }

  async createTag(createTagDto: CreateTagDto): Promise<ConsumerResult<Tag>> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        name: createTagDto.name,
      },
    });
    if (tag) {
      throw new RpcConflictException('Tag already exists');
    }
    const createdTag = await this.prismaService.tag.create({
      data: createTagDto,
    });
    return { data: createdTag };
  }

  async updateTag(updateTagDto: UpdateTagDto): Promise<ConsumerResult<Tag>> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        id: updateTagDto.id,
      },
    });
    if (!tag) {
      throw new RpcNotFoundException('Tag not found');
    }
    const updatedTag = await this.prismaService.tag.update({
      where: {
        id: updateTagDto.id,
      },
      data: updateTagDto,
    });
    return { data: updatedTag };
  }

  async deleteTag(id: string): Promise<ConsumerResult<Tag>> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        id: id,
      },
    });
    if (!tag) {
      throw new RpcNotFoundException('Tag not found');
    }

    const deletedTag = await this.prismaService.tag.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return { data: deletedTag };
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
    return { data: tags };
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
      throw new RpcNotFoundException('Tag or post not found');
    }

    const postTag = await this.prismaService.postTag.findFirst({
      where: {
        postId: PostTagDto.postId,
        tagId: PostTagDto.tagId,
      },
    });
    if (postTag) {
      throw new RpcConflictException('Post tag already exists');
    }

    const createdPostTag = await this.prismaService.postTag.create({
      data: PostTagDto,
    });

    return { data: createdPostTag };
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
      throw new RpcNotFoundException('Tag or post not found');
    }

    const postTag = await this.prismaService.postTag.findFirst({
      where: {
        postId: postTagDto.postId,
        tagId: postTagDto.tagId,
      },
    });
    if (!postTag) {
      throw new RpcNotFoundException('Post tag not found');
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

    return { data: deletedPostTag };
  }
}
