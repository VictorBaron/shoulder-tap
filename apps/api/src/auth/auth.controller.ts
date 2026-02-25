import { Controller, Get, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { CurrentUser, type JwtPayload } from './current-user.decorator';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('slack')
  @Redirect()
  @Public()
  redirectToSlack() {
    const apiUrl = this.config.getOrThrow<string>('API_URL');
    return { url: `${apiUrl}/slack/install`, statusCode: 302 };
  }

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }
}
