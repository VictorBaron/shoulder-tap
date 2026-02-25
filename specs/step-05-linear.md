# Étape 5: Intégration Linear (OAuth + Ingestion)

**Durée estimée** : 4-6h

## Prompt Claude Code

```
Implémente l'intégration Linear pour Drift (OAuth + ingestion de tickets).

CONTEXTE :
- Chaque Project est mappé à un Linear project ou team via linearProjectId/linearTeamId.
- On prend des "snapshots" des tickets à intervalles réguliers pour calculer la vélocité.
- L'API Linear utilise GraphQL.

MODULE : apps/api/src/core/integrations/linear/
Suivre l'architecture hexagonale.

COMPOSANTS À CRÉER :

1. LinearApiGateway (port interface dans domain/gateways/)
   - Client GraphQL pour l'API Linear (utiliser graphql-request)
   - Méthodes :
     * listTeams(token) → teams[]
     * listProjects(token, teamId?) → projects[]
     * getProjectIssues(token, projectId, since: Date) → issues[]
       GraphQL query incluant :
       - id, identifier, title, description (truncated 200 chars)
       - state { name, type }, priority, assignee { name }
       - createdAt, updatedAt, completedAt
       - labels { nodes { name } }
       - comments { nodes { body, user { name }, createdAt } } (limit 5 most recent)
     * getTeamIssues(token, teamId, since: Date) → issues[]
   - Fake gateway pour les tests

2. LinearAuthController (infrastructure/controllers/) + AuthService extension
   - GET /integrations/linear/connect → redirige vers Linear OAuth
   - GET /integrations/linear/callback → échange code, update Organization.linearAccessToken
   - Scopes : "read"

3. SnapshotLinearProjectCommand + handler (application/commands/)
   - Récupère les issues du projet Linear depuis le dernier snapshot (ou 7 jours)
   - Crée un LinearTicketSnapshot via le repository pour chaque issue
   - Calcule snapshotWeekStart (lundi de la semaine courante)

4. ComputeDeliveryStatsQuery (application/queries/)
   - Input : projectId, weekStart, weekEnd
   - Retourne :
     { merged, inReview, blocked, created, velocity: "+18%", velocityLabel: "vs last week" }

5. LinearIngestionCron
   - Cron : 2x par jour à 12h et 19h UTC ("0 12,19 * * 1-5")
   - Pour chaque Organization avec linearAccessToken, snapshot tous les projets
```

## GraphQL Query Reference

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

## Validation

- [ ] L'OAuth Linear fonctionne et stocke le token dans Organization
- [ ] listTeams et listProjects retournent les données depuis Linear
- [ ] Les issues sont snapshotées correctement via le repository
- [ ] ComputeDeliveryStatsQuery retourne les bons chiffres
- [ ] Le cron tourne et snapshote automatiquement
- [ ] Les commentaires des issues sont récupérés (max 5 par issue)
