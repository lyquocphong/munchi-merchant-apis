import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConfiguration, DefaultApi, Notification } from '@onesignal/node-onesignal';
import { NotificationProperties, PushNotificationChannel, PushNotificationTemplate } from './onesignal.type'

@Injectable()
export class OneSignalService {
    private readonly client: DefaultApi;
    private readonly logger = new Logger(OneSignalService.name);

    constructor(private readonly configService: ConfigService) {
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

    private createNotification(notificationProperties: NotificationProperties) {
        const notification = new Notification();
        notification.app_id = this.configService.get('ONE_SIGNAL_APP_ID');

        for (const key in notificationProperties) {
            if (!notification.hasOwnProperty(key)) {
                notification[key] = notificationProperties[key];
            }
        }

        return notification;
    }

    async pushOpenAppNotification(externalIds: string[], language: string = 'en') {
        const notification = this.createNotification({
            include_player_ids: externalIds,
            android_channel_id: PushNotificationChannel.NEW_MERCHANT_APP_CHANNEL,
            template_id: PushNotificationTemplate.OPEN_APP_REMINDER
        });

        try {
            await this.client.createNotification(notification);
        } catch (error) {
            this.logger.error(`Error creating open app notification to: ${JSON.stringify(externalIds)}`);
            this.logger.error(error);
            throw error;
        }
    }
}