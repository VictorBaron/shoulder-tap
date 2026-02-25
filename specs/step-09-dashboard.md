# Étape 9: Dashboard Web (Prototype → App)

**Durée estimée** : 8-12h

## Prompt Claude Code

```
Implémente le dashboard web Drift en React + Vite, basé sur le prototype existant (apps/app/src/App.tsx).

CONTEXTE :
- Le prototype est dans apps/app/src/App.tsx avec les données hardcodées.
- Il faut le transformer en application React connectée à l'API backend.
- Le design, les couleurs, les composants du prototype doivent être reproduits fidèlement.
- Les données viennent de l'API via React Query.

CONVENTIONS (apps/app/CLAUDE.md) :
- Named exports pour tous les composants
- Tailwind CSS, pas de style inline sauf valeurs dynamiques
- React Query pour le data fetching
- Services dans src/services/ (jamais de fetch direct dans les composants)
- Routing avec React Router v6

PAGES À CRÉER :

1. src/pages/LoginPage.tsx
   - Design simple : logo Drift, "Add to Slack" button, tagline
   - Le bouton redirige vers GET /auth/slack (API)
   - Redirect vers /dashboard si déjà authentifié

2. src/pages/DashboardPage.tsx
   - Header avec date, titre "Weekly pulse — Product × Engineering"
   - Subtitle avec source counts (depuis l'API)
   - Portfolio stats row (5 cards : Active Projects, Decisions, Blockers, Intent Drift, Avg Velocity)
   - "Needs attention" banner (si un projet a high drift)
   - Filter buttons (All, Drifting, At Risk, On Track)
   - Project cards list (depuis useLatestReports hook)
   - Footer avec génération metadata

3. src/features/reports/components/ProjectCard.tsx
   - État collapsed : emoji, nom, health badge, drift badge, PM/Tech lead, target date, progress bar, source pills, chevron
   - État expanded avec tabs :
     * Overview : Product Objective + KRs, Weekly Narrative, Drift Alert, Blockers
     * Decisions : Liste des décisions avec alignment badge + trade-offs
     * Delivery : Stats grid (merged, in review, blocked, created, velocity) + Timeline Risk
     * Key Threads : Slack threads avec participants, message count, outcome

4. src/features/reports/hooks/useLatestReports.ts
   - React Query hook : GET /reports/latest
   - Retourne { reports, isLoading, error }

5. src/services/api.ts
   - Base URL depuis import.meta.env.VITE_API_BASE_URL
   - Endpoints :
     * GET /reports/latest → Report[] (dernier rapport de chaque projet)
     * GET /reports/:reportId → Report complet
     * GET /projects → Project[]
     * POST /reports/generate/:projectId → déclencher génération manuelle
   - Credentials: 'include' pour le JWT cookie

6. src/routes/index.tsx
   - /login → LoginPage (public)
   - /dashboard → DashboardPage (protected)
   - / → redirect vers /dashboard
   - ProtectedRoute wrapper qui vérifie GET /auth/me

IMPORTANT : Le dashboard doit être IDENTIQUE visuellement au prototype.
- Fonts : DM Sans (body), Newsreader (headings), Source Serif 4 (narratives)
- Palette : bg #F5F3EF, cards #FFFFFF, borders #E8E6E1, text #1A1A1A, accent orange #FF6B35
- Nav bar dark : #1A1A1A
- Health badges : on-track (green #E8F5E9/#2E7D32), at-risk (orange), off-track (red)
```

## Validation

- [ ] Le dashboard affiche les rapports de la semaine depuis l'API
- [ ] Les project cards se déplient avec les 4 tabs
- [ ] Le filtre All/Drifting/At Risk/On Track fonctionne
- [ ] Le portfolio summary est correct (calculs des totaux)
- [ ] La page login fonctionne et redirige vers Slack OAuth
- [ ] Le design est fidèle au prototype (comparer visuellement)
- [ ] La route protégée redirige vers /login si non authentifié
