# Implement Domain Feature
1. Create domain entity in `packages/api/src/<module>/domain/` following the pattern in @apps/api/src/core/channels/domain/aggregates/channel.aggregate.ts
2. Create repository interface in `domain/ports/`
3. Create MikroORM entity mapper in `persistence/`
4. Create MikroORM and InMemory repositories in `persistence/`
5. Wire into NestJS module
6. Create command + handler using base command handler class
7. Write tests following existing patterns
8. Run `pnpm turbo build` and `pnpm turbo test` to verify
