# Étape 1: Initialisation du Projet

**Durée estimée** : 2-3h

## Prompt Claude Code

```
Initialise un monorepo pour le projet "Drift" avec la structure suivante :

BACKEND (apps/api/) :
- NestJS avec TypeScript strict
- MikroORM comme ORM avec PostgreSQL
- Configuration : @nestjs/config avec .env
- Modules à créer (vides pour l'instant) : AuthModule, ProjectsModule, IntegrationsModule, ReportsModule, PipelineModule, SchedulerModule
- Health check endpoint GET /health
- CORS configuré pour localhost:3001

FRONTEND (apps/app/) :
- Vite + React 18 + TypeScript
- Tailwind CSS
- React Router v6
- React Query (TanStack Query)
- Layout de base avec une page d'accueil simple
- Port de dev : 3001

PACKAGES (packages/shared/) :
- Package TypeScript avec les types partagés entre API et App

Configuration :
- Biome pour lint et formatting
- docker-compose.yml avec PostgreSQL 16
- .env.example avec toutes les variables nécessaires
- README.md avec les instructions de setup

Variables d'environnement attendues :
DATABASE_URL, SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_SIGNING_SECRET,
LINEAR_CLIENT_ID, LINEAR_CLIENT_SECRET, NOTION_INTEGRATION_TOKEN,
ANTHROPIC_API_KEY, APP_URL (http://localhost:3000 en dev), WEB_URL (http://localhost:3001 en dev)
```

## Validation

- [ ] `docker-compose up -d` lance PostgreSQL
- [ ] `cd apps/api && pnpm dev` → API démarre sur :3000
- [ ] `cd apps/app && pnpm dev` → App démarre sur :3001
- [ ] GET /health retourne 200
- [ ] `npx mikro-orm migration:up` s'exécute sans erreur
