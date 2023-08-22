import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    return 'Hello World!';
  }

  @Cron('45 * * * * *')
  handleCron() {
      this.logger.debug('Called when the current second is 45');
      console.log("I'm CRONNING IN APP SERVICE")
  }
}
