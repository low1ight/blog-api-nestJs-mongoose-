import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from '../repositories/users.query.repository';
import {
  UserInputQueryType,
  userQueryMapper,
} from '../../utils/query-mappers/user-query-mapper';
import { CreateUserDto } from '../dto/CreateUserDto';
import { UsersSaService } from '../application/users.sa.service';
import { CustomResponseEnum } from '../../utils/customResponse/CustomResponseEnum';
import { BasicAuthGuard } from '../../auth/guards/basic.auth.guard';
import { Exceptions } from '../../utils/throwException';
import { BanUserDto } from '../dto/BanUserDto';

@Controller('sa/users')
export class UsersSaController {
  constructor(
    private readonly userQueryRepository: UsersQueryRepository,
    private readonly userService: UsersSaService,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getUsers(@Query() query: UserInputQueryType) {
    const userQuery = userQueryMapper(query);

    return await this.userQueryRepository.getUsers(userQuery);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  async createUser(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }

  @Put(':id/ban')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async banUnbanUser(@Param('id') id: string, @Body() dto: BanUserDto) {
    const result: boolean = await this.userService.banUnbanUser(id, dto);
    if (!result) Exceptions.throwHttpException(CustomResponseEnum.notExist);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    const isDeleted = await this.userService.deleteUser(id);

    if (!isDeleted)
      return Exceptions.throwHttpException(CustomResponseEnum.notExist);

    return;
  }
}