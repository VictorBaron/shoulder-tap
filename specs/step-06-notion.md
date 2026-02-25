# Étape 6: Intégration Notion (Lecture page spec)

**Durée estimée** : 3-4h

## Prompt Claude Code

```
Implémente l'intégration Notion pour Drift (lecture de page spec).

CONTEXTE :
- Drift utilise une Internal Integration Notion (pas OAuth pour V1).
- L'admin copie-colle l'ID d'une page Notion par projet.
- On lit le contenu de cette page pour extraire l'intent produit.
- On ne lit qu'UNE seule page par projet, pas un arbre entier.

MODULE : apps/api/src/core/integrations/notion/
Suivre l'architecture hexagonale.

COMPOSANTS À CRÉER :

1. NotionApiGateway (port interface dans domain/gateways/)
   - Utiliser @notionhq/client
   - Token : NOTION_INTEGRATION_TOKEN (un seul token par workspace en V1, depuis .env)
   - Méthodes :
     * getPage(pageId) → { title, lastEditedTime, lastEditedBy }
     * getPageContent(pageId) → string (texte extrait des blocks)
       - Récupérer tous les blocks de la page (pagination)
       - Extraire le texte de : paragraph, heading_1/2/3, bulleted_list_item,
         numbered_list_item, to_do, toggle, code, quote, callout, divider
       - Ignorer : image, video, embed, bookmark, file, table
       - Limiter à 8000 caractères
     * searchPages(query) → pages[] (pour l'onboarding)
   - Fake gateway pour les tests

2. ReadNotionPageQuery (application/queries/)
   - Input : pageId
   - Retourne le texte brut extrait (pour inclusion dans le prompt LLM)

3. HasNotionPageChangedQuery (application/queries/)
   - Compare le lastEditedTime de la page avec la date du dernier rapport généré
   - Retourne boolean (false = skip la re-lecture)

NOTE : Pas de cron pour Notion. On lit la page au moment de la génération du rapport.
```

## Validation

- [ ] Avec un token Notion d'une Integration de test, getPage retourne la metadata
- [ ] getPageContent extrait le texte de tous les types de blocks supportés
- [ ] Le contenu est truncaté à 8000 caractères
- [ ] HasNotionPageChangedQuery détecte correctement les modifications
