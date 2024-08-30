import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateUserRequest } from 'src/users/dto/create-user.request';
import { faker } from '@faker-js/faker';

export const database = process.env.MONGODB_URL;

beforeAll(async () => {
  await mongoose.connect(database);
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(database), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST)', () => {
    const createUserDto: CreateUserRequest = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(HttpStatus.CREATED);
  });

  it('/auth/login (POST)', () => {
    const createUserDto: CreateUserRequest = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(HttpStatus.CREATED)
      .then(() => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(createUserDto)
          .expect(HttpStatus.CREATED)
          .expect('Set-Cookie', /Authentication=.+/)
          .then((response) => {
            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();

            const cookieDescriptors = cookies[0].split(';');
            expect(cookieDescriptors[0]).toContain('Authentication');
            expect(cookieDescriptors[1]).toContain('Path');
            expect(cookieDescriptors[2]).toContain('Expires');
            expect(cookieDescriptors[3]).toContain('HttpOnly');
            expect(cookieDescriptors.length).toEqual(4);
          });
      });
  });
});
