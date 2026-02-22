import { Body, Controller, Get, HttpCode, type MessageEvent, Post, Sse } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StartFocusTimeCommand } from '@/accounts/application/commands/start-focus-time';
import {
  GetTodaysUrgentMessagesQuery,
  type TodaysUrgentMessageDTO,
} from '@/messages/application/queries/get-todays-urgent-messages';
import { SseUrgentNotificationGateway } from '../gateways/sse-urgent-notification.gateway';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly gateway: SseUrgentNotificationGateway,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('urgent')
  async getTodaysUrgent(): Promise<TodaysUrgentMessageDTO[]> {
    return this.queryBus.execute(new GetTodaysUrgentMessagesQuery());
  }

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.gateway.getStream().pipe(map((payload) => ({ data: payload })));
  }

  @Post('focus')
  @HttpCode(204)
  async startFocus(@Body() body: { slackUserId: string; teamId: string; minutes?: number }): Promise<void> {
    await this.commandBus.execute(
      new StartFocusTimeCommand({
        slackUserId: body.slackUserId,
        teamId: body.teamId,
        minutes: body.minutes ?? 30,
      }),
    );
  }
}
