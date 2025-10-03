import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/users/entities/user.entity'; // 👈 import Role enum

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash, ...safe } = user;
    return safe; // safe now has id, email, name, role
  }

  async signToken(userId: number, email: string, role: Role) {
    const payload = { sub: userId, email, role };
    return { accessToken: await this.jwt.signAsync(payload) };
  }
}
