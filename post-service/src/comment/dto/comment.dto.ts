import { IsNumber, IsObject, IsOptional, IsUUID } from 'class-validator';

class CommentPaginateParams {
  @IsNumber()
  limit: number = 5;

  @IsNumber()
  page: number = 1;
}

export class GetChildByParentId {
  @IsUUID()
  parentId: string;

  @IsObject()
  @IsOptional()
  paginateParams: CommentPaginateParams;
}
