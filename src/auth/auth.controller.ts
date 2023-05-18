import {
  Controller,
  Request,
  Post,
  UseGuards,
  Ip,
  Res,
  Body,
  HttpCode,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local.auth.guard';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh.token.guard.';
import { CreateUserDto } from '../users/dto/CreateUserDto';
import { ConfirmEmailDto } from './dto/ConfirmEmailDto';
import { UsersService } from '../users/users.service';
import { CustomResponse } from '../utils/customResponse/CustomResponse';
import { EmailResendingDto } from './dto/EmailResendingDto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    @Ip() ip,
    @Res({ passthrough: true }) response: Response,
  ) {
    const id = req.user._id.toString();
    const login = req.user.userData.login;
    const title = req.headers['user-agent'];

    const { refreshToken, accessToken } = await this.authService.login(
      id,
      login,
      title,
      ip,
    );
    //add httponly + secure
    response.cookie('refreshToken ', refreshToken);

    return { accessToken };
  }

  @Post('registration')
  @HttpCode(204)
  async register(@Body() dto: CreateUserDto) {
    await this.authService.registration(dto);
  }
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() dto: EmailResendingDto) {
    await this.authService.registrationEmailResending(dto.email);
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() dto: ConfirmEmailDto) {
    const response: CustomResponse<any> =
      await this.usersService.confirmUserEmail(dto.code);

    if (!response.isSuccess)
      CustomResponse.throwHttpException(response.errStatusCode);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh-token')
  async refreshToken(
    @Request() req,
    @Ip() ip,
    @Res({ passthrough: true }) response: Response,
  ) {
    const title = req.headers['user-agent'];

    const { userId, login, deviceId } = req.user;

    const { refreshToken, accessToken } =
      await this.authService.updateJwtTokens(
        userId,
        login,
        deviceId,
        title,
        ip,
      );

    response.cookie('refreshToken ', refreshToken);

    return { accessToken };
  }
}
