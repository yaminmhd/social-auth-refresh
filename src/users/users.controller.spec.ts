import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './schema/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserRequest } from './dto/create-user.request';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const userModelMockRepository = {
      create: jest.fn(() => {}),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            getUsers: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: userModelMockRepository,
        },
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  it('should call createUser with correct request payload', async () => {
    const createUserDto: CreateUserRequest = {
      email: 'testUser@test.com',
      password: 'testPassword',
    };

    jest
      .spyOn(usersService, 'createUser')
      .mockResolvedValue(Promise.resolve(new User()));

    await controller.createUser(createUserDto);

    expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
  });

  it('should call getUsers with array of users', async () => {
    const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];

    jest.spyOn(usersService, 'getUsers').mockResolvedValue(mockUsers as any);

    const mockUser: User = { _id: 'currentUserId' } as any;

    const result = await controller.getUsers(mockUser);

    expect(usersService.getUsers).toHaveBeenCalled();
    expect(result).toEqual(mockUsers);
  });
});
