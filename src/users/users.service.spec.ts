import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { CreateUserRequest } from './dto/create-user.request';
import { hash } from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const userModelMockRepository = {
      create: jest.fn(() => {}),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should create a user with a hashed password', async () => {
    const userData: CreateUserRequest = {
      email: 'a@test.com',
      password: 'password',
    };
    const userModelCreateSpy = jest.spyOn(userModel, 'create');

    await service.createUser(userData);

    expect(hash).toHaveBeenCalledWith('password', 10);
    expect(userModelCreateSpy).toHaveBeenCalledWith({
      email: 'a@test.com',
      password: 'hashedPassword',
    });
  });
});
