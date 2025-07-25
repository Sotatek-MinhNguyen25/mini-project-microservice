import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { GetChildByParentId } from './dto/comment.dto';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.COMMENT.CREATE)
  create(@Payload() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.COMMENT.GET_BY_POST)
  findAll(@Payload() postId: string) {
    return this.commentService.getCommentsByPostId(postId);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.COMMENT.GET_CHILD)
  findChild(@Payload() dto: GetChildByParentId) {
    return this.commentService.getChildComment(dto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.COMMENT.UPDATE)
  update(@Payload() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(updateCommentDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.COMMENT.DELETE)
  delete(@Payload() id: string) {
    return this.commentService.delete(id);
  }
}
