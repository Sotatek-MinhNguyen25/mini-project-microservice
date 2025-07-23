import { Injectable } from '@nestjs/common';
import { AuthRepository } from 'src/auth/auth.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { ERROR_MESSAGE } from 'src/shared/message/error.message';
import * as bcrypt from 'bcryptjs';
import { OAuthProvider, Role, User, UserStatus } from '@prisma/client';
import { GetListUserDto } from './dto/get-list.dto';
import * as _ from 'lodash';
import { FindUserByIdsDto } from './dto/find-user-ids.dto';
import { paginate } from 'src/shared/utils/paginate.util';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { RpcBadRequestException } from 'src/shared/exceptions/rpc.exceptions';

@Injectable()
export class UserService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly userRepository: UserRepository,
    ) { }

    async createUser(dto: CreateUserDto): Promise<User> {
        // 1. check email
        const foundUser = await this.userRepository.findUserByEmailOrUsername(
            dto.email,
            dto.username,
        );
        if (foundUser)
            throw new RpcException({
                statusCode: 409,
                message: ERROR_MESSAGE.USER_NOT_FOUND,
                error: 'CONFLICT',
            });

        // 2. hash password
        const hashPassword = await bcrypt.hash(dto.password, 10);

        // 3. create user
        const data = {
            ...dto,
            password: hashPassword,
            roles: dto.roles?.length ? dto.roles : [Role.USER],
            status: dto.status ? dto.status : UserStatus.VERIFIED,
            oauthProvider: dto.oauthProvider ?? null,
        };
        const newUser = await this.authRepository.createUser(data);

        return newUser;
    }

    async findOneUser(id: string): Promise<Omit<User, 'password'>> {
        const foundUser = await this.authRepository.findUserById(id);
        if (!foundUser)
            throw new RpcException({
                statusCode: 400,
                message: ERROR_MESSAGE.USER_NOT_FOUND,
                error: 'BAD_REQUEST',
            });

        return _.omit(foundUser, 'password') as Omit<User, 'password'>;
    }

    async findUserByIds(dto: FindUserByIdsDto) {
        const users = await this.authRepository.findUserByIds(dto.ids);
        return (users ?? []).map((user) => _.omit(user, 'password', 'roles'))

    }

    async findListsUser(dto: GetListUserDto) {
        return await this.userRepository.findUsers(dto);
    }

    async updateUser(dto: UpdateUserDto): Promise<User> {
        const { id, ...updateData } = dto;
        const existingUser = await this.userRepository.findUserById(id);

        if (!existingUser) {
            throw new RpcException({
                statusCode: 400,
                error: 'BAD_REQUEST',
                message: ERROR_MESSAGE.USER_NOT_FOUND,
            });
        }

        if (dto.email && dto.email !== existingUser.email) {
            const foundUser = await this.authRepository.findUserByEmail(dto.email);
            if (foundUser)
                throw new RpcBadRequestException(ERROR_MESSAGE.EMAIL_ALREADY_EXISTS);
        }

        if (dto.username && dto.username !== existingUser.username) {
            const foundUser = await this.userRepository.findUserByUsername(
                dto.username,
            );
            if (foundUser)
                throw new RpcBadRequestException(ERROR_MESSAGE.USERNAME_ALREADY_EXITST);
        }

        const updatedUser = await this.userRepository.updateUser(id, updateData);

        return updatedUser;
    }

    async deleteUser(id: string): Promise<User> {
        const foundUser = await this.authRepository.findUserById(id);
        if (!foundUser)
            throw new RpcBadRequestException(ERROR_MESSAGE.USER_NOT_FOUND);

        return await this.userRepository.deleteUser(id);
    }

    async getMe(id: string): Promise<Omit<User, 'password'>> {
        return _.omit(await this.userRepository.findUserById(id), 'password')
    }
}
