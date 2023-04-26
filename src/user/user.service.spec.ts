import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
describe('UserService', () => {
  let service: UserService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: { PrismaService, UtilsService, getUserByPublicId: jest.fn() },
        },
      ],
    })
      .compile();

    service = module.get<UserService>(UserService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('user service should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('User Controller', () => {
  let controller: UserController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: UserController, useValue: {} }],
    }).compile();
    controller = module.get<UserController>(UserController);
  });

  it('user controller should be defined', () => {
    expect(controller).toBeDefined();
  });
});
