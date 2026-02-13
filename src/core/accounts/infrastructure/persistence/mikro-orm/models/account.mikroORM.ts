import { Entity, Property, Unique } from '@mikro-orm/core';
import { PersistenceEntity } from 'common/persistence-entity';
import { OwnProperties } from 'common/types/misc';

@Entity({ tableName: 'account' })
export class AccountMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  @Unique()
  name: string;

  static build(props: OwnProperties<AccountMikroOrm>): AccountMikroOrm {
    return Object.assign(new AccountMikroOrm(), props);
  }
}
