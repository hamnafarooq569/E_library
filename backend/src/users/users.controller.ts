import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: CreateUserDto) {
    return this.usersService.register(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@GetUser() user: { userId: number; email: string }) {
    return user; // or fetch full profile via UsersService if you prefer
  }
}
