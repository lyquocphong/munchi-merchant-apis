import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';

describe('Business Service', () => {
  let service: BusinessService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BusinessService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('business service should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('Business Controller', () => {
  let controller: BusinessController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BusinessController,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BusinessController>(BusinessController);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('business controller should be defined', () => {
    expect(controller).toBeDefined();
  });
});
