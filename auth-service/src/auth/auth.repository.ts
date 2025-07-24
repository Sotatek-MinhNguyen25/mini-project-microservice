import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { RpcBadRequestException } from 'src/shared/exceptions/rpc.exceptions';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) { }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (!email) throw new RpcBadRequestException('Email is required');
    return await this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({ where: { id, deletedAt: null }, data });
  }

  async findUserByIds(ids: string[]): Promise<User[] | null> {
    return this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
