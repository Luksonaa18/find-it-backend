import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/auth/schema/auth.schema';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @Body() dto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    return this.postsService.createPost(dto, user, file);
  }

  @Get()
  async getAllPosts() {
    return this.postsService.getPosts();
  }

  @Get('region/:region')
  @UseGuards(JwtAuthGuard)
  async getPostsByRegion(@Param('region') region: string) {
    return this.postsService.getPostsByRegion(region);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postsService.editPost(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') id: string) {
    return await this.postsService.deletePost(id);
  }


}
