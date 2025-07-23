import { Controller } from '@nestjs/common';
import { TagService } from './tag.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateTagDto, PostTagDto, UpdateTagDto } from './tag.dto';
import { CONSTANTS } from 'src/common/constants/app.constants';

@Controller()
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.TAG.GET_TAGS)
  getTags() {
    return this.tagService.getTags();
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.TAG.CREATE_TAG)
  createTag(@Payload() createTagDto: CreateTagDto) {
    return this.tagService.createTag(createTagDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.TAG.UPDATE_TAG)
  updateTag(@Payload() updateTagDto: UpdateTagDto) {
    return this.tagService.updateTag(updateTagDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.TAG.DELETE_TAG)
  deleteTag(@Payload() id: string) {
    return this.tagService.deleteTag(id);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.TAG.GET_BY_POST_ID)
  getTagsByPostId(@Payload() id: string) {
    return this.tagService.getTagsByPostId(id);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.TAG.CREATE_POST_TAG)
  createPostTag(@Payload() PostTagDto: PostTagDto) {
    return this.tagService.createPostTag(PostTagDto);
  }

  @MessagePattern(CONSTANTS.MESSAGE_PATTERN.TAG.DELETE_POST_TAG)
  deletePostTag(@Payload() PostTagDto: PostTagDto) {
    return this.tagService.deletePostTag(PostTagDto);
  }
}
