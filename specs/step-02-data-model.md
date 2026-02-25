# Étape 2: Modèle de Données & Migrations

**Durée estimée** : 2-3h

## Prompt Claude Code

```
Implémente le modèle de données pour Drift en suivant l'architecture hexagonale du projet.

Pour chaque entité, créer :
1. Le domain aggregate (plain TypeScript class avec business logic, extends AggregateRoot)
2. Le MikroORM model (*.mikroORM.ts, persistence only, extends PersistenceEntity)
3. Le mapper (toDomain / toPersistence)
4. Le repository port interface (abstract class)
5. L'implémentation MikroORM du repository

Entités à créer :
- Organization (slackTeamId, slackBotToken, slackUserTokens, linearAccessToken)
- Member (email, name, slackUserId, avatarUrl, role: 'admin'|'member', organizationId)
- Project (name, emoji, organizationId, pmLeadName, techLeadName, teamName, targetDate, weekNumber, slackChannelIds[], linearProjectId, linearTeamId, notionPageId, productObjective, objectiveOrigin, keyResults[], isActive)
- SlackMessage (organizationId, projectId, channelId, messageTs, threadTs, userId, userName, text, isBot, hasFiles, reactionCount, replyCount, isFiltered, ingestedAt)
- LinearTicketSnapshot (organizationId, projectId, linearIssueId, identifier, title, description, stateName, stateType, priority, assigneeName, labelNames[], commentCount, snapshotDate, snapshotWeekStart)
- Report (projectId, weekStart, weekEnd, weekNumber, periodLabel, content: ReportContent JSON, health, driftLevel, progress, prevProgress, slackMessageCount, linearTicketCount, notionPagesRead, modelUsed, promptTokens, completionTokens, generationTimeMs, generatedAt, slackDeliveredAt, slackMessageTs)

Créer la migration initiale avec :
npx mikro-orm migration:create --name init

Créer un seed script (src/database/seed.ts) qui insère :
- 1 Organization de test ("Acme Corp", slackTeamId: "T_TEST")
- 1 Member admin (CTO)
- 3 Projects avec des données réalistes (Checkout Revamp, Search Rewrite, Onboarding V2)
  incluant les product objectives et key results
```

## Validation

- [ ] `npx mikro-orm migration:create --name init` crée la migration
- [ ] `npx mikro-orm migration:up` applique le schéma en DB
- [ ] `npx ts-node src/database/seed.ts` insère les données de test
- [ ] Les domain aggregates sont injectables dans les command handlers
- [ ] Les mappers `toDomain` et `toPersistence` fonctionnent sans erreur
