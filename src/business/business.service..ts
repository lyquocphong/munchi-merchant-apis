import { ForbiddenException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { BusinessId, BusinessStatus } from 'src/type';
import { getEnvUrl } from 'src/utils/getEnvUrl';
import { BusinessDto } from './dto/business.dto';
const axios = require('axios');
@Injectable()
export class BusinessService {
  getBusiness(acessToken: string) {
    const options = {
      method: 'GET',
      url: `${getEnvUrl('business')}?&mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `${acessToken}`,
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
        const errorMsg = error.response.data.result;
        throw new ForbiddenException(errorMsg);
      });
    return businessResponse;
  }

  getAllBusiness(acessToken: string) {
    const options = {
      method: 'GET',
      url: ` ${getEnvUrl('business')}?type=1&mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `${acessToken}`,
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
        const errorMsg = error.response.data.result;
        throw new ForbiddenException(errorMsg);
      });
    return allBusinessResponse;
  }
  async getBusinessById(businessId: BusinessId, acessToken:string) {
    console.log(businessId)
    const options = {
      method: 'GET',
      url: `${getEnvUrl('business', businessId)}?mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `${acessToken}`,
      },
    };
    console.log(`${getEnvUrl('business', businessId)}?mode=dashboard`);
    try {
      const response = await axios.request(options);
      const businessResponseObject = response.data.result;
      const businessResponse = plainToClass(BusinessDto, businessResponseObject);
      console.log(businessResponse);
      return businessResponse;
    } catch (error) {
      const errorMsg = error.response.data.result;
      throw new ForbiddenException(errorMsg);
    }
  }

  async getBusinessOnline(businessId: BusinessId, business_status: BusinessStatus) {}

  async getBusinessOffline(businessId: BusinessId, business_status: BusinessStatus) {}
}
