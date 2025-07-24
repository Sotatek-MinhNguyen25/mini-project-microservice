import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { PostQueryDto } from './dto/post-query.dto';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.POST.CREATE)
  async create(@Payload() createPostDto: CreatePostDto) {
    return await this.postService.create(createPostDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.POST.GET)
  async findAll(postQueryDto: PostQueryDto) {
    return await this.postService.findAll(postQueryDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.POST.GET_DETAIL)
  async findOne(@Payload() id: string) {
    return await this.postService.findOne(id);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.POST.UPDATE)
  update(@Payload() updatePostDto: UpdatePostDto) {
    return this.postService.update(updatePostDto.id, updatePostDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.POST.DELETE)
  delete(@Payload() id: string) {
    return this.postService.delete(id);
  }
}
