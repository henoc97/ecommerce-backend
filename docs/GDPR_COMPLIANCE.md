# Conformité RGPD - Documentation

## Vue d'ensemble

Ce document décrit l'implémentation de la conformité RGPD (Règlement Général sur la Protection des Données) dans le backend e-commerce.

## Fonctionnalités implémentées

### 1. **Droit à l'oubli (Article 17 RGPD)**

**Endpoint :** `POST /gdpr/delete-account`

Permet aux utilisateurs de demander la suppression complète de leurs données personnelles.

**Données supprimées :**

- Compte utilisateur
- Abonnements newsletter
- Activités utilisateur
- Notifications
- Avis et commentaires
- Panier
- Adresses
- Commandes (anonymisées pour la comptabilité)

**Processus de suppression :**

```typescript
// Suppression séquentielle avec gestion d'erreurs
1. Newsletter subscriptions
2. User activities
3. Notifications
4. Reviews
5. Cart
6. Addresses
7. Orders (anonymisation)
8. User account
9. Audit logging
```

### 2. **Droit d'accès et de portabilité (Article 15 & 20 RGPD)**

**Endpoint :** `GET /gdpr/export-data`

Permet aux utilisateurs d'exporter toutes leurs données personnelles au format JSON.

**Données exportées :**

- Informations du compte (sans mot de passe)
- Historique des commandes
- Contenu du panier
- Avis et commentaires
- Notifications
- Activités utilisateur
- Abonnements newsletter
- Adresses
- Logs d'audit

### 3. **Gestion du consentement (Article 7 RGPD)**

**Endpoints :**

- `GET /gdpr/consent-preferences` - Récupérer les préférences
- `POST /gdpr/consent-preferences` - Mettre à jour les préférences

**Types de consentement :**

- **Marketing** : Communications promotionnelles
- **Analytics** : Analyse d'usage et amélioration du service
- **Préférences** : Personnalisation de l'expérience
- **Nécessaire** : Fonctionnement du service (toujours actif)

### 4. **Registre des traitements (Article 30 RGPD)**

**Endpoints :**

- `GET /gdpr/processing-registry` - Registre complet
- `GET /gdpr/processing-registry/summary` - Résumé statistique
- `GET /gdpr/processing-registry/search` - Recherche
- `GET /gdpr/processing-registry/export` - Export du registre

**Traitements documentés :**

1. **Gestion des comptes utilisateurs**
   - Finalité : Création et authentification
   - Base légale : Exécution du contrat
   - Conservation : 3 ans après dernière activité

2. **Traitement des commandes**
   - Finalité : Gestion des achats et livraisons
   - Base légale : Exécution du contrat
   - Conservation : 10 ans (obligation fiscale)

3. **Service client**
   - Finalité : Support et assistance
   - Base légale : Intérêt légitime
   - Conservation : 5 ans après résolution

4. **Marketing et communications**
   - Finalité : Promotions et newsletters
   - Base légale : Consentement explicite
   - Conservation : 3 ans après retrait du consentement

5. **Analytics et amélioration**
   - Finalité : Analyse d'usage
   - Base légale : Consentement explicite
   - Conservation : 2 ans

6. **Conformité légale**
   - Finalité : Obligations fiscales et légales
   - Base légale : Obligation légale
   - Conservation : 10 ans

7. **Sécurité et monitoring**
   - Finalité : Détection de fraude
   - Base légale : Intérêt légitime
   - Conservation : 1 an

### 5. **Informations sur le traitement (Article 13 & 14 RGPD)**

**Endpoint :** `GET /gdpr/data-processing-info`

Fournit des informations détaillées sur :

- Responsable du traitement
- Finalités du traitement
- Durées de conservation
- Droits des utilisateurs
- Coordonnées du DPO

## Architecture technique

### Services implémentés

#### `GDPRService`

- Gestion du droit à l'oubli
- Export des données personnelles
- Gestion des préférences de consentement

#### `DataProcessingRegistryService`

- Registre des traitements de données
- Recherche et filtrage
- Export du registre

### Sécurité et audit

- **Authentification requise** : Tous les endpoints RGPD nécessitent une authentification
- **Logs d'audit** : Toutes les actions RGPD sont tracées
- **Gestion d'erreurs** : Suppression séquentielle avec rollback en cas d'échec
- **Validation des données** : DTOs avec validation class-validator

## Utilisation

### Exemple de suppression de compte

```bash
curl -X POST http://localhost:3000/gdpr/delete-account \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Réponse :**

```json
{
  "message": "Données utilisateur supprimées conformément au RGPD",
  "deletedData": [
    "newsletter_subscriptions",
    "user_activities",
    "notifications",
    "reviews",
    "cart",
    "addresses",
    "orders_anonymized",
    "user"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Exemple d'export des données

```bash
curl -X GET http://localhost:3000/gdpr/export-data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o user-data-export.json
```

### Exemple de mise à jour des préférences

```bash
curl -X POST http://localhost:3000/gdpr/consent-preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marketing": false,
    "analytics": true,
    "preferences": true
  }'
```

## Conformité légale

### Articles RGPD respectés

- **Article 7** : Conditions du consentement
- **Article 15** : Droit d'accès
- **Article 17** : Droit à l'effacement
- **Article 20** : Droit à la portabilité
- **Article 30** : Registre des activités de traitement

### Mesures de sécurité

- Chiffrement des données sensibles
- Accès restreint aux données personnelles
- Logs d'audit complets
- Anonymisation des données de commande
- Gestion sécurisée du consentement

### Droits des utilisateurs

1. **Droit d'accès** : Export complet des données
2. **Droit de rectification** : Via les endpoints de profil
3. **Droit à l'effacement** : Suppression complète du compte
4. **Droit à la portabilité** : Export au format JSON
5. **Droit de limitation** : Via les préférences de consentement
6. **Droit d'opposition** : Retrait du consentement marketing
7. **Droit de retrait** : Mise à jour des préférences

## Maintenance et évolution

### Mise à jour du registre

Pour ajouter un nouveau traitement de données :

1. Modifier `DataProcessingRegistryService`
2. Ajouter l'activité dans le tableau `processingActivities`
3. Mettre à jour la documentation

### Monitoring

- Surveiller les logs d'audit RGPD
- Vérifier les suppressions de données
- Contrôler les exports de données
- Analyser les préférences de consentement

### Tests

```bash
# Tests unitaires
npm run test gdpr

# Tests d'intégration
npm run test:e2e gdpr
```

## Contact et support

Pour toute question sur la conformité RGPD :

- **DPO** : dpo@votreentreprise.com
- **Support technique** : tech@votreentreprise.com
- **Adresse** : 123 Rue de la Protection, 75001 Paris, France

---

_Dernière mise à jour : Janvier 2024_
_Version : 1.0.0_
