import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'oidc') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.getOrThrow(
        'OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_ID',
      ),
      clientSecret: configService.getOrThrow(
        'OAUTH2_CLIENT_REGISTRATION_LOGIN_CLIENT_SECRET',
      ),
      callbackURL: configService.getOrThrow(
        'OAUTH2_CLIENT_REGISTRATION_LOGIN_REDIRECT_URI',
      ),
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    return this.usersService.getOrCreateUser({
      email: profile.emails[0]?.value,
      password: '',
    });
  }
}
