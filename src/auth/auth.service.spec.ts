import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare } from 'bcryptjs';
import { Types } from 'mongoose';
import { UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/schema/user.schema';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            getUser: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should set cookie with access token', async () => {
      const mockUser: User = {
        _id: {
          toHexString: jest.fn().mockReturnValue('user-id-1'),
        },
      } as any;

      const response = {
        cookie: jest.fn(),
      } as any;

      configService.getOrThrow.mockReturnValueOnce('3600000');
      configService.getOrThrow.mockReturnValueOnce('secret');
      configService.getOrThrow.mockReturnValueOnce('3600000');
      jwtService.sign.mockReturnValueOnce('access-token');

      await service.login(mockUser, response);

      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'JWT_ACCESS_TOKEN_SECRET',
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { userId: 'user-id-1' },
        {
          secret: 'secret',
          expiresIn: '3600000ms',
        },
      );
      expect(response.cookie).toHaveBeenCalledWith(
        'Authentication',
        'access-token',
        {
          expires: expect.any(Date),
          httpOnly: true,
          secure: false,
        },
      );
    });
  });

  describe('verifyUser', () => {
    it('should verify and return user when passwords match', async () => {
      const user = {
        _id: 'user-id-1' as unknown as Types.ObjectId,
        email: 'test@test.com',
        password: 'hashed-password',
      };
      usersService.getUser.mockResolvedValue(user);
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyUser('test@example.com', 'password');

      expect(usersService.getUser).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(compare).toHaveBeenCalledWith('password', 'hashed-password');
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const user = {
        _id: 'user-id-1' as unknown as Types.ObjectId,
        email: 'test@test.com',
        password: 'hashed-password',
      };
      usersService.getUser.mockResolvedValue(user);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.verifyUser('test@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.getUser.mockRejectedValue(new Error('user not found'));

      await expect(
        service.verifyUser('notuser@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
