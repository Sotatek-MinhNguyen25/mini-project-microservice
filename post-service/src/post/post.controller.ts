import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CONSTANTS } from 'constants/app.constants';

@Controller()
export class PostController {
  constructor(private readonly postService: PostService) {}

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.POST.CREATE)
  async create(@Payload() createPostDto: CreatePostDto) {
    return await this.postService.create(createPostDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.POST.GET)
  async findAll() {
    return await this.postService.findAll();
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.POST.GET_DETAIL)
  async findOne(@Payload() id: string) {
    return await this.postService.findOne(id);
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
