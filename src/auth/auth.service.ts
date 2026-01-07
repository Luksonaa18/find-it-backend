import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './schema/auth.schema';
import { EmailService } from 'src/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}
  async register(registerDto: RegisterDto) {
    const { name, email, password, role, region, phone } = registerDto;

    const existing = await this.UserModel.findOne({ email });
    if (existing)
      throw new BadRequestException('User with this email already exists');

    const hashed = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await this.UserModel.create({
      name,
      email,
      password: hashed,
      role,
      region,
      phone,
      isVerified: false,
      verificationCode,
      verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
      verificationAttempts: 0,
    });
    await this.emailService.sendVerificationEmail(email, verificationCode);
    return {
      message: 'Registration successful. Verification code sent to email.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region,
        phone: user.phone,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.UserModel.findOne({ email }).select('+password');

    if (!user)
      throw new UnauthorizedException('User with this email does not exist');
    if (user.isBlocked) throw new ForbiddenException('Your account is blocked');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified)
      throw new UnauthorizedException('Please verify your email before logging in');

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      region: user.region,
      phone: user.phone,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region,
        phone: user.phone,
      },
    };
  }
  async verifyEmail(email: string, code: string) {
    const user = await this.UserModel.findOne({ email });
    if (!user) throw new BadRequestException('User not found');

    if (user.isVerified) return { message: 'Email already verified' };

    if (user.verificationAttempts >= 5)
      throw new BadRequestException('Too many attempts. Request new code');

    if (!user.verificationCode || !user.verificationCodeExpiry)
      throw new BadRequestException('No verification code exists');

    if (user.verificationCodeExpiry.getTime() < Date.now())
      throw new BadRequestException('Verification code expired');

    if (user.verificationCode !== code) {
      user.verificationAttempts += 1;
      await user.save();
      throw new BadRequestException('Invalid verification code');
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    user.verificationAttempts = 0;
    await user.save();

    return { message: 'Email verified successfully' };
  }
  async resendVerificationCode(email: string) {
    const user = await this.UserModel.findOne({ email });
    if (!user) throw new BadRequestException('User not found');
    if (user.isVerified) return { message: 'Email already verified' };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationAttempts = 0;

    await user.save();
    await this.emailService.sendVerificationEmail(email, code);

    return { message: 'New verification code sent' };
  }
}
