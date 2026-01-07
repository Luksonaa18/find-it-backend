import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/posts.schema';

import { S3Service } from 'src/s3.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService,S3Service],
  exports: [PostsService],
})
export class PostsModule {}
