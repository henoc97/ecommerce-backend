# Configuration des Variables d'Environnement

## Variables Requises pour les Paiements

### Stripe Configuration

```bash
# Clés d'API Stripe (obtenues depuis le dashboard Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# URLs de retour (à adapter selon votre domaine)
STRIPE_RETURN_URL=http://localhost:3000/payment/success
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
```

### PayPal Configuration

```bash
# Clés d'API PayPal (obtenues depuis le dashboard PayPal Developer)
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# URLs de retour (à adapter selon votre domaine)
PAYPAL_RETURN_URL=http://localhost:3000/payment/success
PAYPAL_CANCEL_URL=http://localhost:3000/payment/cancel
PAYPAL_BRAND_NAME=Votre Boutique
```

### Variables Générales

```bash
# Base de données
DATABASE_URL=postgresql://username:password@localhost:5432/ecomm_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Application
NODE_ENV=development
PORT=3000
GLOBAL_PREFIX=api
```

## Installation des Dépendances

### Stripe

```bash
npm install stripe
```

### PayPal

```bash
npm install @paypal/checkout-server-sdk
```

## Configuration des Comptes

### Stripe

1. Créez un compte sur [stripe.com](https://stripe.com)
2. Accédez au Dashboard Stripe
3. Allez dans "Developers" > "API keys"
4. Copiez les clés de test (commençant par `sk_test_` et `pk_test_`)
5. Pour la production, utilisez les clés live (commençant par `sk_live_` et `pk_live_`)

### PayPal

1. Créez un compte sur [developer.paypal.com](https://developer.paypal.com)
2. Accédez au Dashboard PayPal Developer
3. Allez dans "My Apps & Credentials"
4. Créez une nouvelle app ou utilisez l'app par défaut
5. Copiez le Client ID et Client Secret
6. Pour la production, utilisez les clés live

## Mode Simulation

Si les variables d'environnement ne sont pas configurées, le système utilisera automatiquement le mode simulation :

- **Stripe** : Génère des IDs de paiement simulés (`pi_sim_...`)
- **PayPal** : Génère des IDs de paiement simulés (`PAY-SIM-...`)
- **Taux de succès** : 80% pour Stripe, 85% pour PayPal

## Sécurité

### Variables Sensibles

- Ne jamais commiter les vraies clés dans le code
- Utiliser des variables d'environnement
- Utiliser des secrets managers en production

### Environnements

- **Development** : Utilise les clés de test
- **Production** : Utilise les clés live
- **Staging** : Utilise les clés de test

## Test des Paiements

### Cartes de Test Stripe

```bash
# Carte qui fonctionne
4242424242424242

# Carte qui échoue
4000000000000002

# Carte qui nécessite une authentification 3D Secure
4000002500003155
```

### Comptes PayPal de Test

- Utilisez les comptes sandbox PayPal pour les tests
- Créez des comptes de test dans le dashboard PayPal Developer

## Monitoring

### Logs

Les paiements sont loggés avec les informations suivantes :

- ID de transaction
- Montant
- Méthode de paiement
- Statut
- Temps de traitement
- Erreurs éventuelles

### Métriques à Surveiller

- Taux de succès des paiements
- Temps de réponse des gateways
- Erreurs par type
- Volume de transactions
