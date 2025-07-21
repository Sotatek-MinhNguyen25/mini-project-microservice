import { Injectable } from '@nestjs/common';
import { AuthRepository } from 'src/auth/auth.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { RpcException } from '@nestjs/microservices';
import { ERROR_MESSAGE } from 'src/shared/message/error.message';
import * as bcrypt from 'bcryptjs';
import { OAuthProvider, Role, User, UserStatus } from '@prisma/client';
import { GetListUserDto } from './dto/get-list.dto';
import * as _ from 'lodash';

@Injectable()
export class UserService {
  constructor(private readonly authRepository: AuthRepository) {}

  async createUser(dto: CreateUserDto): Promise<{ data: User }> {
    // 1. check email
    const foundUser = await this.authRepository.findUserByEmail(dto.email);
    if (foundUser)
      throw new RpcException({
        statusCode: 409,
        message: ERROR_MESSAGE.EMAIL_ALREADY_EXISTS,
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

    return { data: newUser };
  }

  async findOneUser(id: string): Promise<{ data: Omit<User, 'password'> }> {
    const foundUser = await this.authRepository.findUserById(id);
    if (!foundUser)
      throw new RpcException({
        statusCode: 400,
        message: ERROR_MESSAGE.USER_NOT_FOUND,
        error: 'BAD_REQUEST',
      });
    console.log(foundUser);

    return { data: _.omit(foundUser, 'password') as Omit<User, 'password'> };
  }

  async findListsUser(dto: GetListUserDto) {}
}
