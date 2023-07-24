import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConfiguration, DefaultApi, Notification } from '@onesignal/node-onesignal';
import { UserService } from 'src/user/user.service';
@Injectable()
export class OneSignalService {
  private readonly client: DefaultApi;
  constructor(private readonly configService: ConfigService, private userService: UserService) {
    const configuration = createConfiguration({
      appKey: this.configService.get<string>('ONE_SIGNAL_APP_ID'),
      authMethods: {
        app_key: {
          tokenProvider: {
            getToken() {
              return configService.get<string>('ONE_SIGNAL_REST_API_TOKEN');
            },
          },
        },
      },
    });

    this.client = new DefaultApi(configuration);
  }

  async createNotification(data: any) {
    const notification = new Notification();
    const user = await this.userService.getUserByUserId(data.customer_id);
    if (!user) {
      throw new ForbiddenException('User not authorized to Munchi');
    }
    notification.app_id = this.configService.get('ONE_SIGNAL_APP_ID');
    notification.include_external_user_ids = [`${user.externalUserId}`];
    notification.android_channel_id = '80b01df2-41bb-4c44-9471-d373b035cdcd';
    notification.large_icon =
      'https://uploads-ssl.webflow.com/62517f35b07f975212c81fc0/6251801e39aff1f7c07d9c6e_munchi%20logo%20single-p-500.png';
    notification.headings = {
      en: `New Order ${data.id}`,
    };

    notification.contents = {
      en: `You have new order from  ${data.customer.name} ${data.customer.lastname}`,
    };
    try {
      await this.client.createNotification(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}
