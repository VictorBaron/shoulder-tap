# Drift - Project Context

## Project Overview

This is a Turborepo monorepo with a NestJS API (runs in Docker), an React app in TypeScript, and shared packages. Use `pnpm` as the package manager. Run `pnpm turbo dev` to start development.

## Workflow Rules

### Test-First Development (MANDATORY)

When implementing any feature or change in domain logic:

1. **Write behavioral tests FIRST** — Before writing any production code, write tests that describe the expected behavior using BDD-style descriptions (`should ...`).
2. **Use the test-writer agent** — Always delegate test writing to `@.claude/agents/test-writer`.
3. **Get user review on tests** — After writing the tests, STOP and present them to the user for review. Do NOT proceed with implementation until the user approves the tests.
4. **Then implement** — Only after test approval, write the production code to make the tests pass.

## Purpose

This project is named Drift.
It's a SaaS to have better Slack notifications that fits your schedule.
It notifies you if it's urgent; or at the end of your focus time-blockers or meetings.

## Technical details

Drift is a pnpm + Turborepo monorepo with two apps:
- `apps/api/` — NestJS API backend
- `apps/app/` — React app

Authentication is via Google OAuth.

### Architecture (MANDATORY)

The back-end strictly follows **Hexagonal Architecture** and **Domain Driven Design**.
Refer to these skills for guidance:
- `.claude/skills/ddd/skill.md` — DDD patterns, aggregates, entities, value objects, repositories, mappers
- `.claude/hexagonal-architecture.md` — Module structure and port/adapter constraints

This project uses hexagonal/clean architecture with domain, persistence, API, and module layers. When implementing a new domain feature, follow the pattern: entity → repository interface → MikroORM mapper/repository → module wiring → handler → tests.

When implementing CQRS command handlers, use the CommandBus pattern already established in the codebase. All handlers extend the base command handler class with built-in logger.

### Hexagonal Architecture & DDD Rules

These rules apply to ALL backend code. Follow them strictly.

**Domain Layer (innermost — no external dependencies):**

- Business logic lives inside domain entities and aggregates, NOT in services
- Aggregates are the consistency boundary — always fetch and save an aggregate as a whole
- Domain entities are plain TypeScript classes with behavior methods, NOT MikroORM entities
- Domain layer defines port interfaces (e.g., `UserRepository`, `SlackGateway`, `CalendarGateway`) — never import infrastructure code.

**Application Layer (use cases / command & query handlers):**

- Orchestrate domain objects — does NOT contain business logic itself
- Fetch aggregates via repository ports, calls domain methods, then saves via repository ports
- Use dependency injection for all ports (repositories, external API gateways)

**Infrastructure Layer (outermost — implements ports):**

- Repository implementations (e.g., `MikroORMUserRepository implements UserRepository`) live here
- Each repository uses a **mapper** to convert between the persistence model (MikroORM) and the domain model
- Mappers are pure functions: `toDomain(persistenceModel): DomainEntity` and `toPersistence(domainEntity): PersistenceModel`
- External API adapters (Slack, Google Calendar, Claude API) implement gateway port interfaces
- All infrastructure dependencies are injected via NestJS DI — never instantiate manually

**Key Rules:**

- Every database read/write goes through a repository — never call the ORM directly from application or domain layer
- Every external API call goes through a gateway interface — never call Slack/Google/Claude APIs directly from application or domain layer
- Domain models and persistence models are separate classes — always use mappers to convert between them
- Aggregates enforce their own invariants — validation logic belongs on the aggregate, not in the service
- **Dependency injection is mandatory** for all services/repositories that access external systems (database, Slack API, Google Calendar API, Claude API, etc.) — define port interfaces in domain, inject implementations via NestJS DI

## Database / ORM

For MikroORM entities: avoid composite primary keys, use `rel()` helper for setting foreign key references without loading full entities, and be careful with circular barrel-file imports which cause undefined mapper errors at runtime.

## Commands

```bash
# Install dependencies (at root)
pnpm install

# Start development (all apps in watch mode via Turbo)
pnpm dev

# Build all apps
pnpm build

# API-specific commands (run from apps/api/)
pnpm dev              # Start NestJS in watch mode
pnpm build            # Compile TypeScript
pnpm start:prod       # Run compiled API

# Electron-specific commands (run from apps/electron/)
pnpm start            # Launch Electron app
```

### Monorepo Structure

```
apps/
  api/        # NestJS backend (Hexagonal Architecture + DDD)
  electron/   # Electron desktop app
```

### API Module Organization

The API (`apps/api/`) follows NestJS modular architecture with domain-based modules.

## Tech Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Runtime:** Node 20, TypeScript (ES2021, strict mode)
- **Backend (`apps/api/`):** NestJS 11, Express 5, Passport.js
- **Desktop (`apps/electron/`):** Electron
- **Database:** PostgreSQL 16, MikroORM
- **Auth:** @nestjs/passport, passport-google-oauth20, @nestjs/jwt

## Constraints

- Do not use parent repositories in import paths:
  - Use relative imports if files are colocated, absolute imports if the file is in a parent repository
  - For absolute imports, core modules (modules inside src/core/) should be accessed through alias path @/.
    Example: @/users/domain


 ## Linting & Formatting
 
Use Biome for formatting and linting (not Prettier). 

