import { Entity, Property, Unique } from '@mikro-orm/core';
import { PersistenceEntity } from 'common/persistence-entity';

@Entity({ tableName: 'account' })
export class AccountMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  @Unique()
  name: string;
}
