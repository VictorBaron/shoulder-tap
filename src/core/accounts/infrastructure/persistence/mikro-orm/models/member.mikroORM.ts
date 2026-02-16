import { Entity, Index, Property, Unique } from '@mikro-orm/core';
import { PersistenceEntity } from 'common/persistence-entity';
import type { OwnPersistenceEntityProperties } from 'common/types/misc';

import type { MemberRoleLevel } from '@/accounts/domain';

@Entity({ tableName: 'member' })
@Unique({ properties: ['accountId', 'userId'] })
@Index({ properties: ['accountId'], name: 'idx_member_accountId' })
@Index({ properties: ['userId'], name: 'idx_member_userId' })
export class MemberMikroOrm extends PersistenceEntity {
  @Property({ type: 'uuid' })
  accountId: string;

  @Property({ type: 'uuid' })
  userId: string;

  @Property({ type: 'varchar', length: 50 })
  role: MemberRoleLevel;

  @Property({ type: 'timestamptz', nullable: true })
  invitedAt: Date | null;

  @Property({ type: 'timestamptz', nullable: true })
  activatedAt: Date | null;

  @Property({ type: 'timestamptz', nullable: true })
  disabledAt: Date | null;

  @Property({ type: 'uuid', nullable: true })
  invitedById: string | null;

  @Property({ type: 'timestamptz', nullable: true })
  lastActiveAt: Date | null;

  @Property({ type: 'jsonb' })
  preferences: Record<string, unknown>;

  static build(
    props: OwnPersistenceEntityProperties<MemberMikroOrm>,
  ): MemberMikroOrm {
    return Object.assign(new MemberMikroOrm(), props);
  }
}
