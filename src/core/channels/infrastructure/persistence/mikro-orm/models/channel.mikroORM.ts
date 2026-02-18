import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { PersistenceEntity } from 'common/persistence-entity';
import type { OwnPersistenceEntityProperties } from 'common/types/misc';
import { AccountMikroOrm } from '@/accounts/infrastructure/persistence/mikro-orm';

@Entity({ tableName: 'channel' })
@Unique({ properties: ['account', 'slackChannelId'] })
export class ChannelMikroOrm extends PersistenceEntity {
  @ManyToOne(() => AccountMikroOrm)
  account?: AccountMikroOrm;

  @Property({ type: 'varchar', length: 255 })
  slackChannelId: string;

  @Property({ type: 'varchar', length: 255 })
  name: string;

  @Property({ type: 'text', default: '' })
  topic: string;

  @Property({ type: 'text', default: '' })
  purpose: string;

  @Property({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Property({ type: 'boolean', default: false })
  isArchived: boolean;

  @Property({ type: 'int', default: 0 })
  memberCount: number;

  static build(
    props: OwnPersistenceEntityProperties<ChannelMikroOrm>,
  ): ChannelMikroOrm {
    return Object.assign(new ChannelMikroOrm(), props);
  }
}
