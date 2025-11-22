# Documentation du Système OTP - Mon Toit

**Date :** 21 novembre 2025  
**Auteur :** Manus AI  
**Version :** 1.0  
**Statut :** ✅ Implémenté et testé

---

## 🎯 Objectif

Créer un système d'inscription sécurisé avec vérification obligatoire par code OTP (One-Time Password) via **Email**, **SMS** ou **WhatsApp**.

---

## ✅ Fonctionnalités Implémentées

### 1. **Choix de la Méthode de Vérification**

L'utilisateur peut choisir parmi 3 méthodes lors de l'inscription :

| Méthode | Description | Champ requis |
|---------|-------------|--------------|
| **Email** | Code envoyé par email | Email obligatoire |
| **SMS** | Code envoyé par SMS | Téléphone obligatoire |
| **WhatsApp** | Code envoyé via WhatsApp | Téléphone obligatoire |

### 2. **Workflow d'Inscription**

```
┌─────────────────┐
│  Page Auth.tsx  │
│  (Inscription)  │
└────────┬────────┘
         │
         │ 1. Utilisateur remplit le formulaire
         │    - Nom complet
         │    - Email (obligatoire si méthode Email)
         │    - Téléphone (obligatoire si SMS/WhatsApp)
         │    - Mot de passe
         │    - Choix de méthode de vérification
         │
         ▼
┌─────────────────┐
│  signUp()       │
│  (Supabase)     │
└────────┬────────┘
         │
         │ 2. Création du compte Supabase
         │
         ▼
┌─────────────────────────────┐
│  send-verification-code     │
│  (Edge Function)            │
└────────┬────────────────────┘
         │
         │ 3. Génération du code OTP (6 chiffres)
         │    Sauvegarde dans verification_codes
         │    Expiration : 10 minutes
         │
         ├─────────┬─────────┬─────────┐
         │         │         │         │
         ▼         ▼         ▼         ▼
   ┌─────────┐ ┌──────┐ ┌─────────────┐
   │  Email  │ │ SMS  │ │  WhatsApp   │
   └────┬────┘ └──┬───┘ └──────┬──────┘
        │         │            │
        └─────────┴────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  VerifyOTP.tsx  │
         │  (Vérification) │
         └────────┬────────┘
                  │
                  │ 4. Utilisateur entre le code
                  │
                  ▼
         ┌─────────────────┐
         │  verify-code    │
         │  (Edge Function)│
         └────────┬────────┘
                  │
                  │ 5. Vérification du code
                  │    - Code valide ?
                  │    - Non expiré ?
                  │    - Tentatives restantes ?
                  │
                  ▼
         ┌─────────────────┐
         │  /choix-profil  │
         │  (Redirection)  │
         └─────────────────┘
```

---

## 📁 Fichiers Modifiés/Créés

### 1. **src/pages/Auth.tsx**

**Modifications :**
- Ajout d'un état `verificationType` pour stocker le choix de l'utilisateur
- Ajout d'un sélecteur visuel avec 3 boutons (Email/SMS/WhatsApp)
- Validation conditionnelle :
  - Email obligatoire si méthode Email
  - Téléphone obligatoire si méthode SMS ou WhatsApp
- Appel à `send-verification-code` après inscription réussie
- Redirection vers `/verify-otp` avec les données nécessaires

**Code clé :**
```typescript
const [verificationType, setVerificationType] = useState<'email' | 'sms' | 'whatsapp'>('email');

// Après inscription réussie
const { data: otpData, error: otpError } = await supabase.functions.invoke('send-verification-code', {
  body: {
    email: finalVerificationType === 'email' ? email : undefined,
    phone: (finalVerificationType === 'sms' || finalVerificationType === 'whatsapp') ? phone : undefined,
    type: finalVerificationType,
    name: fullName
  }
});

// Redirection
navigate('/verify-otp', {
  state: {
    email: finalVerificationType === 'email' ? email : undefined,
    phone: (finalVerificationType === 'sms' || finalVerificationType === 'whatsapp') ? phone : undefined,
    type: finalVerificationType,
    name: fullName
  }
});
```

### 2. **src/pages/VerifyOTP.tsx**

**Modifications :**
- Ajout de l'icône `MessageCircle` pour WhatsApp
- Support de l'affichage conditionnel selon le type (Email/SMS/WhatsApp)
- Gestion des 3 types dans la logique de vérification

