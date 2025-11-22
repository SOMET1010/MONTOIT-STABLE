# Guide de Test - Connexion par Téléphone
## Mon Toit - Tests Manuels de Production

---

## 📋 Vue d'Ensemble

Ce guide contient tous les tests manuels à effectuer pour vérifier le bon fonctionnement de la connexion par téléphone (SMS/WhatsApp) en environnement de production.

**Durée estimée :** 45-60 minutes  
**Prérequis :** 
- Accès à la plateforme en production
- 2 numéros de téléphone de test (un avec compte, un sans)
- Accès WhatsApp sur les numéros de test

---

## 🎯 Objectifs des Tests

1. ✅ Vérifier l'interface utilisateur
2. ✅ Valider le flux de connexion par SMS
3. ✅ Valider le flux de connexion par WhatsApp
4. ✅ Vérifier la compatibilité et les régressions
5. ✅ Tester les cas d'erreur
6. ✅ Vérifier la performance

---

## 🛠️ Préparation

### Étape 1 : Créer un Compte de Test

1. Aller sur `/inscription`
2. S'inscrire avec :
   - **Nom :** Test User
   - **Téléphone :** +225 07 07 07 07 07 (ou votre numéro de test)
   - **Email :** test-connexion@montoit.ci
   - **Méthode :** SMS ou WhatsApp
3. Vérifier le compte avec le code OTP
4. **Noter** le numéro de téléphone pour les tests

### Étape 2 : Préparer les Outils

- [ ] Navigateur Chrome/Firefox à jour
- [ ] DevTools ouvert (F12) pour voir les erreurs
- [ ] Téléphone avec WhatsApp installé
- [ ] Bloc-notes pour noter les résultats
- [ ] Chronomètre pour mesurer les temps

### Étape 3 : URLs à Tester

- **Production :** https://immo-verse-hub.lovable.app/connexion
- **Staging :** (si disponible)

---

## 📝 Checklist de Tests

### Groupe 1 : Interface Utilisateur (10 min)

#### Test 1.1 : Affichage Initial ✅

**Objectif :** Vérifier que la page se charge correctement

**Étapes :**
1. Aller sur `/connexion`
2. Attendre le chargement complet

**Vérifications :**
- [ ] Page se charge en moins de 3 secondes
- [ ] Titre "Bienvenue !" visible
- [ ] Message "Connexion flexible" affiché
- [ ] 2 boutons visibles : "Email + Mot de passe" et "Téléphone + OTP"
- [ ] "Email + Mot de passe" sélectionné par défaut (bleu)
- [ ] Champs Email et Mot de passe visibles
- [ ] Bouton "Se connecter" visible
- [ ] Lien "Mot de passe oublié ?" visible

**Résultat attendu :** ✅ Tous les éléments présents et bien positionnés

**Capture d'écran :** `test-1-1-affichage-initial.png`

---

#### Test 1.2 : Toggle vers Téléphone ✅

**Objectif :** Vérifier le changement de mode

**Étapes :**
1. Cliquer sur "Téléphone + OTP"
2. Observer les changements

**Vérifications :**
- [ ] Bouton "Téléphone + OTP" devient bleu
- [ ] Bouton "Email + Mot de passe" devient gris
- [ ] Animation de transition fluide
- [ ] Section "Méthode d'envoi OTP" apparaît
- [ ] 2 boutons : "SMS" et "WhatsApp" visibles
- [ ] Champ "Numéro de téléphone" apparaît
- [ ] Placeholder "+225 XX XX XX XX XX" visible
- [ ] Champ Email disparaît
- [ ] Champ Mot de passe disparaît
- [ ] Lien "Mot de passe oublié ?" disparaît
- [ ] Bouton change en "Recevoir le code OTP"

**Résultat attendu :** ✅ Interface s'adapte correctement

**Capture d'écran :** `test-1-2-toggle-telephone.png`

---

#### Test 1.3 : Sélection SMS ✅

**Objectif :** Vérifier la sélection SMS

