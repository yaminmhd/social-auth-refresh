import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './schema/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserRequest } from './dto/create-user.request';

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
          provide: getModelToken(User.name),
          useValue: userModelMockRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  it('should call UsersService with correct data', async () => {
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
});
