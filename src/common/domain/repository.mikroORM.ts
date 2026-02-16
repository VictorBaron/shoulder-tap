import {
  EntityManager,
  type EntityName,
  type Primary,
} from '@mikro-orm/postgresql';
import { EventBus } from '@nestjs/cqrs';
import type { PersistenceEntity } from 'common/persistence-entity';

import type { AggregateRoot } from './aggregate-root';
import type { SoftDeletableEntityProps } from './entity';
import { Mapper } from './mapper';

export class RepositoryMikroORM<
  Aggregate extends AggregateRoot<SoftDeletableEntityProps>,
  StorageModel extends PersistenceEntity,
> {
  constructor(
    protected readonly em: EntityManager,
    protected readonly eventBus: EventBus,
    protected readonly mapper: Mapper<Aggregate, StorageModel>,
    protected readonly entityName: EntityName<StorageModel>,
  ) {}

  getRef(id: Primary<StorageModel>) {
    return this.em.getReference(this.entityName, id);
  }

  async save(aggregate: Aggregate): Promise<void> {
    const entity = this.mapper.toPersistence(aggregate);
    await this.em.upsert(this.entityName, entity);
    await this.em.flush();
    aggregate.publishEvents(this.eventBus);
  }

  async saveMany(aggregates: Aggregate[]): Promise<Aggregate[]> {
    const entities = aggregates.map((aggregate) =>
      this.mapper.toPersistence(aggregate),
    );
    await this.em.upsertMany(this.entityName, entities);
    await this.em.flush();

    aggregates.forEach((aggregate) => aggregate.publishEvents(this.eventBus));
    return aggregates;
  }

  async delete(aggregate: Aggregate): Promise<void> {
    const entity = this.mapper.toPersistence(aggregate);
    const ref = this.getRef(entity.id as Primary<StorageModel>);

    await this.em.remove(ref).flush();
    aggregate.publishEvents(this.eventBus);
  }

  async softDelete(aggregate: Aggregate): Promise<void> {
    aggregate.delete();
    return this.save(aggregate);
  }
}
