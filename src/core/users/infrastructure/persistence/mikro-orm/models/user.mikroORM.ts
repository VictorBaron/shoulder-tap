import { Entity, Index, Property, Unique } from '@mikro-orm/core';
import { PersistenceEntity } from 'common/persistence-entity';

@Entity({ tableName: 'user' })
export class UserMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  @Unique()
  email: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Property({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Property({ type: 'varchar', length: 255, nullable: true })
  @Unique()
  @Index()
  googleId: string | null;
}