**Étapes :**
1. En mode Téléphone, cliquer sur "SMS"
2. Observer le changement

**Vérifications :**
- [ ] Bouton "SMS" devient cyan/bleu clair
- [ ] Bouton "WhatsApp" reste gris
- [ ] Icône téléphone visible sur le bouton

**Résultat attendu :** ✅ SMS sélectionné visuellement

**Capture d'écran :** `test-1-3-selection-sms.png`

---

#### Test 1.4 : Sélection WhatsApp ✅

**Objectif :** Vérifier la sélection WhatsApp

**Étapes :**
1. Cliquer sur "WhatsApp"
2. Observer le changement

**Vérifications :**
- [ ] Bouton "WhatsApp" devient cyan/bleu clair
- [ ] Bouton "SMS" redevient gris
- [ ] Icône message visible sur le bouton

**Résultat attendu :** ✅ WhatsApp sélectionné visuellement

**Capture d'écran :** `test-1-4-selection-whatsapp.png`

---

#### Test 1.5 : Retour vers Email ✅

**Objectif :** Vérifier qu'on peut revenir en mode Email

**Étapes :**
1. Cliquer sur "Email + Mot de passe"
2. Observer les changements

**Vérifications :**
- [ ] Bouton "Email + Mot de passe" redevient bleu
- [ ] Section "Méthode d'envoi OTP" disparaît
- [ ] Champ téléphone disparaît
- [ ] Champs Email et Mot de passe réapparaissent
- [ ] Lien "Mot de passe oublié ?" réapparaît
- [ ] Bouton redevient "Se connecter"

**Résultat attendu :** ✅ Retour complet au mode Email

---

### Groupe 2 : Validation des Champs (5 min)

#### Test 2.1 : Numéro Vide ❌

**Objectif :** Vérifier la validation du champ vide

**Étapes :**
1. Mode Téléphone + SMS
2. Laisser le champ téléphone vide
3. Cliquer sur "Recevoir le code OTP"

**Vérifications :**
- [ ] Message d'erreur HTML5 "Veuillez remplir ce champ"
- [ ] OU message "Veuillez entrer votre numéro de téléphone"
- [ ] Champ téléphone en rouge/bordure rouge
- [ ] Formulaire non soumis

**Résultat attendu :** ❌ Erreur affichée, soumission bloquée

**Capture d'écran :** `test-2-1-numero-vide.png`

---

#### Test 2.2 : Format Invalide ❌

**Objectif :** Vérifier la validation du format

**Étapes :**
1. Mode Téléphone + SMS
2. Entrer : `123456`
3. Cliquer sur "Recevoir le code OTP"

**Vérifications :**
- [ ] Message "Numéro de téléphone invalide. Format: +225 XX XX XX XX XX"
- [ ] Champ téléphone en rouge
- [ ] Formulaire non soumis

**Résultat attendu :** ❌ Erreur de format affichée

**Capture d'écran :** `test-2-2-format-invalide.png`

---

#### Test 2.3 : Format Valide ✅

**Objectif :** Vérifier qu'un format valide est accepté

**Étapes :**
1. Mode Téléphone + SMS
2. Entrer : `+225 07 07 07 07 07`

**Vérifications :**
- [ ] Champ accepte la valeur
- [ ] Pas de message d'erreur
- [ ] Bordure normale (grise/bleue)

**Résultat attendu :** ✅ Format accepté

---

### Groupe 3 : Connexion par SMS (15 min)

#### Test 3.1 : Compte Inexistant ❌

**Objectif :** Vérifier le message d'erreur pour compte inexistant

**Étapes :**
1. Mode Téléphone + SMS
2. Entrer un numéro qui n'existe PAS : `+225 99 99 99 99 99`
3. Cliquer sur "Recevoir le code OTP"
4. Attendre la réponse (2-3 secondes)

