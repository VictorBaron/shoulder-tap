import { Entity, Index, Property, Unique } from '@mikro-orm/core';
import { PersistenceEntity } from 'common/persistence-entity';
import type { OwnPersistenceEntityProperties } from 'common/types/misc';

@Entity({ tableName: 'member' })
export class MemberMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  @Unique()
  email: string;

  @Property({ type: 'varchar', length: 255 })
  name: string;

  @Property({ type: 'varchar', length: 255 })
  slackUserId: string;

  @Property({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Property({ type: 'varchar', length: 50 })
  role: string;

  @Property({ type: 'varchar', length: 255 })
  @Index()
  organizationId: string;

  static build(props: OwnPersistenceEntityProperties<MemberMikroOrm>): MemberMikroOrm {
    return Object.assign(new MemberMikroOrm(), props);
  }
}
