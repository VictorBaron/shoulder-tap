# Drift V1 — Spécifications Techniques & Plan de Build

## Table des Matières

- [0. Contexte Produit](#0-contexte-produit)
- [1. Architecture Technique](#1-architecture-technique)
- [2. Modèle de Données](#2-modèle-de-données)
- [3. Plan de Build](#3-plan-de-build) — voir fichiers individuels par étape
- [4. Prompt LLM — Spécification Complète](#4-prompt-llm)
- [5. Structure JSON du Rapport Généré](#5-structure-json-du-rapport)
- [Annexe A: API Reference par Intégration](#annexe-a-api-reference)
- [Annexe B: Prototype UI Reference](#annexe-b-prototype-ui-reference)

## 0. Contexte Produit

### Qu'est-ce que Drift

Drift est un outil d'intelligence projet pour les duos CTO/CPO. Il lit automatiquement Slack, Linear et Notion pour générer un status hebdomadaire structuré de chaque projet — incluant les décisions prises, les blockers, l'avancement delivery, et surtout la détection de **drift** (divergence entre l'intention produit initiale et ce qui se construit réellement).

### Proposition de valeur

> "Drift lit vos conversations Slack, vos tickets Linear et vos specs Notion pour générer la vue projet que Product et Engineering partagent. Plus de 'on n'était pas alignés'. Plus de 'je croyais que c'était décidé'."

### Audience V1

- **Buyer principal** : CTO ou CPO de startups/scale-ups tech (20-80 personnes)
- **Co-bénéficiaire** : Le binôme CTO+CPO reçoit le même rapport comme source de vérité partagée
- **Stack requise** : Slack + Linear + Notion

### Ce que V1 fait

1. **Ingestion automatique** : Lit les messages Slack (channels sélectionnés), les tickets Linear (projet mappé), et une page Notion (spec/brief) par projet
2. **Synthèse LLM** : Génère un rapport structuré hebdomadaire par projet
3. **Détection de drift** : Compare ce qui se construit vs l'intention produit documentée
4. **Delivery** : Envoie le rapport par DM Slack + dashboard web consultable
5. **Portfolio view** : Vue agrégée de tous les projets pour le duo CTO/CPO

### Ce que V1 ne fait PAS

- Pas de write-back (on ne crée rien dans Slack/Linear/Notion)
- Pas de Jira/GitHub/Figma (V2+)
- Pas de multi-workspace Slack
- Pas de SSO/SAML
- Pas de billing automatique (Stripe V2)
- Pas d'historique long-terme / decision log (V2)

---

## 1. Architecture Technique

### Stack

| Composant | Techno | Justification |
|-----------|--------|---------------|
| Backend API | **NestJS** (TypeScript) | Existant, modulaire, DI native |
| Base de données | **PostgreSQL 16** | JSONB pour stocker les données brutes, full-text search |
| ORM | **MikroORM** | Migrations, type-safety, hexagonal architecture (domain ≠ persistence models) |
| LLM | **Claude API** (Sonnet 4) | Meilleur rapport qualité/coût pour la synthèse |
| Job scheduler | **@nestjs/schedule** (cron) | Simple, pas besoin de Redis/Bull pour V1 |
| Frontend | **Vite + React 18** | SPA, React Router v6, React Query |
| UI | **Tailwind CSS** | Styling utility-first, fidèle au prototype |
| Auth | **Slack OAuth** | L'user s'authentifie via Slack, c'est le point d'entrée |
| Hosting | **Railway** | Simple, PostgreSQL inclus, pas de DevOps |
| File storage | Pas nécessaire V1 | Les données brutes sont en JSONB dans PG |

### Diagramme Simplifié

```
┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   Slack API  │     │  Linear API  │     │  Notion API │
│  (messages)  │     │  (tickets)   │     │   (pages)   │
└──────┬───────┘     └──────┬───────┘     └──────┬──────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────┐
│                   INGESTION LAYER                    │
│  Cron: toutes les heures (Slack), 2x/jour (Linear)   │
│  On-demand (Notion au moment de la génération)       │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │  (données brutes │
              │   + rapports)    │
              └────────┬─────────┘
                       │
                       ▼
┌───────────────────────────────────────────────────────┐
│               GENERATION PIPELINE (LLM)               │
│  Cron: lundi 7h (ou on-demand)                        │
│  1. Filtrage heuristique des messages                 │
│  2. Agrégation données Linear                         │
│  3. Lecture spec Notion                               │
│  4. Prompt structuré → Claude API                     │
│  5. Parsing JSON → stockage rapport                   │
└──────────────────────┬────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
   ┌──────────────┐      ┌──────────────┐
   │ Slack DM     │      │ Dashboard    │
   │ (rapport     │      │ Web (Vite)   │
   │  formaté)    │      │              │
   └──────────────┘      └──────────────┘
```

### Structure des Dossiers

```
drift/
├── apps/
│   ├── api/                    # NestJS backend (Hexagonal Architecture + DDD)
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── auth/           # Slack OAuth, sessions
│   │       └── core/
│   │           ├── accounts/       # Organization & Member aggregates
│   │           ├── projects/       # Project aggregate + source mapping
│   │           ├── reports/        # Report aggregate + génération
│   │           ├── integrations/
│   │           │   ├── slack/      # Slack ingestion + delivery
│   │           │   ├── linear/     # Linear ingestion
│   │           │   └── notion/     # Notion page reader
│   │           ├── pipeline/       # Orchestration LLM
│   │           ├── scheduler/      # Cron jobs
│   │           └── ai/             # LLM client (Claude API)
│   └── app/                    # React frontend (Vite)
│       └── src/
│           ├── pages/              # Route-level page components
│           ├── features/           # Feature modules (dashboard, projects, onboarding)
│           ├── components/         # Shared UI components
│           │   └── ui/             # Base primitives
│           ├── services/           # API client (fetch + React Query)
│           ├── routes/             # React Router route definitions
│           ├── store/              # Zustand global state
│           ├── types/              # Shared TypeScript types
│           └── lib/                # Utilities (cn, formatDate, etc.)
└── packages/
    └── shared/                 # Types partagés API ↔ App
        └── types/
```

---

## 2. Modèle de Données

### Architecture DDD

Le backend suit l'architecture hexagonale stricte. Chaque entité a :
- Un **domain aggregate** (plain TypeScript class, business logic)
- Un **MikroORM model** (`*.mikroORM.ts`, persistence only)
- Un **mapper** (`toDomain` / `toPersistence`)

### Domain Aggregates

```typescript
// apps/api/src/core/accounts/domain/aggregates/organization.aggregate.ts
export class Organization extends AggregateRoot {
  private name: string;
  private slackTeamId: string;
  private slackBotToken: string;          // encrypted
  private slackUserTokens: Record<string, string>; // { userId: token }
  private linearAccessToken: string | null;

  static create(props: CreateOrganizationProps): Organization { ... }
  static reconstitute(props: OrganizationProps): Organization { ... }

  updateSlackBotToken(token: string): void { ... }
  connectLinear(token: string): void { ... }
}

// apps/api/src/core/accounts/domain/aggregates/member.aggregate.ts
export class Member extends AggregateRoot {
  private email: string;
  private name: string;
  private slackUserId: string;
  private avatarUrl: string | null;
  private role: MemberRole;              // 'admin' | 'member'
  private organizationId: string;

  static create(props: CreateMemberProps): Member { ... }
  isAdmin(): boolean { ... }
}

// apps/api/src/core/projects/domain/aggregates/project.aggregate.ts
export class Project extends AggregateRoot {
  private name: string;
  private emoji: string;
  private organizationId: string;
  private pmLeadName: string | null;
  private techLeadName: string | null;
  private teamName: string | null;
  private targetDate: Date | null;
  private weekNumber: number;
  private slackChannelIds: string[];
  private linearProjectId: string | null;
  private linearTeamId: string | null;
  private notionPageId: string | null;
  private productObjective: string | null;
  private objectiveOrigin: string | null;
  private keyResults: KeyResult[];
  private isActive: boolean;

  static create(props: CreateProjectProps): Project { ... }
  addSlackChannel(channelId: string): void { ... }
  setLinearProject(projectId: string, teamId: string): void { ... }
  setNotionPage(pageId: string): void { ... }
  setProductObjective(objective: string, origin: string, krs: KeyResult[]): void { ... }
  deactivate(): void { ... }
}

// apps/api/src/core/integrations/slack/domain/aggregates/slack-message.aggregate.ts
export class SlackMessage extends AggregateRoot {
  private organizationId: string;
  private projectId: string | null;
  private channelId: string;
  private messageTs: string;             // Slack timestamp (unique per channel)
  private threadTs: string | null;
  private userId: string;
  private userName: string;
  private text: string;
  private isBot: boolean;
  private hasFiles: boolean;
  private reactionCount: number;
  private replyCount: number;
  private isFiltered: boolean;           // true = excluded by heuristic filter

  static ingest(props: IngestSlackMessageProps): SlackMessage { ... }
  markFiltered(): void { ... }
}

// apps/api/src/core/integrations/linear/domain/aggregates/linear-ticket-snapshot.aggregate.ts
export class LinearTicketSnapshot extends AggregateRoot {
  private organizationId: string;
  private projectId: string | null;
  private linearIssueId: string;
  private identifier: string;            // "CHK-89"
  private title: string;
  private description: string | null;
  private stateName: string;
  private stateType: string;             // "started" | "completed" | "canceled"
  private priority: number;             // 0=none, 1=urgent, 4=low
  private assigneeName: string | null;
  private labelNames: string[];
  private commentCount: number;
  private snapshotDate: Date;
  private snapshotWeekStart: Date;

  static snapshot(props: SnapshotProps): LinearTicketSnapshot { ... }
}

// apps/api/src/core/reports/domain/aggregates/report.aggregate.ts
export class Report extends AggregateRoot {
  private projectId: string;
  private weekStart: Date;
  private weekEnd: Date;
  private weekNumber: number;
  private periodLabel: string;           // "Week 7 · Feb 17–23"
  private content: ReportContent;        // JSON structuré — voir Section 5
  private health: ProjectHealth;         // 'on-track' | 'at-risk' | 'off-track'
  private driftLevel: DriftLevel;        // 'none' | 'low' | 'high'
  private progress: number;             // 0-100
  private prevProgress: number;
  private slackMessageCount: number;
  private linearTicketCount: number;
  private notionPagesRead: number;
  private modelUsed: string;
  private promptTokens: number;
  private completionTokens: number;
  private generationTimeMs: number;
  private slackDeliveredAt: Date | null;
  private slackMessageTs: string | null;

  static generate(props: GenerateReportProps): Report { ... }
  markDelivered(messageTs: string): void { ... }
}
```

### MikroORM Models

```typescript
// apps/api/src/core/accounts/infrastructure/persistence/mikro-orm/models/organization.mikroORM.ts
@Entity({ tableName: 'organization' })
export class OrganizationMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  name: string;

  @Property({ type: 'varchar', length: 255 })
  @Unique()
  slackTeamId: string;

  @Property({ type: 'text' })
  slackBotToken: string;

  @Property({ type: 'jsonb', nullable: true })
  slackUserTokens: Record<string, string> | null;

  @Property({ type: 'text', nullable: true })
  linearAccessToken: string | null;
}

// apps/api/src/core/accounts/infrastructure/persistence/mikro-orm/models/member.mikroORM.ts
@Entity({ tableName: 'member' })
export class MemberMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  @Unique()
  email: string;

  @Property({ type: 'varchar', length: 255 })
  name: string;

  @Property({ type: 'varchar', length: 255 })
  slackUserId: string;

  @Property({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Property({ type: 'varchar', length: 50 })
  role: string;                     // 'admin' | 'member'

  @ManyToOne(() => OrganizationMikroOrm, { fieldName: 'organization_id' })
  organization: OrganizationMikroOrm;

  @Index()
  @Property({ type: 'varchar', length: 255 })
  organizationId: string;
}

// apps/api/src/core/projects/infrastructure/persistence/mikro-orm/models/project.mikroORM.ts
@Entity({ tableName: 'project' })
export class ProjectMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  name: string;

  @Property({ type: 'varchar', length: 10 })
  emoji: string;

  @Property({ type: 'varchar', length: 255 })
  organizationId: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  pmLeadName: string | null;

  @Property({ type: 'varchar', length: 255, nullable: true })
  techLeadName: string | null;

  @Property({ type: 'varchar', length: 255, nullable: true })
  teamName: string | null;

  @Property({ type: 'timestamptz', nullable: true })
  targetDate: Date | null;

  @Property({ type: 'int' })
  weekNumber: number;

  @Property({ type: 'jsonb' })
  slackChannelIds: string[];

  @Property({ type: 'varchar', length: 255, nullable: true })
  linearProjectId: string | null;

  @Property({ type: 'varchar', length: 255, nullable: true })
  linearTeamId: string | null;

  @Property({ type: 'varchar', length: 255, nullable: true })
  notionPageId: string | null;

  @Property({ type: 'text', nullable: true })
  productObjective: string | null;

  @Property({ type: 'text', nullable: true })
  objectiveOrigin: string | null;

  @Property({ type: 'jsonb', nullable: true })
  keyResults: { text: string; done: boolean }[] | null;

  @Property({ type: 'boolean' })
  isActive: boolean;
}

// apps/api/src/core/integrations/slack/infrastructure/persistence/mikro-orm/models/slack-message.mikroORM.ts
@Entity({ tableName: 'slack_message' })
@UniqueConstraint({ properties: ['channelId', 'messageTs'] })
@Index({ properties: ['projectId', 'ingestedAt'] })
@Index({ properties: ['channelId', 'ingestedAt'] })
export class SlackMessageMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  organizationId: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  projectId: string | null;

  @Property({ type: 'varchar', length: 255 })
  channelId: string;

  @Property({ type: 'varchar', length: 255 })
  messageTs: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  threadTs: string | null;

  @Property({ type: 'varchar', length: 255 })
  userId: string;

  @Property({ type: 'varchar', length: 255 })
  userName: string;

  @Property({ type: 'text' })
  text: string;

  @Property({ type: 'boolean' })
  isBot: boolean;

  @Property({ type: 'boolean' })
  hasFiles: boolean;

  @Property({ type: 'int' })
  reactionCount: number;

  @Property({ type: 'int' })
  replyCount: number;

  @Property({ type: 'boolean' })
  isFiltered: boolean;

  @Property({ type: 'timestamptz' })
  ingestedAt: Date;
}

// apps/api/src/core/integrations/linear/infrastructure/persistence/mikro-orm/models/linear-ticket-snapshot.mikroORM.ts
@Entity({ tableName: 'linear_ticket_snapshot' })
@Index({ properties: ['projectId', 'snapshotWeekStart'] })
@Index({ properties: ['linearIssueId', 'snapshotDate'] })
export class LinearTicketSnapshotMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  organizationId: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  projectId: string | null;

  @Property({ type: 'varchar', length: 255 })
  linearIssueId: string;

  @Property({ type: 'varchar', length: 50 })
  identifier: string;

  @Property({ type: 'text' })
  title: string;

  @Property({ type: 'text', nullable: true })
  description: string | null;

  @Property({ type: 'varchar', length: 100 })
  stateName: string;

  @Property({ type: 'varchar', length: 50 })
  stateType: string;

  @Property({ type: 'int' })
  priority: number;

  @Property({ type: 'varchar', length: 255, nullable: true })
  assigneeName: string | null;

  @Property({ type: 'jsonb' })
  labelNames: string[];

  @Property({ type: 'int' })
  commentCount: number;

  @Property({ type: 'timestamptz' })
  snapshotDate: Date;

  @Property({ type: 'timestamptz' })
  snapshotWeekStart: Date;
}

// apps/api/src/core/reports/infrastructure/persistence/mikro-orm/models/report.mikroORM.ts
@Entity({ tableName: 'report' })
@UniqueConstraint({ properties: ['projectId', 'weekStart'] })
@Index({ properties: ['projectId', 'generatedAt'] })
export class ReportMikroOrm extends PersistenceEntity {
  @Property({ type: 'varchar', length: 255 })
  projectId: string;

  @Property({ type: 'timestamptz' })
  weekStart: Date;

  @Property({ type: 'timestamptz' })
  weekEnd: Date;

  @Property({ type: 'int' })
  weekNumber: number;

  @Property({ type: 'varchar', length: 100 })
  periodLabel: string;

  @Property({ type: 'jsonb' })
  content: ReportContent;

  @Property({ type: 'varchar', length: 20 })
  health: string;                   // 'on-track' | 'at-risk' | 'off-track'

  @Property({ type: 'varchar', length: 20 })
  driftLevel: string;               // 'none' | 'low' | 'high'

  @Property({ type: 'int' })
  progress: number;

  @Property({ type: 'int' })
  prevProgress: number;

  @Property({ type: 'int' })
  slackMessageCount: number;

  @Property({ type: 'int' })
  linearTicketCount: number;

  @Property({ type: 'int' })
  notionPagesRead: number;

  @Property({ type: 'varchar', length: 100 })
  modelUsed: string;

  @Property({ type: 'int' })
  promptTokens: number;

  @Property({ type: 'int' })
  completionTokens: number;

  @Property({ type: 'int' })
  generationTimeMs: number;

  @Property({ type: 'timestamptz' })
  generatedAt: Date;

  @Property({ type: 'timestamptz', nullable: true })
  slackDeliveredAt: Date | null;

  @Property({ type: 'varchar', length: 255, nullable: true })
  slackMessageTs: string | null;
}
```

---

## 3. Plan de Build

| Étape | Fichier | Durée |
|-------|---------|-------|
| 1 — Initialisation du Projet | [step-01-init.md](./step-01-init.md) | 2-3h |
| 2 — Modèle de Données & Migrations | [step-02-data-model.md](./step-02-data-model.md) | 2-3h |
| 3 — Authentification & Onboarding Slack | [step-03-auth-slack.md](./step-03-auth-slack.md) | 4-6h |
| 4 — Ingestion Slack | [step-04-slack-ingestion.md](./step-04-slack-ingestion.md) | 6-8h |
| 5 — Intégration Linear | [step-05-linear.md](./step-05-linear.md) | 4-6h |
| 6 — Intégration Notion | [step-06-notion.md](./step-06-notion.md) | 3-4h |
| 7 — Pipeline LLM | [step-07-llm-pipeline.md](./step-07-llm-pipeline.md) | 8-12h |
| 8 — Delivery Slack | [step-08-slack-delivery.md](./step-08-slack-delivery.md) | 4-5h |
| 9 — Dashboard Web | [step-09-dashboard.md](./step-09-dashboard.md) | 8-12h |
| 10 — Onboarding Self-Serve | [step-10-onboarding.md](./step-10-onboarding.md) | 4-6h |

```
Semaine 1:  Étapes 1-2 (Init + DB)               → Fondation
Semaine 2:  Étapes 3-4 (Auth Slack + Ingestion)   → Données Slack en DB
Semaine 3:  Étapes 5-6 (Linear + Notion)          → Toutes les sources
Semaine 4:  Étape 7   (Pipeline LLM)              → Premier rapport généré ⭐
Semaine 5:  Étape 8   (Delivery Slack)             → Premier rapport reçu par DM ⭐⭐
Semaine 6:  Étape 9   (Dashboard Web)              → Consultation web
Semaine 7:  Étape 10  (Onboarding)                 → Self-serve
Semaine 8:  Polish + bugs + itération prompt       → Prêt pour design partners
```

---

## 4. Prompt LLM — Spécification Complète

C'est le cœur du produit. Ce prompt doit être itéré intensivement avec des données réelles.

### System Prompt

```
You are Drift, an AI assistant that generates structured weekly project status reports for Product and Engineering leadership. You analyze raw data from Slack conversations, Linear tickets, and Notion specs to produce accurate, insightful project reports.

Your reports serve two audiences simultaneously:
- The CTO/VP Engineering: cares about delivery velocity, blockers, technical risks, team bandwidth
- The CPO/Head of Product: cares about alignment with product intent, decision traceability, scope drift, KR impact

CRITICAL RULES:
1. Only report facts you can verify from the provided data. Never invent or hallucinate information.
2. Distinguish clearly between DECISIONS MADE (someone explicitly committed to a course of action) vs DISCUSSIONS IN PROGRESS (options being explored, no commitment).
3. When you identify a decision, always note WHO made it, WHERE (which channel/tool), and the TRADE-OFF involved.
4. Be precise about blockers: what is blocked, who owns it, how long it's been blocked, and what's the impact.
5. For intent drift: compare what's being built/discussed against the Product Objective and Key Results provided. Flag any divergence, even subtle ones.
6. Progress percentage should reflect overall project completion based on KR status, ticket completion, and your assessment of remaining work — NOT just ticket count.
7. Health assessment must be justified by specific evidence from the data.
8. Write the narrative in a style that's informative but concise — like a senior PM briefing leadership. No fluff, no filler, every sentence carries information.
9. Your output MUST be valid JSON matching the exact schema provided. No markdown, no commentary outside the JSON.
```

### User Prompt Template

```
Generate a weekly project status report based on the following data.

## PROJECT INFO
- Name: {{project.name}}
- Team: {{project.teamName}}
- PM Lead: {{project.pmLeadName}}
- Tech Lead: {{project.techLeadName}}
- Week Number: {{project.weekNumber}}
- Target Date: {{project.targetDate}}
- Days to Target: {{computed.daysToTarget}}
- Previous Week Progress: {{previousReport.progress || "N/A (first report)"}}
- Previous Week Health: {{previousReport.health || "N/A"}}

## PRODUCT OBJECTIVE
Goal: {{project.productObjective}}
Origin: {{project.objectiveOrigin}}
Key Results:
{{#each project.keyResults}}
- [{{#if done}}x{{else}} {{/if}}] {{text}}
{{/each}}

## NOTION SPEC CONTENT (Product Intent Reference)
{{notionContent || "No Notion page configured for this project."}}

## SLACK CONVERSATIONS (last 7 days, filtered for relevance)
Channel: {{channelName}}
{{#each slackMessages}}
[{{timestamp}}] {{userName}}: {{text}}
{{#if threadMessages}}
  Thread replies:
  {{#each threadMessages}}
  ↳ [{{timestamp}}] {{userName}}: {{text}}
  {{/each}}
{{/if}}
{{/each}}

## LINEAR TICKETS (current state)
{{#each linearTickets}}
- {{identifier}}: {{title}}
  Status: {{stateName}} | Priority: {{priority}} | Assignee: {{assigneeName}}
  {{#if comments}}
  Recent comments:
  {{#each comments}}
    - {{user}}: {{body}}
  {{/each}}
  {{/if}}
{{/each}}

## DELIVERY METRICS (computed from Linear)
- Tickets merged this week: {{deliveryStats.merged}}
- In review: {{deliveryStats.inReview}}
- Blocked: {{deliveryStats.blocked}}
- Created this week: {{deliveryStats.created}}

## OUTPUT FORMAT
Respond with a single JSON object matching this exact schema. No markdown, no extra text — ONLY the JSON:

{
  "health": "on-track" | "at-risk" | "off-track",
  "healthLabel": "On Track" | "At Risk" | "Off Track",
  "progress": <number 0-100>,
  "narrative": "<2-4 sentence weekly summary>",
  "decisions": [
    {
      "text": "<what was decided>",
      "tradeoff": "<what's gained vs what's lost>",
      "who": "<person(s) who made the decision>",
      "where": "<Slack channel or Linear ticket>",
      "when": "<day of the week>",
      "alignedWithIntent": true | false | "partial"
    }
  ],
  "drift": {
    "level": "none" | "low" | "high",
    "label": "Aligned" | "Minor Drift" | "Significant Drift",
    "details": "<explanation of divergence, or 'Implementation matches original spec.' if none>"
  },
  "blockers": [
    {
      "text": "<what is blocked>",
      "owner": "<person responsible>",
      "severity": "high" | "medium" | "low",
      "since": "<duration>",
      "impact": "<consequence if not resolved>"
    }
  ],
  "keyResults": [
    { "text": "<KR text>", "done": <boolean> }
  ],
  "threads": [
    {
      "title": "<summary of the thread topic>",
      "participants": ["<name>", ...],
      "messages": <number>,
      "outcome": "<Decision: X | Open — needs Y | Investigation ongoing>",
      "channel": "<#channel-name>"
    }
  ],
  "delivery": {
    "merged": <number>,
    "inReview": <number>,
    "blocked": <number>,
    "created": <number>,
    "velocity": "<+X% or -X%>",
    "velocityLabel": "vs last week"
  },
  "sourceCounts": {
    "slack": <number of messages analyzed>,
    "linear": <number of tickets analyzed>,
    "notion": <0 or 1>
  }
}
```

---

## 5. Structure JSON du Rapport Généré

Le champ `content` du Report aggregate stocke ce JSON exact :

```typescript
// packages/shared/types/report.ts

export interface ReportContent {
  health: 'on-track' | 'at-risk' | 'off-track';
  healthLabel: string;
  progress: number; // 0-100

  narrative: string;

  decisions: {
    text: string;
    tradeoff: string;
    who: string;
    where: string;
    when: string;
    alignedWithIntent: boolean | 'partial';
  }[];

  drift: {
    level: 'none' | 'low' | 'high';
    label: string;
    details: string;
  };

  blockers: {
    text: string;
    owner: string;
    severity: 'high' | 'medium' | 'low';
    since: string;
    impact: string;
  }[];

  keyResults: {
    text: string;
    done: boolean;
  }[];

  threads: {
    title: string;
    participants: string[];
    messages: number;
    outcome: string;
    channel: string;
  }[];

  delivery: {
    merged: number;
    inReview: number;
    blocked: number;
    created: number;
    velocity: string;
    velocityLabel: string;
  };

  sourceCounts: {
    slack: number;
    linear: number;
    notion: number;
  };
}
```

---

## Annexe A: API Reference par Intégration

### Slack Web API

| Méthode | Usage Drift | Rate Limit |
|---------|-------------|------------|
| `conversations.history` | Lire messages d'un channel | Tier 3 (50+/min) |
| `conversations.replies` | Lire un thread | Tier 3 |
| `conversations.list` | Lister channels (onboarding) | Tier 2 (20/min) |
| `users.info` | Résoudre un user ID en nom | Tier 4 (100+/min) |
| `chat.postMessage` | Envoyer rapport | Tier 3 |
| `conversations.open` | Ouvrir DM | Tier 3 |
| `views.publish` | App Home | Tier 3 |

Documentation : https://api.slack.com/methods

### Linear GraphQL API

Endpoint : `https://api.linear.app/graphql`

Queries principales :
```graphql
# Lister les issues d'un projet
query ProjectIssues($projectId: String!, $after: String) {
  project(id: $projectId) {
    issues(first: 100, after: $after, orderBy: updatedAt) {
      nodes {
        id identifier title description
        state { name type }
        priority assignee { name }
        createdAt updatedAt completedAt
        labels { nodes { name } }
        comments(first: 5) { nodes { body user { name } createdAt } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
}
```

Documentation : https://developers.linear.app/docs/graphql/working-with-the-graphql-api

### Notion API

| Endpoint | Usage Drift |
|----------|-------------|
| `GET /v1/pages/:id` | Metadata de page |
| `GET /v1/blocks/:id/children` | Contenu de page (blocks) |
| `POST /v1/search` | Recherche de pages (onboarding) |

Documentation : https://developers.notion.com/reference

---

## Annexe B: Prototype UI Reference

Le fichier `apps/app/src/App.tsx` sert de référence visuelle exacte pour le dashboard. Les données dans le prototype (PROJECTS array) sont le format cible que le pipeline LLM doit produire.

Éléments de design à reproduire exactement :
- La nav bar dark (#1A1A1A) avec logo "drift." et badge BETA orange
- Les portfolio stats cards
- Le "Needs attention" banner gradient
- Les filter buttons
- Les project cards avec expand/collapse
- Le système de tabs (Overview, Decisions, Delivery, Key Threads)
- Les health badges, drift badges, source tags
- Les decision cards avec alignment scoring
- Les blocker cards avec severity coloring
- Le footer avec génération metadata

---

## Ordre de Build Recommandé

```
Semaine 1:  Étapes 1-2 (Init + DB)               → Fondation
Semaine 2:  Étapes 3-4 (Auth Slack + Ingestion)   → Données Slack en DB
Semaine 3:  Étapes 5-6 (Linear + Notion)          → Toutes les sources
Semaine 4:  Étape 7   (Pipeline LLM)              → Premier rapport généré ⭐
Semaine 5:  Étape 8   (Delivery Slack)             → Premier rapport reçu par DM ⭐⭐
Semaine 6:  Étape 9   (Dashboard Web)              → Consultation web
Semaine 7:  Étape 10  (Onboarding)                 → Self-serve
Semaine 8:  Polish + bugs + itération prompt       → Prêt pour design partners
```

La ⭐ marque le moment où tu peux commencer à tester avec de vraies données.
Le ⭐⭐ marque le moment "magic moment" — le CTO reçoit son premier status automatique.

---

*Dernière mise à jour : 24 février 2026*
*Version : 1.1 (MikroORM + Vite)*
*Auteur : Victor L. + Claude (session de co-construction)*
