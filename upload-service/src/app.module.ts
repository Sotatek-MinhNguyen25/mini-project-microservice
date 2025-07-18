import { Module } from '@nestjs/common';
import { CloudinaryController } from './cloudinary/cloudinary.controller';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    CloudinaryModule,
  ],
  providers: [CloudinaryService, CloudinaryProvider],
})
export class AppModule {}