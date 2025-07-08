# API de Paiement - Documentation

## Vue d'ensemble

L'API de paiement permet de traiter les paiements pour les commandes e-commerce. Elle supporte actuellement les méthodes de paiement suivantes :

- **Stripe** (cartes de crédit/débit)
- **PayPal** (comptes PayPal)

## Endpoints

### 1. Traiter un paiement

**POST** `/api/payments`

Traite un paiement pour une commande en attente.

#### Headers requis

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Body

```json
{
  "orderId": 123,
  "method": "stripe",
  "amount": 99.99,
  "currency": "USD",
  "cardData": {
    "number": "4242424242424242",
    "expMonth": 12,
    "expYear": 2025,
    "cvc": "123"
  }
}
```

#### Réponse de succès (200)

```json
{
  "success": true,
  "payment": {
    "providerId": "pi_1234567890_abc123",
    "transactionId": "txn_1234567890",
    "method": "stripe",
    "processedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Réponses d'erreur

**400 - Commande invalide**

```json
{
  "success": false,
  "error": "Commande invalide ou déjà traitée",
  "code": 400
}
```

**402 - Paiement refusé**

```json
{
  "success": false,
  "error": "Paiement refusé",
  "code": 402,
  "details": {
    "reason": "Carte refusée",
    "errorCode": "card_declined",
    "message": "Votre carte a été refusée"
  }
}
```

**502 - Erreur externe**

```json
{
  "success": false,
  "error": "Erreur de paiement externe",
  "code": 502
}
```

### 2. Récupérer un paiement

**GET** `/api/payments/:orderId`

Récupère les détails du paiement associé à une commande.

#### Headers requis

```
Authorization: Bearer <jwt_token>
```

#### Réponse de succès (200)

```json
{
  "id": 1,
  "status": "SUCCESS",
  "method": "Stripe",
  "amount": 99.99,
  "currency": "USD",
  "providerId": "pi_1234567890_abc123",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "orderId": 123,
  "metadata": {
    "transactionId": "txn_1234567890",
    "method": "stripe",
    "processedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Réponse d'erreur (404)

```json
{
  "statusCode": 404,
  "message": "Aucun paiement trouvé pour cette commande",
  "error": "Not Found"
}
```

### 3. Lister les paiements

**GET** `/api/payments`

Récupère tous les paiements de l'utilisateur connecté.

#### Headers requis

```
Authorization: Bearer <jwt_token>
```

#### Réponse de succès (200)

```json
[
  {
    "id": 1,
    "status": "SUCCESS",
    "method": "Stripe",
    "amount": 99.99,
    "currency": "USD",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "orderId": 123
  },
  {
    "id": 2,
    "status": "FAILED",
    "method": "PayPal",
    "amount": 49.99,
    "currency": "USD",
    "createdAt": "2024-01-14T15:45:00.000Z",
    "orderId": 124
  }
]
```

## Codes de statut

| Code | Description                                  |
| ---- | -------------------------------------------- |
| 200  | Succès                                       |
| 400  | Commande invalide ou déjà traitée            |
| 401  | Non autorisé (token JWT manquant/invalide)   |
| 402  | Paiement refusé par la gateway               |
| 404  | Paiement non trouvé                          |
| 502  | Erreur de paiement externe (réseau, gateway) |

## Flux de paiement

### 1. Vérification de la commande

- La commande doit exister
- La commande doit appartenir à l'utilisateur connecté
- La commande doit être en statut `PENDING`

### 2. Traitement par la gateway

- Appel à la gateway de paiement (Stripe/PayPal)
- Validation des données de paiement
- Traitement de la transaction

### 3. Enregistrement en base

- **Succès** : Création du paiement avec statut `SUCCESS`
- **Échec** : Création du paiement avec statut `FAILED`
- Mise à jour du statut de la commande si succès

### 4. Nettoyage du panier

- Suppression des items du panier
- Suppression du panier

## Intégration des gateways

### Stripe

```typescript
// Configuration requise
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

// Utilisation
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100, // Stripe utilise les centimes
  currency: currency.toLowerCase(),
  payment_method_data: {
    type: 'card',
    card: cardData
  }
});
```

### PayPal

```typescript
// Configuration requise
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

// Utilisation
const paypal = require('@paypal/checkout-server-sdk');
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);
```

## Sécurité

### Authentification

- Tous les endpoints nécessitent un token JWT valide
- Vérification que l'utilisateur possède la commande

### Validation des données

- Validation du montant (doit correspondre à la commande)
- Validation de la devise
- Validation des données de carte (format, expiration)

### Protection contre la fraude

- Limitation du nombre de tentatives de paiement
- Détection des montants suspects
- Logging des tentatives de paiement

## Monitoring et logs

### Métriques à surveiller

- Taux de succès des paiements
- Temps de réponse des gateways
- Erreurs par type (réseau, validation, gateway)

### Logs importants

```typescript
// Exemple de log de paiement
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userId": 123,
  "orderId": 456,
  "amount": 99.99,
  "method": "stripe",
  "status": "SUCCESS",
  "providerId": "pi_1234567890_abc123",
  "processingTime": 1200
}
```

## Tests

### Tests unitaires

- Validation des données de paiement
- Gestion des erreurs de gateway
- Mise à jour des statuts

### Tests d'intégration

- Flux complet de paiement
- Gestion des timeouts
- Récupération après échec

### Tests de charge

- Performance avec de multiples paiements simultanés
- Gestion des limites de rate limiting

## Déploiement

### Variables d'environnement

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Base de données
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_jwt_secret
```

### Health checks

```bash
# Vérifier la connectivité des gateways
curl -X GET /api/health/payment-gateways

# Vérifier la base de données
curl -X GET /api/health/database
```
