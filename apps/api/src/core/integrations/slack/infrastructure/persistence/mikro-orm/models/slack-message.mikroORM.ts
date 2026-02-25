import { Entity, Index, Property, Unique } from '@mikro-orm/core';
import { PersistenceEntity } from 'common/persistence-entity';
import type { OwnPersistenceEntityProperties } from 'common/types/misc';

@Entity({ tableName: 'slack_message' })
@Unique({ properties: ['channelId', 'messageTs'] })
@Index({ properties: ['projectId', 'ingestedAt'] })
@Index({ properties: ['channelId', 'ingestedAt'] })
export class SlackMessageMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  organizationId: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  projectId: string | null;

  @Property({ type: 'varchar', length: 255 })
  channelId: string;

  @Property({ type: 'varchar', length: 255 })
  messageTs: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  threadTs: string | null;

  @Property({ type: 'varchar', length: 255 })
  userId: string;

  @Property({ type: 'varchar', length: 255 })
  userName: string;

  @Property({ type: 'text' })
  text: string;

  @Property({ type: 'boolean' })
  isBot: boolean;

  @Property({ type: 'boolean' })
  hasFiles: boolean;

  @Property({ type: 'int' })
  reactionCount: number;

  @Property({ type: 'int' })
  replyCount: number;

  @Property({ type: 'boolean' })
  isFiltered: boolean;

  @Property({ type: 'timestamptz' })
  ingestedAt: Date;

  static build(props: OwnPersistenceEntityProperties<SlackMessageMikroOrm>): SlackMessageMikroOrm {
    return Object.assign(new SlackMessageMikroOrm(), props);
  }
}
