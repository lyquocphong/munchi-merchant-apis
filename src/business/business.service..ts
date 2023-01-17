import { ForbiddenException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { BusinessDto } from './dto/business.dto';
import axios from 'axios';
import { UtilsService } from 'src/utils/utils.service';
@Injectable()
export class BusinessService {
  constructor(private utils: UtilsService) {}
  getAllBusiness(accessToken: string) {
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('business')}?type=1&params=zones%2Cname&mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
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
  async getBusinessById(businessId: number, accessToken: string) {
    console.log(businessId);
    const options = {
      method: 'GET',
      url: `${this.utils.getEnvUrl('business', businessId)}?mode=dashboard`,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    console.log(`${this.utils.getEnvUrl('business', businessId)}?mode=dashboard`);
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

  async getBusinessOnline(businessId: number, businessStatus: boolean, accessToken: string) {
    const options = {
      method: 'PUT',
      url: `${this.utils.getEnvUrl('business', businessId)}?mode=dashboard`,
      data: { enabled: businessStatus },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.request(options);
      const businessResponseObject = response.data.result;
      const businessResponse = plainToClass(BusinessDto, businessResponseObject);
      console.log(businessResponse);
      return `Business Online , data: {${businessResponse}}`;
    } catch (error) {
      const errorMsg = error.response.data.result;
      throw Error(errorMsg);
    }
  }

  async getBusinessOffline(businessId: number, businessStatus: boolean, accessToken: string) {
    const options = {
      method: 'PUT',
      url: `${this.utils.getEnvUrl('business', businessId)}?mode=dashboard`,
      data: { enabled: businessStatus },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await axios.request(options);
      const businessResponseObject = response.data.result;
      const businessResponse = plainToClass(BusinessDto, businessResponseObject);
      console.log(businessResponse);
      return `Business Offline , data: {${businessResponse}}`;
    } catch (error) {
      const errorMsg = error.response.data.result;
      throw Error(errorMsg);
    }
  }
}
