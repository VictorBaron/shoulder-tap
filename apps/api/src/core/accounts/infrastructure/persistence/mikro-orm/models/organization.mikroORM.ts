import { Entity, Property, Unique } from '@mikro-orm/core';
import { PersistenceEntity } from 'common/persistence-entity';
import type { OwnPersistenceEntityProperties } from 'common/types/misc';

@Entity({ tableName: 'organization' })
export class OrganizationMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  name: string;

  @Property({ type: 'varchar', length: 255 })
  @Unique()
  slackTeamId: string;

  @Property({ type: 'text' })
  slackBotToken: string;

  @Property({ type: 'jsonb' })
  slackUserTokens: Record<string, string>;

  @Property({ type: 'text', nullable: true })
  linearAccessToken: string | null;

  static build(props: OwnPersistenceEntityProperties<OrganizationMikroOrm>): OrganizationMikroOrm {
    return Object.assign(new OrganizationMikroOrm(), props);
  }
}
