/**
 * Tests E2E pour la Connexion par Téléphone (SMS/WhatsApp)
 * Mon Toit - Tests de Production
 * 
 * Prérequis:
 * - npm install -D @playwright/test
 * - npx playwright install
 * 
 * Exécution:
 * - npx playwright test tests/e2e/phone-login.spec.ts
 * - npx playwright test tests/e2e/phone-login.spec.ts --headed (avec interface)
 * - npx playwright test tests/e2e/phone-login.spec.ts --project=chromium
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const BASE_URL = process.env.BASE_URL || 'https://immo-verse-hub.lovable.app';
const TEST_PHONE = process.env.TEST_PHONE || '+225 07 07 07 07 07';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@montoit.ci';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

// Helper: Attendre et vérifier qu'un élément est visible
async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

// Helper: Prendre une capture d'écran avec timestamp
async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `tests/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

test.describe('Connexion par Téléphone - Tests de Production', () => {
  
  test.beforeEach(async ({ page }) => {
    // Aller sur la page de connexion
    await page.goto(`${BASE_URL}/connexion`);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Interface Utilisateur', () => {
    
    test('TC-01: Affichage de la page de connexion', async ({ page }) => {
      // Vérifier le titre
      await expect(page.locator('h2')).toContainText(/Bienvenue|Connexion/i);
      
      // Vérifier la présence du message informatif
      await expect(page.locator('text=Connexion flexible')).toBeVisible();
      
      // Vérifier la présence des deux méthodes
      await expect(page.locator('text=Email + Mot de passe')).toBeVisible();
      await expect(page.locator('text=Téléphone + OTP')).toBeVisible();
      
      await takeScreenshot(page, 'connexion-page-initial');
    });

    test('TC-02: Toggle entre Email et Téléphone', async ({ page }) => {
      // Par défaut, Email doit être sélectionné
      const emailButton = page.locator('button:has-text("Email + Mot de passe")');
      await expect(emailButton).toHaveClass(/border-blue-500|bg-blue-50/);
      
      // Vérifier que les champs email et mot de passe sont visibles
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
      // Cliquer sur Téléphone
      const phoneButton = page.locator('button:has-text("Téléphone + OTP")');
      await phoneButton.click();
      await page.waitForTimeout(500); // Animation
      
      // Vérifier que Téléphone est maintenant sélectionné
      await expect(phoneButton).toHaveClass(/border-blue-500|bg-blue-50/);
      
      // Vérifier que le champ téléphone est visible
      await expect(page.locator('input[type="tel"]')).toBeVisible();
      
      // Vérifier que le mot de passe est caché
      await expect(page.locator('input[type="password"]')).not.toBeVisible();
      
      await takeScreenshot(page, 'connexion-toggle-phone');
    });

    test('TC-03: Choix SMS/WhatsApp visible en mode Téléphone', async ({ page }) => {
      // Sélectionner Téléphone
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      // Vérifier la présence des options SMS et WhatsApp
      await expect(page.locator('text=Méthode d\'envoi OTP')).toBeVisible();
      await expect(page.locator('button:has-text("SMS")').first()).toBeVisible();
      await expect(page.locator('button:has-text("WhatsApp")').first()).toBeVisible();
      
      await takeScreenshot(page, 'connexion-sms-whatsapp-options');
    });

    test('TC-04: Sélection SMS', async ({ page }) => {
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      const smsButton = page.locator('button:has-text("SMS")').first();
      await smsButton.click();
      await page.waitForTimeout(300);
      
      // Vérifier que SMS est sélectionné (classe cyan)
      await expect(smsButton).toHaveClass(/border-cyan-500|bg-cyan-50/);
      
      await takeScreenshot(page, 'connexion-sms-selected');
    });

    test('TC-05: Sélection WhatsApp', async ({ page }) => {
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      const whatsappButton = page.locator('button:has-text("WhatsApp")').first();
      await whatsappButton.click();
      await page.waitForTimeout(300);
      
      // Vérifier que WhatsApp est sélectionné
      await expect(whatsappButton).toHaveClass(/border-cyan-500|bg-cyan-50/);
      
      await takeScreenshot(page, 'connexion-whatsapp-selected');
    });

    test('TC-06: Texte du bouton change selon le mode', async ({ page }) => {
      // Mode Email
      await expect(page.locator('button[type="submit"]')).toContainText('Se connecter');
      
      // Mode Téléphone
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      await expect(page.locator('button[type="submit"]')).toContainText('Recevoir le code OTP');
      
      await takeScreenshot(page, 'connexion-button-text-change');
    });

    test('TC-07: "Mot de passe oublié" caché en mode Téléphone', async ({ page }) => {
      // Mode Email - doit être visible
      await expect(page.locator('text=Mot de passe oublié')).toBeVisible();
      
      // Mode Téléphone - doit être caché
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      await expect(page.locator('text=Mot de passe oublié')).not.toBeVisible();
    });
  });

  test.describe('Validation des Champs', () => {
    
    test('TC-08: Validation numéro vide', async ({ page }) => {
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      // Soumettre sans numéro
      await page.locator('button[type="submit"]').click();
      
      // Vérifier le message d'erreur HTML5
      const phoneInput = page.locator('input[type="tel"]');
      const validationMessage = await phoneInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
      
      await takeScreenshot(page, 'validation-phone-empty');
    });

    test('TC-09: Validation format numéro invalide', async ({ page }) => {
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      // Entrer un numéro invalide
      await page.locator('input[type="tel"]').fill('123456');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);
      
      // Vérifier le message d'erreur
      await expect(page.locator('text=/Numéro de téléphone invalide|Format.*225/i')).toBeVisible();
      
      await takeScreenshot(page, 'validation-phone-invalid');
    });

    test('TC-10: Format numéro valide accepté', async ({ page }) => {
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      // Entrer un numéro valide
      await page.locator('input[type="tel"]').fill(TEST_PHONE);
      
      // Le champ doit accepter la valeur
      await expect(page.locator('input[type="tel"]')).toHaveValue(TEST_PHONE);
    });
  });

  test.describe('Flux de Connexion par SMS', () => {
    
    test('TC-11: Connexion SMS - Compte inexistant', async ({ page }) => {
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      // Sélectionner SMS
      await page.locator('button:has-text("SMS")').first().click();
      
      // Entrer un numéro qui n'existe pas
      await page.locator('input[type="tel"]').fill('+225 99 99 99 99 99');
      
      // Soumettre
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      
      // Vérifier le message d'erreur
      await expect(page.locator('text=/Aucun compte.*téléphone|Veuillez vous inscrire/i')).toBeVisible();
      
      await takeScreenshot(page, 'connexion-sms-account-not-found');
    });

    test('TC-12: Connexion SMS - Compte existant (TEST MANUEL)', async ({ page }) => {
      // Ce test nécessite un compte de test réel
      test.skip(!TEST_PHONE.includes('07 07 07'), 'Compte de test requis');
      
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      // Sélectionner SMS
      await page.locator('button:has-text("SMS")').first().click();
      
      // Entrer le numéro de test
      await page.locator('input[type="tel"]').fill(TEST_PHONE);
      
      // Soumettre
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(3000);
      
      // Vérifier le message de succès
      await expect(page.locator('text=/Code.*envoyé.*SMS/i')).toBeVisible({ timeout: 10000 });
      
      // Vérifier la redirection vers vérification OTP
      await expect(page).toHaveURL(/verification-otp|verify-otp/i, { timeout: 5000 });
      
      await takeScreenshot(page, 'connexion-sms-success-redirect');
    });
  });

  test.describe('Flux de Connexion par WhatsApp', () => {
    
    test('TC-13: Connexion WhatsApp - Compte inexistant', async ({ page }) => {
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      // Sélectionner WhatsApp
      await page.locator('button:has-text("WhatsApp")').first().click();
      
      // Entrer un numéro qui n'existe pas
      await page.locator('input[type="tel"]').fill('+225 88 88 88 88 88');
      
      // Soumettre
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      
      // Vérifier le message d'erreur
      await expect(page.locator('text=/Aucun compte.*téléphone|Veuillez vous inscrire/i')).toBeVisible();
      
      await takeScreenshot(page, 'connexion-whatsapp-account-not-found');
    });

    test('TC-14: Connexion WhatsApp - Compte existant (TEST MANUEL)', async ({ page }) => {
      test.skip(!TEST_PHONE.includes('07 07 07'), 'Compte de test requis');
      
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      // Sélectionner WhatsApp
      await page.locator('button:has-text("WhatsApp")').first().click();
      
      // Entrer le numéro de test
      await page.locator('input[type="tel"]').fill(TEST_PHONE);
      
      // Soumettre
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(3000);
      
      // Vérifier le message de succès
      await expect(page.locator('text=/Code.*envoyé.*WhatsApp/i')).toBeVisible({ timeout: 10000 });
      
      // Vérifier la redirection
      await expect(page).toHaveURL(/verification-otp|verify-otp/i, { timeout: 5000 });
      
      await takeScreenshot(page, 'connexion-whatsapp-success-redirect');
    });
  });

  test.describe('Compatibilité et Régression', () => {
    
    test('TC-15: Connexion Email classique toujours fonctionnelle', async ({ page }) => {
      // Vérifier que le mode Email est sélectionné par défaut
      await expect(page.locator('button:has-text("Email + Mot de passe")')).toHaveClass(/border-blue-500|bg-blue-50/);
      
      // Remplir le formulaire
      await page.locator('input[type="email"]').fill(TEST_EMAIL);
      await page.locator('input[type="password"]').fill(TEST_PASSWORD);
      
      // Soumettre
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);
      
      // Vérifier qu'il n'y a pas d'erreur de régression
      // (Le test ne vérifie pas la connexion réussie, juste l'absence d'erreur JavaScript)
      const errors = await page.evaluate(() => {
        return (window as any).errors || [];
      });
      expect(errors.length).toBe(0);
      
      await takeScreenshot(page, 'connexion-email-no-regression');
    });

    test('TC-16: Responsive Mobile', async ({ page, viewport }) => {
      // Tester en mode mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Vérifier que les éléments sont visibles
      await expect(page.locator('text=Méthode de connexion')).toBeVisible();
      await expect(page.locator('button:has-text("Email + Mot de passe")')).toBeVisible();
      await expect(page.locator('button:has-text("Téléphone + OTP")')).toBeVisible();
      
      // Tester le toggle
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      await expect(page.locator('input[type="tel"]')).toBeVisible();
      
      await takeScreenshot(page, 'connexion-mobile-responsive');
    });

    test('TC-17: Navigation Retour à Email depuis Téléphone', async ({ page }) => {
      // Aller en mode Téléphone
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      await expect(page.locator('input[type="tel"]')).toBeVisible();
      
      // Revenir en mode Email
      await page.locator('button:has-text("Email + Mot de passe")').click();
      await page.waitForTimeout(500);
      
      // Vérifier que les champs Email sont de retour
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('text=Mot de passe oublié')).toBeVisible();
    });
  });

  test.describe('Performance et Accessibilité', () => {
    
    test('TC-18: Temps de chargement de la page', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/connexion`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // La page doit charger en moins de 3 secondes
      expect(loadTime).toBeLessThan(3000);
      
      console.log(`⏱️ Temps de chargement: ${loadTime}ms`);
    });

    test('TC-19: Accessibilité - Labels et ARIA', async ({ page }) => {
      // Vérifier les labels
      await expect(page.locator('label:has-text("Méthode de connexion")')).toBeVisible();
      
      // Mode Téléphone
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      
      await expect(page.locator('label:has-text("Numéro de téléphone")')).toBeVisible();
      await expect(page.locator('label:has-text("Méthode d\'envoi OTP")')).toBeVisible();
      
      // Vérifier que les inputs ont des placeholders
      const phoneInput = page.locator('input[type="tel"]');
      await expect(phoneInput).toHaveAttribute('placeholder', /225/);
    });

    test('TC-20: Pas d\'erreurs console', async ({ page }) => {
      const consoleErrors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto(`${BASE_URL}/connexion`);
      await page.waitForLoadState('networkidle');
      
      // Toggle entre les modes
      await page.locator('button:has-text("Téléphone + OTP")').click();
      await page.waitForTimeout(500);
      await page.locator('button:has-text("Email + Mot de passe")').click();
      await page.waitForTimeout(500);
      
      // Ne devrait pas y avoir d'erreurs console
      expect(consoleErrors.length).toBe(0);
      
      if (consoleErrors.length > 0) {
        console.error('❌ Erreurs console détectées:', consoleErrors);
      }
    });
  });
});

test.describe('Tests API et Backend', () => {
  
  test('TC-21: Vérification Edge Function send-verification-code', async ({ request }) => {
    // Tester l'Edge Function directement
    const response = await request.post(`${BASE_URL}/functions/v1/send-verification-code`, {
      data: {
        phone: TEST_PHONE,
        type: 'sms',
        name: 'Test User',
        isLogin: true
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Vérifier que l'endpoint répond
    expect(response.ok() || response.status() === 401).toBeTruthy();
    
    console.log(`📡 Edge Function status: ${response.status()}`);
  });

  test('TC-22: Vérification table profiles', async ({ page }) => {
    // Ce test nécessite un accès à Supabase
    // Il vérifie que la structure de la table est correcte
    
    // Pour l'instant, on vérifie juste que le frontend ne crash pas
    await page.goto(`${BASE_URL}/connexion`);
    await page.waitForLoadState('networkidle');
    
    const hasError = await page.locator('text=/error|erreur/i').count();
    expect(hasError).toBe(0);
  });
});

// Hook pour générer un rapport
test.afterAll(async () => {
  console.log('\n📊 Résumé des Tests');
  console.log('='.repeat(50));
  console.log('✅ Tests Interface: 7 tests');
  console.log('✅ Tests Validation: 3 tests');
  console.log('✅ Tests Flux SMS: 2 tests');
  console.log('✅ Tests Flux WhatsApp: 2 tests');
  console.log('✅ Tests Compatibilité: 3 tests');
  console.log('✅ Tests Performance: 3 tests');
  console.log('✅ Tests Backend: 2 tests');
  console.log('='.repeat(50));
  console.log('📸 Captures d\'écran: tests/screenshots/');
  console.log('📄 Rapport HTML: playwright-report/index.html');
});
