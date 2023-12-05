import { Test, TestingModule } from '@nestjs/testing';
import { OrderingService } from './ordering.service';

describe('Ordering Service', () => {
  let service: OrderingService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrderingService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OrderingService>(OrderingService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('Ordering service should be defined', () => {
    expect(service).toBeDefined();
  });
});