**Vérifications :**
- [ ] Message "Aucun compte trouvé avec ce numéro de téléphone. Veuillez vous inscrire."
- [ ] Couleur rouge/corail
- [ ] Pas de redirection
- [ ] Reste sur la page de connexion

**Résultat attendu :** ❌ Erreur claire, invitation à s'inscrire

**Capture d'écran :** `test-3-1-compte-inexistant-sms.png`

---

#### Test 3.2 : Compte Existant - Envoi SMS ✅

**Objectif :** Vérifier l'envoi du code OTP par SMS

**Prérequis :** Utiliser le numéro de test créé à l'étape de préparation

**Étapes :**
1. Mode Téléphone + SMS
2. Entrer le numéro de test : `+225 07 07 07 07 07`
3. Cliquer sur "Recevoir le code OTP"
4. **Chronométrer** le temps de réponse

**Vérifications :**
- [ ] Bouton affiche "Chargement..." avec spinner
- [ ] Réponse en moins de 5 secondes
- [ ] Message vert "Code de vérification envoyé par SMS"
- [ ] Redirection automatique vers `/verification-otp` après 1.5s
- [ ] **SMS reçu** sur le téléphone (vérifier dans les 30 secondes)
- [ ] Code à 6 chiffres dans le SMS
- [ ] Message du SMS contient "Mon Toit" ou "Votre code"

**Résultat attendu :** ✅ SMS reçu, redirection réussie

**Temps mesuré :** _____ secondes

**Capture d'écran :** 
- `test-3-2-envoi-sms-success.png`
- `test-3-2-sms-recu.jpg` (photo du SMS)

---

#### Test 3.3 : Vérification du Code SMS ✅

**Objectif :** Vérifier que le code OTP fonctionne

**Étapes :**
1. Sur la page `/verification-otp`
2. Entrer le code reçu par SMS
3. Cliquer sur "Vérifier"

**Vérifications :**
- [ ] Page affiche "Vérification OTP"
- [ ] 6 champs pour le code
- [ ] Message indique "Code envoyé par SMS"
- [ ] Après saisie du code : validation automatique
- [ ] Message "Code vérifié avec succès"
- [ ] Redirection vers `/` ou dashboard
- [ ] Utilisateur connecté (voir nom dans le header)

**Résultat attendu :** ✅ Connexion réussie

**Capture d'écran :** `test-3-3-verification-code-sms.png`

---

### Groupe 4 : Connexion par WhatsApp (15 min)

#### Test 4.1 : Compte Inexistant ❌

**Objectif :** Vérifier le message d'erreur pour compte inexistant

**Étapes :**
1. Mode Téléphone + WhatsApp
2. Entrer un numéro qui n'existe PAS : `+225 88 88 88 88 88`
3. Cliquer sur "Recevoir le code OTP"
4. Attendre la réponse

**Vérifications :**
- [ ] Message "Aucun compte trouvé avec ce numéro de téléphone. Veuillez vous inscrire."
- [ ] Pas de redirection

**Résultat attendu :** ❌ Même erreur que pour SMS

**Capture d'écran :** `test-4-1-compte-inexistant-whatsapp.png`

---

#### Test 4.2 : Compte Existant - Envoi WhatsApp ✅

**Objectif :** Vérifier l'envoi du code OTP par WhatsApp

**Prérequis :** Numéro de test avec WhatsApp actif

**Étapes :**
1. Mode Téléphone + WhatsApp
2. Entrer le numéro de test : `+225 07 07 07 07 07`
3. Cliquer sur "Recevoir le code OTP"
4. **Chronométrer** le temps de réponse

**Vérifications :**
- [ ] Bouton affiche "Chargement..."
- [ ] Réponse en moins de 5 secondes
- [ ] Message vert "Code de vérification envoyé par WhatsApp"
- [ ] Redirection automatique vers `/verification-otp`
- [ ] **Message WhatsApp reçu** (vérifier dans les 30 secondes)
- [ ] Code à 6 chiffres dans le message
- [ ] Message WhatsApp contient "Mon Toit"
- [ ] Expéditeur identifiable (nom ou numéro)

