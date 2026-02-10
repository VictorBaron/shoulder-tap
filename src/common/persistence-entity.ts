import { PrimaryKey, Property } from '@mikro-orm/core';

export abstract class PersistenceEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'timestamptz' })
  createdAt: Date;

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  updatedAt: Date;

  @Property({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
