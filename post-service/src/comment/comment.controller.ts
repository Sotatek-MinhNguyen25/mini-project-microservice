import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CONSTANTS } from 'src/common/constants/app.constants';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.COMMENT.CREATE)
  create(@Payload() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @MessagePattern('findAllComment')
  findAll(@Payload() postId: string) {
    return this.commentService.getCommentsByPostId(postId);
  }

  @MessagePattern('updateComment')
  update(@Payload() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(updateCommentDto);
  }

  @MessagePattern('deleteComment')
  remove(@Payload() id: string) {
    return this.commentService.delete(id);
  }
}
