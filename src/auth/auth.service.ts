import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, UpdateAuthDto, LoginDto, RegisterUserDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {
    console.log('AuthService initialized with userModel:', this.userModel);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      console.log(createUserDto);
      const { password, ...userDatas } = createUserDto;
      // 1- Encriptar la contraseña
      const newUser = new this.userModel({
        password: bcrypt.hashSync(password, 10),
        ...userDatas
      });
      // 2- Crear el usuario
      await newUser.save();
      const { password: _, ...user } = newUser.toJSON();
      return user;
    } catch (error) {
      console.log(error.code);
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists`);
      }
      throw new InternalServerErrorException('Something went wrong terrible happen!!!')
    }
  }

  async register(registerDto: RegisterUserDto): Promise<LoginResponse> {
  
    const user = await this.create(registerDto);
    console.log(user);
    
    return {
      user: user,
      token: this.getJwtToken({ id: user._id }),
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    /**
     * User { _id, name, email, roles, }
     * Token -> JWT
     */
    console.log(loginDto);
    const {email, password} = loginDto;
    
    const user = await this.userModel.findOne({ email });
    if(!user) {
      throw new UnauthorizedException('Not valid credentials - email');
    }
    
    if(!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const {password:_, ...rest} = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest} = user.toJSON();
    return rest;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}
