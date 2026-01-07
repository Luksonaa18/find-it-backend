import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllUsers() {
    const users = await this.userService.findAll();
    if (!users) throw new NotFoundException('No users found');
    return users;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    console.log('JWT payload:', req.user);
    const userId = req.user._id;
    if (!userId) throw new NotFoundException('User ID missing in JWT');
    const foundUser = await this.userService.findById(userId)
    if (!foundUser) throw new NotFoundException('User not found');
    return foundUser;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('admin/role/:id')
  updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.userService.updateRole(id, role);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('block/:id')
  blockUser(@Param('id') id: string) {
    return this.userService.blockUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('unblock/:id')
  unblockUser(@Param('id') id: string) {
    return this.userService.unblockUser(id);
  }
}
