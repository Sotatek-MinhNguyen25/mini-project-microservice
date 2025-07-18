import { IsArray, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

class PostImage {
  @IsString()
  altText: string;

  @IsUrl()
  url: string;
}

class PostTag {
  @IsUUID()
  tagId: string;
}

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsUUID()
  userId: string;

  @IsArray()
  @IsOptional()
  postImages?: PostImage[];

  @IsArray()
  tagIds: PostTag[];
}
