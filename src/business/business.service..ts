import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  BusinessId,
  BusinessStatus,
} from 'src/ts';
import { GetEnvUrl } from 'src/utils/getEnvUrl';
const axios = require('axios');
@Injectable()
export class BusinessService {
  getBusiness(token: string) {
    const options = {
      method: 'GET',
      url: GetEnvUrl('business'),
      headers: {
        accept: 'application/json',
        Authorization: `${token}`,
      },
    };

    const businessResponse = axios
      .request(options)
      .then(function (response: any) {
        console.log(response.data);
        const data = response.data.result;
        return data;
      })
      .catch(function (error: any) {
        const errorMsg =
          error.response.data.result;
        throw new ForbiddenException(errorMsg);
      });
    return businessResponse;
  }
  getAllBusiness(token: string) {
    const options = {
      method: 'GET',
      url: ` ${GetEnvUrl(
        'business',
      )}?type=1&mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `${token}`,
      },
    };

    const allBusinessResponse = axios
      .request(options)
      .then(function (response: any) {
        console.log(response.data);
        const data = response.data.result;
        return data;
      })
      .catch(function (error: any) {
        const errorMsg =
          error.response.data.result;
        throw new ForbiddenException(errorMsg);
      });
    return allBusinessResponse;
  }
  async getBusinessOnline(
    businessId: BusinessId,
    business_status: BusinessStatus,
  ) {}
  async getBusinessOffline(
    businessId: BusinessId,
    business_status: BusinessStatus,
  ) {}
}
