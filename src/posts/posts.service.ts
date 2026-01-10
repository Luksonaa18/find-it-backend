import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/auth/schema/auth.schema';
import { Post } from './schema/posts.schema';
import { UpdatePostDto } from './dto/update-post.dto';
import { S3Service } from 'src/s3.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private s3Service: S3Service,
  ) {}

  async createPost(dto: CreatePostDto, user: User, file?: Express.Multer.File) {
    if (!user) throw new Error('No user found. Are you authenticated?');
    if (!user.region)
      throw new Error(
        `User region is missing! User data: ${JSON.stringify(user)}`,
      );
    let imageUrl: string | undefined;
    if (file) {
      const filename = `${Date.now()}-${file.originalname}`;
      imageUrl = await this.s3Service.uploadFileBuffer(
        file.buffer,
        filename,
        file.mimetype,
      );
    }

    const post = new this.postModel({
      ...dto,
      author: user._id,
      region: user.region,
      imageUrl,
    });

    await post.save();
    return post.populate('author', '_id name region phone');
  }

  async getPosts() {
    return this.postModel
      .find()
      .populate('author', '_id name region phone')
      .exec();
  }

  async getPostsByRegion(region: string) {
    return this.postModel
      .find({ region })
      .populate('author', '_id name region phone')
      .exec();
  }
async editPost(
  id: string,
  dto: UpdatePostDto,
  user: User,
  file?: Express.Multer.File,
) {
  const post = await this.postModel.findById(id);
  if (!post) throw new Error('Post not found');

  if (post.author.toString() !== user._id.toString()) {
    throw new Error('You are not allowed to edit this post');
  }

  if (dto.content !== undefined) {
    post.content = dto.content;
  }

  if (file) {
    const filename = `${Date.now()}-${file.originalname}`;
    post.imageUrl = await this.s3Service.uploadFileBuffer(
      file.buffer,
      filename,
      file.mimetype,
    );
  }

  await post.save();
  return post.populate('author', '_id name region phone');
}


  async deletePost(id: string) {
    return await this.postModel.findByIdAndDelete(id);
  }
}