**Résultat attendu :** ✅ Message WhatsApp reçu, redirection réussie

**Temps mesuré :** _____ secondes

**Capture d'écran :** 
- `test-4-2-envoi-whatsapp-success.png`
- `test-4-2-whatsapp-recu.jpg` (capture WhatsApp)

---

#### Test 4.3 : Vérification du Code WhatsApp ✅

**Objectif :** Vérifier que le code OTP WhatsApp fonctionne

**Étapes :**
1. Sur la page `/verification-otp`
2. Entrer le code reçu par WhatsApp
3. Cliquer sur "Vérifier"

**Vérifications :**
- [ ] Message indique "Code envoyé par WhatsApp"
- [ ] Code accepté
- [ ] Connexion réussie
- [ ] Redirection vers dashboard

**Résultat attendu :** ✅ Connexion réussie

---

### Groupe 5 : Compatibilité et Régression (10 min)

#### Test 5.1 : Connexion Email Non Cassée ✅

**Objectif :** Vérifier que la connexion email fonctionne toujours

**Étapes :**
1. Mode Email (par défaut)
2. Entrer : `test-connexion@montoit.ci`
3. Entrer le mot de passe
4. Cliquer sur "Se connecter"

**Vérifications :**
- [ ] Connexion fonctionne
- [ ] Pas d'erreur JavaScript (vérifier console)
- [ ] Redirection normale

**Résultat attendu :** ✅ Connexion email toujours fonctionnelle

---

#### Test 5.2 : Responsive Mobile 📱

**Objectif :** Vérifier l'affichage mobile

**Étapes :**
1. Ouvrir DevTools (F12)
2. Activer le mode mobile (Ctrl+Shift+M)
3. Choisir iPhone 12 Pro (390x844)
4. Recharger la page

**Vérifications :**
- [ ] Tous les éléments visibles
- [ ] Boutons "Email" et "Téléphone" empilés ou côte à côte lisibles
- [ ] Champs de saisie adaptés
- [ ] Pas de défilement horizontal
- [ ] Boutons SMS/WhatsApp lisibles
- [ ] Texte lisible (pas trop petit)

**Résultat attendu :** ✅ Interface mobile fonctionnelle

**Capture d'écran :** `test-5-2-mobile-responsive.png`

---

#### Test 5.3 : Navigation Entre Modes ✅

**Objectif :** Vérifier qu'on peut naviguer plusieurs fois

**Étapes :**
1. Email → Téléphone
2. Téléphone → Email
3. Email → Téléphone
4. Sélectionner SMS
5. Sélectionner WhatsApp
6. Sélectionner SMS
7. Retour Email

**Vérifications :**
- [ ] Aucune erreur console
- [ ] Transitions fluides
- [ ] États correctement sauvegardés
- [ ] Pas de comportement étrange

**Résultat attendu :** ✅ Navigation fluide sans bug

---

### Groupe 6 : Cas d'Erreur (5 min)

#### Test 6.1 : Erreur Réseau ⚠️

**Objectif :** Vérifier le comportement en cas d'erreur réseau

**Étapes :**
1. Ouvrir DevTools → Network
2. Activer "Offline"
3. Mode Téléphone + SMS
4. Entrer un numéro valide
5. Cliquer sur "Recevoir le code OTP"

**Vérifications :**
- [ ] Message d'erreur affiché
- [ ] Pas de crash de l'application
- [ ] Bouton redevient cliquable

**Résultat attendu :** ⚠️ Erreur gérée gracieusement

---

#### Test 6.2 : Timeout API ⏱️

**Objectif :** Vérifier le comportement si l'API est lente

**Étapes :**
1. Ouvrir DevTools → Network
2. Activer "Slow 3G"
3. Mode Téléphone + SMS
4. Entrer un numéro valide
5. Cliquer sur "Recevoir le code OTP"
6. Observer

