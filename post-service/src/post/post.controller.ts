import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CONSTANTS } from 'constants/app.constants';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.CREATE)
  create(@Payload() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.GET)
  findAll() {
    return this.postService.findAll();
  }

  @MessagePattern('findOnePost')
  findOne(@Payload() id: number) {
    return this.postService.findOne(id);
  }

  @MessagePattern('updatePost')
  update(@Payload() updatePostDto: UpdatePostDto) {
    return this.postService.update(updatePostDto.id, updatePostDto);
  }

  @MessagePattern('removePost')
  remove(@Payload() id: number) {
    return this.postService.remove(id);
  }
}
