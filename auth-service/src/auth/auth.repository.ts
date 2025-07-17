import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, OTP, OTP_Purpose } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({ where: { id }, data });
  }

  async createOTP(data: {
    userId?: string | null;
    email?: string;
    purpose: OTP_Purpose;
    code?: string;
    expiresAt?: Date;
  }): Promise<OTP> {
    let userId = data.userId;
    if (!userId && data.email) {
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (user) userId = user.id;
    }
    if (!userId) throw new Error('UserId is required to create OTP');
    const code = data.code || Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = data.expiresAt || new Date(Date.now() + 10 * 60 * 1000);
    return await this.prisma.oTP.upsert({
      where: {
        userId_purpose: {
          userId,
          purpose: data.purpose,
        },
      },
      update: { code, expiresAt },
      create: {
        userId,
        code,
        purpose: data.purpose,
        expiresAt,
      },
    });
  }

  async findOTP(userId: string, purpose: OTP_Purpose): Promise<OTP | null> {
    return await this.prisma.oTP.findUnique({
      where: {
        userId_purpose: {
          userId,
          purpose,
        },
      },
    });
  }

  async updateOTP(id: string, data: Partial<OTP>): Promise<OTP> {
    return await this.prisma.oTP.update({ where: { id }, data });
  }

  async findOTPByEmail(email: string, purpose: OTP_Purpose): Promise<OTP | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return await this.findOTP(user.id, purpose);
  }

  async deleteOTP(otpId: string): Promise<OTP> {
    return await this.prisma.oTP.delete({ where: { id: otpId } });
  }
}
