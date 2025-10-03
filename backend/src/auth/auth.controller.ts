import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/dto/login-user.dto';
import { Role } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto) {
    // validateUser returns the safe user (without passwordHash)
    const user = await this.auth.validateUser(dto.email, dto.password);

    // now pass role into signToken
    const token = await this.auth.signToken(user.id, user.email, user.role as Role);

    return { user, ...token };
  }
}
