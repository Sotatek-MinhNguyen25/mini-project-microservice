import { Injectable } from '@nestjs/common';
import { SocketGateway } from 'src/modules/socket/socket.gateway';
import {
  CreateDto,
  FindAllQueryDto,
  UpdateAllDto,
  UpdateOneDto,
} from './dto/notification.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class NotificationService {
  constructor(
    private socketGatway: SocketGateway,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(findAllQueryDto: FindAllQueryDto) {
    const skip = (findAllQueryDto.page - 1) * findAllQueryDto.limit;

    const [notifications, totalItem] = await Promise.all([
      this.prisma.notification.findMany({
        where: {
          receiverId: findAllQueryDto.userId,
        },
        take: findAllQueryDto.limit,
        skip: skip,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({
        where: {
          receiverId: findAllQueryDto.userId,
        },
      }),
    ]);
    return {
      data: notifications,
      meta: {
        currentPage: findAllQueryDto.page,
        totalPage: Math.ceil(totalItem / findAllQueryDto.limit),
        totalItem: totalItem,
      },
    };
  }

  async create(createDto: CreateDto) {
    const notification = await this.prisma.notification.create({
      data: {
        ...createDto,
      },
    });
    this.socketGatway.sendTrigger(notification.receiverId);
  }

  async updateOne(updateOnedto: UpdateOneDto) {
    const notification = await this.prisma.notification.findUnique({
      where: {
        id: updateOnedto.notificationId,
        receiverId: updateOnedto.userId,
      },
    });

    if (!notification) {
      throw new RpcException({
        error: 'NotFound',
        message: 'Không tồn tại thông báo',
        statusCode: 404,
      });
    }

    return await this.prisma.notification.update({
      where: {
        id: updateOnedto.notificationId,
        receiverId: updateOnedto.userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async updateAll(updateAllDto: UpdateAllDto) {
    try {
      console.log('updateAllDto', updateAllDto);
      return await this.prisma.notification.updateMany({
        where: {
          receiverId: updateAllDto.userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    } catch (error) {
      throw new RpcException({
        error: error,
        message: 'False to update many notification',
        status: 400,
      });
    }
  }
}
