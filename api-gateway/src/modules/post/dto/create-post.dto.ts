import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

class PostImage {
  @ApiProperty({ example: 'This is altText' })
  @IsString()
  altText: string;

  @ApiProperty({
    example:
      'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?cs=srgb&dl=pexels-souvenirpixels-414612.jpg&fm=jpg',
  })
  @IsUrl()
  url: string;
}
class PostTag {
  @ApiProperty({ example: 'e63fd118-3b3b-4ac0-96b3-3502239c756f' })
  @IsUUID()
  tagId: string;
}

export class CreatePostDto {
  @ApiProperty({ example: 'This is title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'This is content' })
  @IsString()
  content: string;

  // @ApiProperty({ example: 'e63fd118-3b3b-4ac0-96b3-3502239c756f' })
  // @IsUUID()
  // userId: string;

  @ApiProperty({ type: [PostImage], required: false })
  @IsArray()
  @IsOptional()
  postImages?: PostImage[];

  @ApiProperty({ type: [PostTag] })
  @IsArray()
  tagIds: PostTag[];
}
