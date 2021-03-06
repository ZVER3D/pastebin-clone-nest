import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PastesService } from 'src/pastes/pastes.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly pastesService: PastesService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.pastesService.removeExpired();
    this.logger.log('Expired pastes have been removed.');
  }
}
