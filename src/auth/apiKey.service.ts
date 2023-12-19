import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ApiKeyService {
  constructor(private prismaService: PrismaService) {}

  async validateApiKey(apiKey: string) {
    //get api key

    const apiKeys = await this.prismaService.apiKey.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    if (apiKeys.length === 0) {
      return 'No api key';
    }

    return apiKeys.find((apiK) => apiK.value === apiKey);
  }
}
