import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schema/auth.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async findById(id: string): Promise<Partial<User> | null> {
    return this.userModel
      .findById(id)
      .select('-password')
      .lean() 
      .exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).lean().exec();
  }
  async updateRole(userId: string, role: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { role },
        { new: true, projection: '-password' }
      )
      .lean()
      .exec();
  }

  async findAll(): Promise<Partial<User>[]> {
    return this.userModel.find().select('-password').lean().exec();
  }

  async blockUser(userId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { isBlocked: true },
        { new: true, projection: '-password' }
      )
      .lean()
      .exec();
  }

  async unblockUser(userId: string) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { isBlocked: false },
        { new: true, projection: '-password' }
      )
      .lean()
      .exec();
  }
}