**Code clé :**
```typescript
{type === 'email' ? (
  <Mail className="h-10 w-10 text-white" />
) : type === 'whatsapp' ? (
  <MessageCircle className="h-10 w-10 text-white" />
) : (
  <Phone className="h-10 w-10 text-white" />
)}

<h2>Vérification {type === 'email' ? 'Email' : type === 'whatsapp' ? 'WhatsApp' : 'SMS'}</h2>
```

### 3. **supabase/functions/send-verification-code/index.ts**

**Modifications :**
- Ajout du type `'whatsapp'` dans l'interface `VerificationRequest`
- Ajout de la validation pour WhatsApp
- Ajout du cas `else if (type === 'whatsapp')` pour appeler `send-whatsapp-otp`
- Sauvegarde du téléphone dans la base pour WhatsApp

**Code clé :**
```typescript
interface VerificationRequest {
  email?: string;
  phone?: string;
  type: 'email' | 'sms' | 'whatsapp';
  name?: string;
  userId?: string;
}

// Sauvegarde dans la base
phone: (type === 'sms' || type === 'whatsapp') ? phone : null,

// Envoi WhatsApp
else if (type === 'whatsapp') {
  const whatsappResponse = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-whatsapp-otp`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phone,
        otp: otp,
        name: name || 'utilisateur'
      })
    }
  );
}
```

### 4. **supabase/functions/send-whatsapp-otp/index.ts** (NOUVEAU)

**Description :**
Nouvelle Edge Function pour envoyer des codes OTP via WhatsApp en utilisant l'API InTouch.

**Fonctionnalités :**
- Formatage automatique du numéro de téléphone (+225)
- Message formaté avec emoji et instructions
- Utilisation de l'API InTouch WhatsApp
- Gestion des erreurs complète

**Code complet :**
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WhatsAppOTPRequest {
  phone: string;
  otp: string;
  name?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { phone, otp, name } = await req.json() as WhatsAppOTPRequest;

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('225')) {
      formattedPhone = '225' + formattedPhone;
    }
    formattedPhone = '+' + formattedPhone;

    // WhatsApp message template
    const message = `🏠 *Mon Toit - Vérification*\n\nBonjour ${name || ''},\n\nVotre code de vérification est :\n\n*${otp}*\n\nCe code est valide pendant 10 minutes.\n\n⚠️ Ne partagez jamais ce code avec qui que ce soit.\n\nMerci de faire confiance à Mon Toit !`;

    // Use InTouch API for WhatsApp
    const intouchApiKey = Deno.env.get('INTOUCH_API_KEY');
    const intouchSenderId = Deno.env.get('INTOUCH_SENDER_ID') || 'MonToit';

    if (!intouchApiKey) {
      throw new Error('InTouch API key not configured');
    }

    const intouchUrl = 'https://api.intouch.ci/api/v1/whatsapp/send';

    const response = await fetch(intouchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${intouchApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message,
        sender: intouchSenderId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('InTouch WhatsApp API error:', errorData);
      throw new Error(`Failed to send WhatsApp message: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('WhatsApp OTP sent successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Code de vérification envoyé via WhatsApp',
        messageId: result.messageId || result.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending WhatsApp OTP:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send WhatsApp OTP',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 🔧 Configuration Requise

### Variables d'Environnement

Les variables suivantes doivent être configurées dans Supabase :

```bash
# Pour Email (déjà configuré)
RESEND_API_KEY=xxx
BREVO_API_KEY=xxx

# Pour SMS (déjà configuré)
INTOUCH_API_KEY=xxx
INTOUCH_SENDER_ID=MonToit

# Pour WhatsApp (utilise les mêmes que SMS)
INTOUCH_API_KEY=xxx
INTOUCH_SENDER_ID=MonToit
```

### Déploiement des Edge Functions

```bash
# Déployer send-whatsapp-otp
supabase functions deploy send-whatsapp-otp

# Redéployer send-verification-code (modifiée)
supabase functions deploy send-verification-code

# Vérifier le déploiement
supabase functions list
```

---

## 📊 Base de Données

### Table `verification_codes`

La table existante est utilisée pour stocker les codes OTP :

```sql
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  phone TEXT,  -- Utilisé pour SMS et WhatsApp
  code TEXT NOT NULL,
  type TEXT NOT NULL,  -- 'email', 'sms', ou 'whatsapp'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Aucune modification nécessaire** - la table supporte déjà les 3 types.

---

## 🎨 Interface Utilisateur

### Sélecteur de Méthode

L'utilisateur voit 3 boutons visuels lors de l'inscription :

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   📧     │  │   📱     │  │   💬     │
│  Email   │  │   SMS    │  │ WhatsApp │
└──────────┘  └──────────┘  └──────────┘
```

- **Bouton actif** : Bordure cyan, fond cyan clair
- **Bouton inactif** : Bordure grise, fond blanc
- **Hover** : Bordure cyan clair

### Validation Conditionnelle

| Méthode choisie | Email | Téléphone |
|----------------|-------|-----------|
| **Email** | ✅ Obligatoire | ⚪ Optionnel |
| **SMS** | ⚪ Optionnel | ✅ Obligatoire |
| **WhatsApp** | ⚪ Optionnel | ✅ Obligatoire |

### Page de Vérification

La page `VerifyOTP` affiche :
- **Icône** : Email (📧), SMS (📱), ou WhatsApp (💬)
- **Titre** : "Vérification Email/SMS/WhatsApp"
- **Message** : "Un code à 6 chiffres a été envoyé à [email/phone]"
- **Champs** : 6 cases pour le code OTP
- **Timer** : Compte à rebours de 10 minutes
- **Bouton** : "Renvoyer le code" (après expiration)

---

## 🔒 Sécurité

### Génération du Code OTP

- **Longueur** : 6 chiffres
- **Génération** : Fonction SQL `generate_otp()` dans Supabase
- **Expiration** : 10 minutes
- **Tentatives** : Maximum 5 tentatives par code

### Protection contre les Abus

```typescript
// Dans verify-code Edge Function
if (attempts >= 5) {
  return {
    success: false,
    error: 'Trop de tentatives. Demandez un nouveau code.',
    attemptsRemaining: 0
  };
}
```

### Validation du Code

1. Code existe dans la base ?
2. Code non expiré (< 10 minutes) ?
3. Code non déjà utilisé ?
4. Moins de 5 tentatives ?
5. Code correspond ?

---

## 📱 Format des Messages

### Email

```
Sujet: Vérifiez votre adresse email - Mon Toit

Bonjour [Nom],

Votre code de vérification est : [CODE]

Ce code est valide pendant 10 minutes.

Ne partagez jamais ce code avec qui que ce soit.

Merci de faire confiance à Mon Toit !
```

### SMS

```
Mon Toit: Votre code de verification est [CODE]. Valide pendant 10 minutes. Ne partagez pas ce code.
```

### WhatsApp

```
🏠 *Mon Toit - Vérification*

Bonjour [Nom],

Votre code de vérification est :

*[CODE]*

Ce code est valide pendant 10 minutes.

⚠️ Ne partagez jamais ce code avec qui que ce soit.

Merci de faire confiance à Mon Toit !
```

---

## 🧪 Tests

### Test Manuel

1. **Inscription par Email**
   ```
   - Aller sur /inscription
   - Choisir "Email"
   - Remplir : Nom, Email, Mot de passe
   - Cliquer "S'inscrire"
   - Vérifier réception email
   - Entrer le code sur /verify-otp
   - Vérifier redirection vers /choix-profil
   ```

2. **Inscription par SMS**
   ```
   - Aller sur /inscription
   - Choisir "SMS"
   - Remplir : Nom, Téléphone (+225...), Mot de passe
   - Cliquer "S'inscrire"
   - Vérifier réception SMS
   - Entrer le code sur /verify-otp
   - Vérifier redirection vers /choix-profil
   ```

3. **Inscription par WhatsApp**
   ```
   - Aller sur /inscription
   - Choisir "WhatsApp"
   - Remplir : Nom, Téléphone (+225...), Mot de passe
   - Cliquer "S'inscrire"
   - Vérifier réception WhatsApp
   - Entrer le code sur /verify-otp
   - Vérifier redirection vers /choix-profil
   ```

### Test de Validation

```typescript
// Téléphone obligatoire si SMS/WhatsApp
verificationType === 'sms' || verificationType === 'whatsapp'
  ? phone.length > 0
  : true

// Email obligatoire si Email
verificationType === 'email'
  ? email.length > 0
  : true
```

---

## 🚀 Déploiement

### Étape 1 : Déployer les Edge Functions

```bash
cd /home/ubuntu/MONTOIT-STABLE

# Déployer la nouvelle fonction WhatsApp
supabase functions deploy send-whatsapp-otp

# Redéployer send-verification-code (modifiée)
supabase functions deploy send-verification-code
```

### Étape 2 : Vérifier les Variables d'Environnement

```bash
# Vérifier que INTOUCH_API_KEY est configuré
supabase secrets list
```

### Étape 3 : Déployer le Frontend

```bash
# Build de production
npm run build

# Déployer sur Vercel/Netlify
vercel --prod
# ou
netlify deploy --prod
```

### Étape 4 : Tests en Production

- Tester les 3 méthodes avec de vrais numéros/emails
- Vérifier les logs Supabase
- Vérifier les métriques InTouch

---

## 📈 Métriques et Monitoring

### Logs à Surveiller

```sql
-- Codes OTP générés par type
SELECT type, COUNT(*) as count
FROM verification_codes
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY type;

-- Taux de vérification réussie
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE verified_at IS NOT NULL) as verified,
  ROUND(100.0 * COUNT(*) FILTER (WHERE verified_at IS NOT NULL) / COUNT(*), 2) as success_rate
FROM verification_codes
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type;

-- Codes expirés non utilisés
SELECT type, COUNT(*) as expired_count
FROM verification_codes
WHERE expires_at < NOW() AND verified_at IS NULL
GROUP BY type;
```

### Alertes à Configurer

- Taux d'échec > 20% pour une méthode
- Temps de livraison > 2 minutes
- Coût WhatsApp > budget mensuel

---

## 🐛 Dépannage

### Problème : Code OTP non reçu par Email

**Solution :**
1. Vérifier les logs Supabase : `supabase functions logs send-email`
2. Vérifier RESEND_API_KEY
3. Vérifier les spams de l'utilisateur

### Problème : Code OTP non reçu par SMS

**Solution :**
1. Vérifier les logs Supabase : `supabase functions logs send-sms`
2. Vérifier INTOUCH_API_KEY
3. Vérifier le format du numéro (+225...)
4. Vérifier le crédit InTouch

### Problème : Code OTP non reçu par WhatsApp

**Solution :**
1. Vérifier les logs Supabase : `supabase functions logs send-whatsapp-otp`
2. Vérifier INTOUCH_API_KEY
3. Vérifier que le numéro a WhatsApp installé
4. Vérifier le format du numéro (+225...)
5. Vérifier l'API InTouch WhatsApp est activée

### Problème : Code invalide

**Solution :**
1. Vérifier que le code n'a pas expiré (< 10 minutes)
2. Vérifier le nombre de tentatives (< 5)
3. Demander un nouveau code

---

## 📝 Changelog

### Version 1.0 (21 novembre 2025)

**Ajouté :**
- ✅ Système OTP complet avec 3 méthodes
- ✅ Sélecteur visuel de méthode de vérification
- ✅ Edge Function `send-whatsapp-otp`
- ✅ Support WhatsApp dans `send-verification-code`
- ✅ Validation conditionnelle des champs
- ✅ Redirection automatique vers VerifyOTP
- ✅ Interface utilisateur améliorée

**Modifié :**
- ✅ `Auth.tsx` : Intégration OTP dans le workflow
- ✅ `VerifyOTP.tsx` : Support WhatsApp
- ✅ `send-verification-code` : Type WhatsApp

---

## 🎯 Prochaines Améliorations

### Court Terme
- [ ] Ajouter des statistiques d'utilisation par méthode
- [ ] Ajouter un système de retry automatique
- [ ] Améliorer les messages d'erreur

### Moyen Terme
- [ ] Support de Telegram
- [ ] Support de Signal
- [ ] Authentification biométrique

### Long Terme
- [ ] Authentification sans mot de passe (Passwordless)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Single Sign-On (SSO)

---

## 📚 Ressources

### Documentation API

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [InTouch API](https://intouch.ci/api-docs)
- [Resend API](https://resend.com/docs)
- [Brevo API](https://developers.brevo.com/)

### Guides

- [OTP Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

**Document créé par Manus AI - 21 novembre 2025**  
**Version 1.0 - Documentation du Système OTP**

