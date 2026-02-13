import { PersistenceEntity } from 'common/persistence-entity';

type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type ReadonlyKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    never,
    P
  >;
}[keyof T];

type RelationKeys<T extends PersistenceEntity> = {
  [K in keyof T]: NonNullable<T[K]> extends
    | PersistenceEntity
    | PersistenceEntity[]
    ? K
    : never;
}[keyof T];

export type OwnProperties<E extends PersistenceEntity> = Omit<
  E,
  RelationKeys<E> | keyof PersistenceEntity | ReadonlyKeys<E>
>;

export type OwnPersistenceEntityProperties<E extends PersistenceEntity> =
  OwnProperties<E> & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  };
