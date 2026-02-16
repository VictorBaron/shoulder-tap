import type { AggregateRoot } from './aggregate-root';
import type { SoftDeletableEntityProps } from './entity';

export abstract class RepositoryPort<
  T extends AggregateRoot<SoftDeletableEntityProps>,
> {
  abstract save(aggregate: T): Promise<void>;
}
