import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async register(dto: CreateUserDto) {
    if (await this.usersRepo.findOne({ where: { email: dto.email } })) {
      throw new ConflictException('Email already registered');
    }

    const user = this.usersRepo.create({
      email: dto.email,
      name: dto.name,
      passwordHash: await bcrypt.hash(dto.password, 10),
    });

    try {
      const saved = await this.usersRepo.save(user);
      const { passwordHash, ...safe } = saved; // remove passwordHash
      return safe;
    } catch {
      throw new InternalServerErrorException('Could not create user');
    }
  }

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }
}
