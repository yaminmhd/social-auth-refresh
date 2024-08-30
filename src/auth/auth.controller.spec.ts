import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/users/schema/user.schema';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { LocalAuthGuard } from './guards/local-auth-guard';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: APP_GUARD,
          useClass: LocalAuthGuard,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should call AuthService.login with the correct parameters', async () => {
    const mockUser: User = { _id: 'user-id' } as any;
    const mockResponse = {
      cookie: jest.fn(),
    } as unknown as Response;

    await controller.login(mockUser, mockResponse);

    expect(authService.login).toHaveBeenCalledWith(mockUser, mockResponse);
  });

  it('should UnauthorizedException if user is not authenticated', async () => {
    jest.spyOn(authService, 'login').mockImplementation(() => {
      throw new UnauthorizedException();
    });

    const mockUser: User = { _id: 'user-id' } as any;
    const mockResponse = {
      cookie: jest.fn(),
    } as unknown as Response;

    await expect(controller.login(mockUser, mockResponse)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
