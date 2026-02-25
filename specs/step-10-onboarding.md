# Étape 10: Onboarding Self-Serve (App Home Slack)

**Durée estimée** : 4-6h

## Prompt Claude Code

```
Implémente le flow d'onboarding self-serve pour Drift.

CONTEXTE :
- Après l'installation, l'admin doit configurer ses projets.
- Chaque projet a besoin : nom, channels Slack, projet Linear, page Notion (optionnel).

A. ONBOARDING WEB (apps/app/src/pages/OnboardingPage.tsx)

Page wizard en 3 steps (React Router avec query params pour l'étape courante) :

Step 1 : "Create your first project"
- Champ nom du projet
- Champ emoji
- Champs PM Lead et Tech Lead
- Champ Team name
- Champ Target date

Step 2 : "Connect your sources"
- Section Slack : liste des channels (GET /projects/channels via API), multiselect
- Section Linear (si connecté) : liste teams/projets (GET /integrations/linear/teams)
  * Si pas connecté → bouton "Connect Linear" (redirige vers /integrations/linear/connect)
- Section Notion (optionnel) : champ URL/ID + preview du titre de la page

Step 3 : "Set your product objective"
- Si Notion est connecté : extraction automatique via LLM (POST /integrations/notion/extract-objective)
- Sinon : saisie manuelle (textarea + key results dynamiques)
- Config delivery : jour et heure du rapport (défaut : Lundi 8h)

Après le wizard : redirect vers /dashboard avec CTA "Generate your first report now"

B. SLACK APP HOME

Quand l'utilisateur ouvre l'app dans Slack (event app_home_opened) :
- Si aucun projet configuré → message d'onboarding avec bouton vers le wizard web
- Si des projets existent → résumé avec liste des projets, health status, bouton "View dashboard"

Implémenter dans apps/api/src/core/integrations/slack/ :
- Event listener pour app_home_opened
- View publish avec Slack Block Kit
- Handler pour les button actions
- POST /slack/events (events Slack)
- POST /slack/interactions (boutons)
- Vérification de signature Slack sur ces endpoints
```

## Validation

- [ ] Le wizard web crée un projet avec ses sources mappées en DB
- [ ] La liste des channels Slack s'affiche et est sélectionnable
- [ ] La connexion Linear fonctionne depuis le wizard
- [ ] Le lien Notion est validé (preview du titre)
- [ ] L'App Home Slack affiche le résumé des projets
- [ ] Un nouveau user peut onboarder 3 projets en < 10 minutes
