import { EntityManager } from '@mikro-orm/postgresql';
import { QueryHandler } from '@nestjs/cqrs';

export interface TodaysUrgentMessageDTO {
  id: string;
  text: string;
  score: number;
  reasoning: string | null;
  sender: { name: string | null; email: string };
  channel: { name: string | null; type: string };
  slackLink: string;
  createdAt: string;
}

export class GetTodaysUrgentMessagesQuery {}

interface UrgentMessageRow {
  id: string;
  text: string | null;
  urgency_score: number;
  urgency_reasoning: string | null;
  created_at: Date;
  slack_channel_id: string;
  slack_channel_type: string;
  slack_team_id: string;
  sender_name: string | null;
  sender_email: string;
  channel_name: string | null;
}

@QueryHandler(GetTodaysUrgentMessagesQuery)
export class GetTodaysUrgentMessages {
  constructor(private readonly em: EntityManager) {}

  async execute(_query: GetTodaysUrgentMessagesQuery): Promise<TodaysUrgentMessageDTO[]> {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const rows: UrgentMessageRow[] = await this.em
      .getKnex()
      .select([
        'm.id',
        'm.text',
        'm.urgency_score',
        'm.urgency_reasoning',
        'm.created_at',
        'm.slack_channel_id',
        'm.slack_channel_type',
        'a.slack_team_id',
        'u.name as sender_name',
        'u.email as sender_email',
        'ch.name as channel_name',
      ])
      .from('message as m')
      .innerJoin('account as a', 'a.id', 'm.account_id')
      .innerJoin('member as mb', 'mb.id', 'm.sender_id')
      .innerJoin('user as u', 'u.id', 'mb.user_id')
      .leftJoin('channel as ch', function () {
        this.on('ch.account_id', '=', 'm.account_id').andOn('ch.slack_channel_id', '=', 'm.slack_channel_id');
      })
      .where('m.urgency_score', 5)
      .where('m.created_at', '>=', startOfToday)
      .whereNull('m.deleted_at')
      .orderBy('m.created_at', 'desc');

    return rows.map((row) => ({
      id: row.id,
      text: row.text ?? '',
      score: row.urgency_score,
      reasoning: row.urgency_reasoning,
      sender: { name: row.sender_name, email: row.sender_email },
      channel: { name: row.channel_name, type: row.slack_channel_type },
      slackLink: `slack://channel?team=${row.slack_team_id}&id=${row.slack_channel_id}`,
      createdAt: row.created_at.toISOString(),
    }));
  }
}
