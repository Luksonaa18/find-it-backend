// posts.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/schema/auth.schema';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  content: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: String, required: true })
  region: string;

  @Prop({ type: String, ref: User.name, required: true })
  author: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
