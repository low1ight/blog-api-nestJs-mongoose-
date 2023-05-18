import { Injectable } from '@nestjs/common';
import { UsersRepository } from './repository/Users.repository';
import { CreateUserDto } from './dto/CreateUserDto';
import * as bcrypt from 'bcrypt';
import { UserDocument } from './schemas/user.schema';
import { CustomResponse } from '../utils/customResponse/CustomResponse';
import { CustomResponseEnum } from '../utils/customResponse/CustomResponseEnum';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(dto: CreateUserDto) {
    dto.password = await bcrypt.hash(dto.password, +process.env.SALT_ROUNDS);

    return await this.usersRepository.createConfirmedUser(dto);
  }

  async registerUser(dto: CreateUserDto, confirmationCode: string) {
    dto.password = await bcrypt.hash(dto.password, +process.env.SALT_ROUNDS);
    const user = await this.usersRepository.createUnconfirmedUser(
      dto,
      confirmationCode,
    );
    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async confirmUserEmail(code: string) {
    const user: UserDocument | null =
      await this.usersRepository.getUserByConfirmationCode(code);

    if (!user)
      return new CustomResponse(
        false,
        CustomResponseEnum.badRequest,
        `incorrect confirmation code`,
      );

    if (!user.isEmailCanBeConfirmed())
      return new CustomResponse(
        false,
        CustomResponseEnum.badRequest,
        `email already confirmed or`,
      );

    user.confirmEmail();

    await this.usersRepository.save(user);

    return new CustomResponse(true);
  }

  async deleteUser(id: string): Promise<boolean> {
    const isUserExist = await this.usersRepository.isUserExist(id);

    if (!isUserExist) return false;

    return await this.usersRepository.deleteUserById(id);
  }

  async isUserLoginExist(login: string) {
    return await this.usersRepository.isUserLoginExist(login);
  }

  async isEmailLoginExist(email: string) {
    return await this.usersRepository.isUserEmailExist(email);
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    return await this.usersRepository.findByLoginOrEmail(loginOrEmail);
  }
}
