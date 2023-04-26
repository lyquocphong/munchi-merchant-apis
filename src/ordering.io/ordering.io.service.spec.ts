import { Test, TestingModule } from '@nestjs/testing';
import { OrderingIoService } from './ordering.io.service';


describe('Ordering Service', () => {
  let service: OrderingIoService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrderingIoService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OrderingIoService>(OrderingIoService);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  it('Ordering service should be defined', () => {
    expect(service).toBeDefined();
  });
});

