import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { ConsumerResult } from '../common/type/consumer-result';
import { Comment } from '@prisma/client';
import { User } from 'src/common/type/user';
import {
  RpcBadRequestException,
  RpcNotFoundException,
  RpcUnauthorizedException,
} from 'src/common/exception/rpc.exception';
import * as _ from 'lodash';
import { GetChildByParentId } from './dto/comment.dto';
import { Npaginate } from 'src/common/utils/paginate';
import { CreateNotiDto } from './dto/notification.dto';
import { paginate } from 'src/common/pagination';

@Injectable()
export class CommentService implements OnModuleInit {
  constructor(
    private prismaService: PrismaService,
    @Inject(CONSTANTS.KAFKA_SERVICE.AUTH)
    private readonly authClient: ClientKafka,

    @Inject(CONSTANTS.KAFKA_SERVICE.NOTI)
    private readonly notiClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.authClient.subscribeToResponseOf(
      CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS,
    );
  }

  async create(
    createCommentDto: CreateCommentDto,
  ): Promise<ConsumerResult<Comment>> {
    const { commentId, postId, userId } = createCommentDto;

    if (!createCommentDto.userId) {
      throw new RpcUnauthorizedException('Unauthorized');
    }

    const user: User = (
      await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USER, userId),
      )
    ).data;

    if (!commentId && !postId) {
      throw new RpcBadRequestException('Phải có ít nhất commentId hoặc postId');
    }

    // Neu co postId
    if (createCommentDto.postId) {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: postId,
        },
      });
      if (!post) {
        throw new RpcNotFoundException('Không tồn tại bài Post');
      }

      const newComment = await this.prismaService.comment.create({
        data: {
          content: createCommentDto.content,
          postId: createCommentDto.postId,
          userId: createCommentDto.userId,
        },
      });

      // Notification
      if (createCommentDto.userId !== post.userId) {
        const notiPayload: CreateNotiDto = {
          content: `Tài khoản ${user.username} đã bình luận về bài viết của bạn`,
          postId: post.id,
          receiverId: post.userId,
          senderId: createCommentDto.userId,
          type: 'Comment',
        };
        this.notiClient.emit(
          CONSTANTS.MESSAGE_PATTERN.NOTI.CREATE,
          notiPayload,
        );
      }

      return {
        data: newComment,
      };
    }

    // Comment reply
    const parentComment = await this.prismaService.comment.findUnique({
      where: {
        id: createCommentDto.commentId,
      },
    });

    if (!parentComment) {
      throw new RpcNotFoundException('Không tồn tại comment');
    }

    if (parentComment?.parentId) {
      throw new RpcBadRequestException('Comment chỉ nên có 2 cấp');
    }

    const parentCommentUser = (
      await firstValueFrom(
        this.authClient.send(
          CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USER,
          parentComment.userId,
        ),
      )
    ).data;
    // Notification
    if (createCommentDto.userId !== parentComment.userId) {
      const notiPayload: CreateNotiDto = {
        content: `Tài khoản ${user.username} đã phản hồi bình luận của bạn`,
        postId: parentComment.postId || '',
        receiverId: parentComment.userId,
        senderId: createCommentDto.userId,
        type: 'Comment',
      };
      this.notiClient.emit(CONSTANTS.MESSAGE_PATTERN.NOTI.CREATE, notiPayload);
    }

    return {
      data: await this.prismaService.comment.create({
        data: {
          content: `@${parentCommentUser.username} ${createCommentDto.content}`,
          userId: createCommentDto.userId,
          parentId: createCommentDto.commentId,
        },
      }),
    };
  }

  async countCommentsByPostId(postId: string): Promise<ConsumerResult<number>> {
    // Lấy tất cả comment gốc (có postId)
    const rootComments = await this.prismaService.comment.findMany({
      where: { postId, deletedAt: null },
      select: { id: true },
    });

    const rootIds = rootComments.map((c) => c.id);

    // Đếm số lượng reply có parentId thuộc danh sách rootIds
    const replyCount = await this.prismaService.comment.count({
      where: {
        parentId: { in: rootIds },
        deletedAt: null,
      },
    });

    const total = rootComments.length + replyCount;
    return { data: total };
  }

  async getCommentsByPostId(
    postId: string,
    page = 1,
    limit = 10,
  ): Promise<ConsumerResult<any[]>> {
    const { data: comments, pagination } = await Npaginate<
      Comment & { _count: { childComment: number } }
    >({
      model: {
        findMany: this.prismaService.comment.findMany.bind(
          this.prismaService.comment,
        ),
        count: this.prismaService.comment.count.bind(
          this.prismaService.comment,
        ),
      },
      where: {
        postId: postId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            childComment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      page,
      limit,
    });

    // Lay id cac user tu comment
    const userIdList = [...new Set(comments.map((comment) => comment.userId))];

    const userInfo: User[] = (
      await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS, {
          ids: userIdList,
        }),
      )
    ).data;

    const result = comments.map((comment) => {
      const user = _.pick(
        userInfo.find((u) => u.id === comment.userId),
        ['id', 'email', 'username'],
      );
      return {
        ..._.pick(comment, ['id', 'content', 'createdAt']),
        user: user,
        childComment: comment._count.childComment,
      };
    });
    return { data: result, meta: pagination };
  }

  async getChildComment(
    dto: GetChildByParentId,
  ): Promise<ConsumerResult<any[]>> {
    const parent = await this.prismaService.comment.findUnique({
      where: {
        id: dto.parentId,
      },
    });
    if (!parent) {
      throw new RpcNotFoundException('Không tìm thấy comment cha');
    }

    const { skip, take } = paginate(
      dto.paginateParams.page,
      dto.paginateParams.limit,
    );

    const [childs, totalItem] = await Promise.all([
      this.prismaService.comment.findMany({
        where: {
          parentId: parent.id,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc', // hoặc 'desc'
        },
        skip,
        take,
      }),
      this.prismaService.comment.count({
        where: {
          parentId: parent.id,
          deletedAt: null,
        },
      }),
    ]);

    // Lay danh sach user id tu cac comment

    const userIds = [...new Set(childs.map((child) => child.userId))];

    const userInfo: User[] = (
      await firstValueFrom(
        this.authClient.send(CONSTANTS.MESSAGE_PATTERN.AUTH.GET_USERS, {
          ids: userIds,
        }),
      )
    ).data;

    // Mapping userInfo to child
    const result = childs.map((child) => {
      const user = userInfo.find((user) => user.id === child.userId);
      return {
        ..._.omit(child, [
          'parentId',
          'updatedAt',
          'deletedAt',
          'postId',
          'userId',
        ]),
        user: _.pick(user, ['id', 'email', 'username']),
      };
    });
    return {
      data: result,
      meta: {
        currentPage: dto.paginateParams.page,
        totalItem: totalItem,
        totalPage: Math.ceil(totalItem / dto.paginateParams.limit),
        limit: dto.paginateParams.limit,
      },
    };
  }

  async update(
    updateCommentDto: UpdateCommentDto,
  ): Promise<ConsumerResult<Comment>> {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id: updateCommentDto.id,
      },
    });
    if (!comment) {
      throw new RpcNotFoundException('Comment not found');
    }
    const updatedComment = await this.prismaService.comment.update({
      where: {
        id: updateCommentDto.id,
      },
      data: updateCommentDto,
    });
    return { data: updatedComment };
  }

  async delete(id: string): Promise<ConsumerResult<Comment>> {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id: id,
      },
    });
    if (!comment) {
      throw new RpcNotFoundException('Comment not found');
    }

    // soft delete
    const deletedComment = await this.prismaService.comment.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return { data: deletedComment };
  }
}