**Vérifications :**
- [ ] Spinner/Loading visible
- [ ] Timeout après ~30 secondes
- [ ] Message d'erreur si timeout
- [ ] Application reste utilisable

**Résultat attendu :** ⏱️ Timeout géré correctement

---

### Groupe 7 : Performance (5 min)

#### Test 7.1 : Temps de Chargement ⚡

**Objectif :** Mesurer la performance

**Étapes :**
1. Ouvrir un onglet incognito
2. Ouvrir DevTools → Network
3. Aller sur `/connexion`
4. Noter le temps de chargement

**Vérifications :**
- [ ] DOMContentLoaded < 1 seconde
- [ ] Load complet < 3 secondes
- [ ] Pas de ressources bloquantes

**Temps mesuré :**
- DOMContentLoaded : _____ ms
- Load : _____ ms

**Résultat attendu :** ⚡ Chargement rapide

---

#### Test 7.2 : Lighthouse Score 💯

**Objectif :** Vérifier le score Lighthouse

**Étapes :**
1. Ouvrir DevTools → Lighthouse
2. Mode "Navigation"
3. Catégories : Performance, Accessibility, Best Practices
4. Lancer l'audit

**Vérifications :**
- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90

**Scores obtenus :**
- Performance : _____
- Accessibility : _____
- Best Practices : _____

**Résultat attendu :** 💯 Scores élevés

---

## 📊 Rapport de Test

### Résumé des Résultats

| Groupe | Tests | Passés | Échoués | Taux |
|--------|-------|--------|---------|------|
| Interface | 5 | __ | __ | __% |
| Validation | 3 | __ | __ | __% |
| SMS | 3 | __ | __ | __% |
| WhatsApp | 3 | __ | __ | __% |
| Compatibilité | 3 | __ | __ | __% |
| Erreurs | 2 | __ | __ | __% |
| Performance | 2 | __ | __ | __% |
| **TOTAL** | **21** | **__** | **__** | **__%** |

### Bugs Identifiés

| ID | Sévérité | Description | Étapes de reproduction |
|----|----------|-------------|------------------------|
| BUG-01 | Critique | | |
| BUG-02 | Majeur | | |
| BUG-03 | Mineur | | |

### Recommandations

1. 
2. 
3. 

---

## 🔍 Tests Avancés (Optionnel)

### Test A1 : Plusieurs Tentatives

1. Envoyer un code OTP
2. Attendre 2 minutes
3. Renvoyer un code
4. Vérifier que le nouveau code fonctionne

### Test A2 : Code Expiré

1. Envoyer un code OTP
2. Attendre 15 minutes
3. Essayer d'utiliser le code
4. Vérifier le message "Code expiré"

### Test A3 : Mauvais Code

1. Envoyer un code OTP
2. Entrer un code incorrect : `000000`
3. Vérifier le message d'erreur
4. Essayer 3 fois
5. Vérifier le blocage après 3 tentatives

---

## 📝 Notes et Observations

### Observations Positives

- 
- 
- 

### Points d'Amélioration

- 
- 
- 

### Bugs Non Bloquants

- 
- 
- 

---

## ✅ Validation Finale

**Date du test :** _______________  
**Testeur :** _______________  
**Environnement :** Production / Staging  
**Navigateur :** Chrome / Firefox / Safari  
**Version :** _______________

**Résultat global :** ✅ VALIDÉ / ❌ REFUSÉ / ⚠️ AVEC RÉSERVES

**Commentaires :**

_____________________________________________
_____________________________________________
_____________________________________________

**Signature :** _______________

---

## 📞 Support

En cas de problème durant les tests :

1. **Vérifier la console** (F12) pour les erreurs JavaScript
2. **Prendre des captures d'écran** de tous les bugs
3. **Noter les étapes exactes** pour reproduire
4. **Vérifier les logs** Supabase Edge Functions
5. **Contacter l'équipe technique** avec le rapport

---

**Version du guide :** 1.0  
**Dernière mise à jour :** 22 novembre 2024  
**Auteur :** Équipe Mon Toit

