import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetListUserDto } from './dto/get-list.dto';
import { paginate } from 'src/shared/utils/paginate.util';
import { OAuthProvider, Prisma, User, UserStatus } from '@prisma/client';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findUsers(dto: GetListUserDto) {
        const where: Prisma.UserWhereInput = {};

        if (dto.search) {
            where.OR = [
                { email: { contains: dto.search, mode: 'insensitive' } },
                { username: { contains: dto.search, mode: 'insensitive' } },
            ];
        }

        if (dto.roles && dto.roles.length > 0) {
            where.roles = { hasSome: dto.roles };
        }

        if (dto.status) {
            where.status = UserStatus[dto.status];
        }

        if (dto.oauthProvider) {
            where.oauthProvider = OAuthProvider[dto.oauthProvider]
        }

        const orderBy: Prisma.UserOrderByWithRelationInput = {
            [dto.sortBy || 'createdAt']: (dto.sortOrder?.toLowerCase() || 'desc') as 'asc' | 'desc',
        };

        return paginate({
            model: this.prisma.user,
            page: dto.page,
            limit: dto.limit,
            where,
            orderBy,
        });
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
}
