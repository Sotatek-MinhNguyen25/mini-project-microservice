import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostTag, Tag } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PostTagDto, CreateTagDto, UpdateTagDto } from './tag.dto';

@Injectable()
export class TagService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTags(): Promise<Tag[]> {
    const tags = await this.prismaService.tag.findMany({
      where: {
        deletedAt: null,
      },
    });
    return tags;
  }

  async createTag(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        name: createTagDto.name,
      },
    });
    if (tag) {
      throw new ConflictException('Tag already exists');
    }
    return await this.prismaService.tag.create({
      data: createTagDto,
    });
  }

  async updateTag(updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        id: updateTagDto.id,
      },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return await this.prismaService.tag.update({
      where: {
        id: updateTagDto.id,
      },
      data: updateTagDto,
    });
  }

  async deleteTag(id: string): Promise<Tag> {
    const tag = await this.prismaService.tag.findFirst({
      where: {
        id: id,
      },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return await this.prismaService.tag.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getTagsByPostId(postId: string): Promise<Tag[]> {
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
    return tags;
  }

  async createPostTag(PostTagDto: PostTagDto): Promise<PostTag> {
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
      throw new NotFoundException('Tag or post not found');
    }

    const postTag = await this.prismaService.postTag.findFirst({
      where: {
        postId: PostTagDto.postId,
        tagId: PostTagDto.tagId,
      },
    });
    if (postTag) {
      throw new ConflictException('Tag already exists');
    }

    return await this.prismaService.postTag.create({
      data: PostTagDto,
    });
  }

  async deletePostTag(postTagDto: PostTagDto): Promise<PostTag> {
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
      throw new NotFoundException('Tag or post not found');
    }

    const postTag = await this.prismaService.postTag.findFirst({
      where: {
        postId: postTagDto.postId,
        tagId: postTagDto.tagId,
      },
    });
    if (!postTag) {
      throw new NotFoundException('Post tag not found');
    }

    // dont have soft delete yet
    return await this.prismaService.postTag.delete({
      where: {
        postId_tagId: {
          postId: postTagDto.postId,
          tagId: postTagDto.tagId,
        },
      },
    });
  }
}
