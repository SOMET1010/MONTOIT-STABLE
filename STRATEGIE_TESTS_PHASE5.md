# 🧪 STRATÉGIE DE TESTS - PHASE 5 (2-3 JOURS)

**Date de création :** 21 novembre 2025  
**Auteur :** Manus AI  
**Dépôt :** MONTOIT-STABLE v4.0.0  
**Objectif :** Implémenter une couverture de tests complète en 2-3 jours

---

## 📊 ÉTAT ACTUEL DES TESTS

### Analyse du Dépôt

L'analyse du dépôt MONTOIT-STABLE révèle une situation contrastée concernant les tests. Le frontend dispose d'une **infrastructure de tests configurée** mais **aucun test n'est implémenté**, tandis que les Edge Functions n'ont **aucune infrastructure de tests**.

| Composant | Infrastructure | Tests Implémentés | Couverture |
|-----------|---------------|-------------------|------------|
| **Frontend (React)** | ✅ Configuré | ❌ 0 test | 0% |
| **Edge Functions (69)** | ❌ Absente | ❌ 0 test | 0% |
| **Base de données** | ❌ Absente | ❌ 0 test | 0% |
| **E2E** | ❌ Absente | ❌ 0 test | 0% |

### Infrastructure Frontend Existante

Le frontend dispose déjà d'une configuration Vitest complète et fonctionnelle :

**Outils configurés :**
- **Vitest 1.6.1** - Framework de tests moderne pour Vite
- **@testing-library/react 14.3.1** - Tests de composants React
- **@testing-library/jest-dom 6.9.1** - Matchers DOM personnalisés
- **@vitest/ui 1.6.1** - Interface graphique pour les tests

**Configuration vitest.config.ts :**
- Environnement jsdom pour simuler le navigateur
- Couverture de code avec V8
- Seuils de couverture : 70% (lignes, fonctions, branches, statements)
- Setup automatique avec `src/test/setup.ts`

**Scripts npm disponibles :**
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

### Infrastructure Edge Functions

Les Edge Functions (69 au total) **ne disposent d'aucune infrastructure de tests**. Cependant, Supabase CLI 2.54.10 est installé et supporte les tests Deno natifs.

---

## 🎯 STRATÉGIE GLOBALE (2-3 JOURS)

### Approche Pragmatique

Plutôt que de viser une couverture exhaustive de 100%, cette stratégie adopte une approche pragmatique basée sur le **principe de Pareto** : tester les **20% de fonctionnalités critiques** qui représentent **80% de l'utilisation** de la plateforme.

### Priorisation par Criticité

La stratégie priorise les tests selon trois niveaux de criticité identifiés dans l'analyse précédente :

**Niveau 1 - CRITIQUE** (9 fonctions) : Fonctionnalités essentielles au business (signature, paiements, scoring)  
**Niveau 2 - HAUTE** (9 fonctions) : Fonctionnalités importantes pour l'expérience utilisateur  
**Niveau 3 - MOYENNE** (12 fonctions) : Fonctionnalités de support et analytics

Les 39 fonctions restantes (basses priorité) seront testées ultérieurement.

### Répartition du Temps

| Jour | Activités | Livrables |
|------|-----------|-----------|
| **Jour 1** | Infrastructure + Tests critiques | 9 Edge Functions testées |
| **Jour 2** | Tests haute priorité + Frontend | 9 Edge Functions + 5 composants |
| **Jour 3** | Tests d'intégration + Performance | Workflows E2E + Benchmarks |

---

## 📅 JOUR 1 : INFRASTRUCTURE + TESTS CRITIQUES

### Matin (4h) : Mise en Place de l'Infrastructure

#### 1.1 Installation de Deno (15 min)

Les Edge Functions Supabase s'exécutent sur Deno. L'installation est nécessaire pour les tests locaux.

```bash
# Installation de Deno
curl -fsSL https://deno.land/x/install/install.sh | sh

# Ajout au PATH
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Vérification
deno --version
```

#### 1.2 Création de la Structure de Tests (30 min)

Créer une structure organisée pour tous les types de tests :

```bash
cd /home/ubuntu/MONTOIT-STABLE

# Structure pour Edge Functions
mkdir -p supabase/functions/_tests/{unit,integration,mocks}

# Structure pour tests E2E
mkdir -p tests/{e2e,performance,fixtures}

# Fichiers de configuration
touch supabase/functions/_tests/test_helper.ts
touch tests/e2e/playwright.config.ts
```

#### 1.3 Création des Utilitaires de Tests (1h)

Créer des helpers réutilisables pour simplifier l'écriture des tests.

**Fichier : `supabase/functions/_tests/test_helper.ts`**

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Configuration de test
export const TEST_CONFIG = {
  supabaseUrl: Deno.env.get('SUPABASE_URL') || 'http://localhost:54321',
  supabaseKey: Deno.env.get('SUPABASE_ANON_KEY') || 'test-key',
  supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'test-service-key',
};

// Client Supabase de test
export function getTestClient(useServiceRole = false) {
  return createClient(
    TEST_CONFIG.supabaseUrl,
    useServiceRole ? TEST_CONFIG.supabaseServiceKey : TEST_CONFIG.supabaseKey
  );
}

// Helper pour créer une requête HTTP de test
export function createTestRequest(
  method: string,
  body?: any,
  headers?: Record<string, string>
): Request {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  return new Request('http://localhost:8000', {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Helper pour extraire le JSON d'une réponse
export async function getResponseJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Helper pour assertions
export function assertResponse(
  response: Response,
  expectedStatus: number,
  message?: string
) {
  if (response.status !== expectedStatus) {
    throw new Error(
      message || `Expected status ${expectedStatus}, got ${response.status}`
    );
  }
}

// Mock de données
export const MOCK_USER = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  role: 'tenant',
};

export const MOCK_PROPERTY = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  title: 'Appartement Test',
  price: 150000,
  city: 'Abidjan',
};

// Helper pour nettoyer les données de test
export async function cleanupTestData(supabase: any, table: string, ids: string[]) {
  if (ids.length === 0) return;
  
  const { error } = await supabase
    .from(table)
    .delete()
    .in('id', ids);
    
  if (error) {
    console.warn(`Failed to cleanup ${table}:`, error);
  }
}
```

#### 1.4 Configuration des Mocks (1h)

Créer des mocks pour les services externes afin d'éviter les appels réels pendant les tests.

**Fichier : `supabase/functions/_tests/mocks/external_apis.ts`**

```typescript
// Mock pour CryptoNeo
export const mockCryptoNeoAPI = {
  auth: () => ({
    access_token: 'mock-token-123',
    expires_in: 3600,
  }),
  
  sendOTP: () => ({
    success: true,
    transaction_id: 'mock-txn-123',
  }),
  
  signDocument: () => ({
    success: true,
    signature_id: 'mock-sig-123',
    certificate_url: 'https://mock.cev.ci/cert/123',
  }),
};

// Mock pour InTouch (Mobile Money)
export const mockInTouchAPI = {
  initiatePayment: () => ({
    status: 'success',
    transaction_id: 'mock-pay-123',
    amount: 1000,
  }),
  
  webhook: () => ({
    event: 'payment.success',
    transaction_id: 'mock-pay-123',
  }),
};

// Mock pour Smile ID (Biométrie)
export const mockSmileIDAPI = {
  verifyFace: () => ({
    success: true,
    confidence: 0.95,
    match: true,
  }),
  
  verifyDocument: () => ({
    success: true,
    document_type: 'passport',
    verified: true,
  }),
};

// Mock pour OpenAI (SUTA Chat)
export const mockOpenAIAPI = {
  chat: () => ({
    choices: [{
      message: {
        role: 'assistant',
        content: 'Bonjour ! Comment puis-je vous aider ?',
      },
    }],
  }),
};

// Helper pour intercepter fetch
export function mockFetch(url: string, options?: RequestInit): Promise<Response> {
  // CryptoNeo
  if (url.includes('cryptoneo')) {
    if (url.includes('/auth')) {
      return Promise.resolve(new Response(JSON.stringify(mockCryptoNeoAPI.auth())));
    }
    if (url.includes('/otp')) {
      return Promise.resolve(new Response(JSON.stringify(mockCryptoNeoAPI.sendOTP())));
    }
    if (url.includes('/sign')) {
      return Promise.resolve(new Response(JSON.stringify(mockCryptoNeoAPI.signDocument())));
    }
  }
  
  // InTouch
  if (url.includes('intouch') || url.includes('mobile-money')) {
    return Promise.resolve(new Response(JSON.stringify(mockInTouchAPI.initiatePayment())));
  }
  
  // Smile ID
  if (url.includes('smileidentity')) {
    return Promise.resolve(new Response(JSON.stringify(mockSmileIDAPI.verifyFace())));
  }
  
  // OpenAI
  if (url.includes('openai.com')) {
    return Promise.resolve(new Response(JSON.stringify(mockOpenAIAPI.chat())));
  }
  
  // Par défaut, erreur
  return Promise.reject(new Error(`Unmocked URL: ${url}`));
}
```

### Après-midi (4h) : Tests des 9 Fonctions Critiques

#### 1.5 Tests CryptoNeo (6 fonctions - 2h)

**Fichier : `supabase/functions/_tests/unit/cryptoneo.test.ts`**

```typescript
import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { createTestRequest, getResponseJson, assertResponse, mockFetch } from "../test_helper.ts";

// Mock global fetch
globalThis.fetch = mockFetch as any;

Deno.test("CryptoNeo Auth - Should authenticate successfully", async () => {
  const { default: handler } = await import("../../cryptoneo-auth/index.ts");
  
  const request = createTestRequest("POST", {
    username: "test@montoit.ci",
    password: "test123",
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertExists(data.access_token);
  assertEquals(data.expires_in, 3600);
});

Deno.test("CryptoNeo Send OTP - Should send OTP successfully", async () => {
  const { default: handler } = await import("../../cryptoneo-send-otp/index.ts");
  
  const request = createTestRequest("POST", {
    phone: "+2250709123456",
    document_id: "doc-123",
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertEquals(data.success, true);
  assertExists(data.transaction_id);
});

Deno.test("CryptoNeo Sign Document - Should sign document successfully", async () => {
  const { default: handler } = await import("../../cryptoneo-sign-document/index.ts");
  
  const request = createTestRequest("POST", {
    document_id: "doc-123",
    otp: "123456",
    transaction_id: "txn-123",
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertEquals(data.success, true);
  assertExists(data.signature_id);
  assertExists(data.certificate_url);
});

// Tests similaires pour :
// - cryptoneo-generate-certificate
// - cryptoneo-verify-signature
// - cryptoneo-callback
```

**Commande pour exécuter :**
```bash
cd /home/ubuntu/MONTOIT-STABLE/supabase/functions
deno test --allow-net --allow-env _tests/unit/cryptoneo.test.ts
```

#### 1.6 Tests PDF & Scoring (3 fonctions - 1h)

**Fichier : `supabase/functions/_tests/unit/documents.test.ts`**

```typescript
import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { createTestRequest, getResponseJson, assertResponse } from "../test_helper.ts";

Deno.test("Generate Lease PDF - Should generate PDF successfully", async () => {
  const { default: handler } = await import("../../generate-lease-pdf/index.ts");
  
  const request = createTestRequest("POST", {
    lease_id: "lease-123",
    tenant_id: "tenant-123",
    property_id: "property-123",
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertExists(data.pdf_url);
  assertEquals(data.status, "generated");
});

Deno.test("Tenant Scoring - Should calculate score correctly", async () => {
  const { default: handler } = await import("../../tenant-scoring/index.ts");
  
  const request = createTestRequest("POST", {
    tenant_id: "tenant-123",
    income: 500000,
    employment_type: "permanent",
    credit_history: "good",
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertExists(data.score);
  assertEquals(typeof data.score, "number");
  assertEquals(data.score >= 0 && data.score <= 100, true);
});

Deno.test("Generate Receipt - Should generate receipt successfully", async () => {
  const { default: handler } = await import("../../generate-receipt/index.ts");
  
  const request = createTestRequest("POST", {
    payment_id: "pay-123",
    amount: 150000,
    tenant_name: "Jean Dupont",
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertExists(data.receipt_url);
  assertExists(data.receipt_number);
});
```

#### 1.7 Rapport de Fin de Journée (30 min)

Exécuter tous les tests et générer un rapport :

```bash
# Exécuter tous les tests unitaires
deno test --allow-net --allow-env _tests/unit/*.test.ts --reporter=json > test-results-day1.json

# Compter les tests passés
echo "Tests Day 1 completed:"
cat test-results-day1.json | grep -c '"status":"passed"'
```

**Objectif Jour 1 :** ✅ 9 fonctions critiques testées (18+ tests unitaires)

---

## 📅 JOUR 2 : TESTS HAUTE PRIORITÉ + FRONTEND

### Matin (4h) : Tests des 9 Fonctions Haute Priorité

#### 2.1 Tests Visites & Vérifications (5 fonctions - 2h)

**Fichier : `supabase/functions/_tests/unit/visits.test.ts`**

```typescript
import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { createTestRequest, getResponseJson, assertResponse, MOCK_PROPERTY, MOCK_USER } from "../test_helper.ts";

Deno.test("Book Property Visit - Should book visit successfully", async () => {
  const { default: handler } = await import("../../book-property-visit/index.ts");
  
  const request = createTestRequest("POST", {
    property_id: MOCK_PROPERTY.id,
    user_id: MOCK_USER.id,
    visit_date: "2025-11-25T10:00:00Z",
    amount: 5000,
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertExists(data.visit_id);
  assertExists(data.qr_code);
});

Deno.test("Verify Visit QR Code - Should verify QR code successfully", async () => {
  const { default: handler } = await import("../../verify-visit-qr-code/index.ts");
  
  const request = createTestRequest("POST", {
    qr_code: "mock-qr-123",
    property_id: MOCK_PROPERTY.id,
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertEquals(data.valid, true);
  assertExists(data.visit_details);
});

Deno.test("Passport Verification - Should verify passport", async () => {
  const { default: handler } = await import("../../passport-verification/index.ts");
  
  const request = createTestRequest("POST", {
    passport_number: "CI123456",
    user_id: MOCK_USER.id,
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertEquals(data.verified, true);
});

// Tests similaires pour face-verification et mobile-money-webhook
```

#### 2.2 Tests Gestion des Rôles (3 fonctions - 1h)

**Fichier : `supabase/functions/_tests/unit/roles.test.ts`**

```typescript
import { assertEquals, assertExists } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { createTestRequest, getResponseJson, assertResponse, MOCK_USER } from "../test_helper.ts";

Deno.test("Add Role - Should add role successfully", async () => {
  const { default: handler } = await import("../../add-role/index.ts");
  
  const request = createTestRequest("POST", {
    user_id: MOCK_USER.id,
    role: "landlord",
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertEquals(data.success, true);
  assertExists(data.roles);
});

Deno.test("Switch Role - Should switch role successfully", async () => {
  const { default: handler } = await import("../../switch-role/index.ts");
  
  const request = createTestRequest("POST", {
    user_id: MOCK_USER.id,
    new_role: "landlord",
  });
  
  const response = await handler(request);
  assertResponse(response, 200);
  
  const data = await getResponseJson(response);
  assertEquals(data.current_role, "landlord");
});

// Test pour switch-role-v2
```

#### 2.3 Rapport de Mi-Journée (30 min)

```bash
deno test --allow-net --allow-env _tests/unit/*.test.ts --reporter=dot
```

### Après-midi (4h) : Tests Frontend React

#### 2.4 Tests des Composants Critiques (3h)

Créer des tests pour les 5 composants les plus critiques du frontend.

**Fichier : `src/components/PropertyCard/PropertyCard.test.tsx`**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PropertyCard } from './PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: '1',
    title: 'Appartement 2 pièces',
    price: 150000,
    city: 'Abidjan',
    image_url: 'https://example.com/image.jpg',
  };

  it('should render property details correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Appartement 2 pièces')).toBeInTheDocument();
    expect(screen.getByText('150 000 FCFA')).toBeInTheDocument();
    expect(screen.getByText('Abidjan')).toBeInTheDocument();
  });

  it('should display property image', () => {
    render(<PropertyCard property={mockProperty} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockProperty.image_url);
  });
});
```

**Fichier : `src/components/SearchBar/SearchBar.test.tsx`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('should call onSearch when form is submitted', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByPlaceholderText(/rechercher/i);
    const button = screen.getByRole('button', { name: /rechercher/i });
    
    fireEvent.change(input, { target: { value: 'Abidjan' } });
    fireEvent.click(button);
    
    expect(onSearch).toHaveBeenCalledWith('Abidjan');
  });
});
```

**Fichier : `src/pages/PropertyDetails/PropertyDetails.test.tsx`**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PropertyDetails } from './PropertyDetails';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('PropertyDetails', () => {
  const queryClient = new QueryClient();
  
  it('should load and display property details', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PropertyDetails propertyId="123" />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/appartement/i)).toBeInTheDocument();
    });
  });
});
```

**Tests similaires pour :**
- `BookingForm.test.tsx`
- `PaymentForm.test.tsx`

#### 2.5 Exécution et Rapport (1h)

```bash
# Exécuter les tests frontend
cd /home/ubuntu/MONTOIT-STABLE
npm run test

# Générer le rapport de couverture
npm run test:coverage
```

**Objectif Jour 2 :** ✅ 9 fonctions haute priorité + 5 composants React testés (35+ tests)

---

## 📅 JOUR 3 : TESTS D'INTÉGRATION + PERFORMANCE

### Matin (4h) : Tests d'Intégration

#### 3.1 Installation de Playwright (30 min)

```bash
cd /home/ubuntu/MONTOIT-STABLE
npm install -D @playwright/test
npx playwright install chromium
```

**Configuration : `tests/e2e/playwright.config.ts`**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
});
```

#### 3.2 Tests E2E des Workflows Critiques (2h30)

**Fichier : `tests/e2e/booking-workflow.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Property Booking Workflow', () => {
  test('should complete full booking process', async ({ page }) => {
    // 1. Rechercher une propriété
    await page.goto('/');
    await page.fill('[data-testid="search-input"]', 'Abidjan');
    await page.click('[data-testid="search-button"]');
    
    // 2. Voir les résultats
    await expect(page.locator('.property-card')).toHaveCount(10, { timeout: 5000 });
    
    // 3. Cliquer sur une propriété
    await page.click('.property-card:first-child');
    
    // 4. Réserver une visite
    await page.click('[data-testid="book-visit-button"]');
    await page.fill('[data-testid="visit-date"]', '2025-11-25');
    await page.fill('[data-testid="visit-time"]', '10:00');
    await page.click('[data-testid="confirm-booking"]');
    
    // 5. Vérifier la confirmation
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
  });
});
```

**Fichier : `tests/e2e/payment-workflow.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Payment Workflow', () => {
  test('should process mobile money payment', async ({ page }) => {
    // 1. Aller à la page de paiement
    await page.goto('/payment/lease-123');
    
    // 2. Sélectionner Orange Money
    await page.click('[data-testid="payment-method-orange"]');
    
    // 3. Entrer le numéro de téléphone
    await page.fill('[data-testid="phone-number"]', '0709123456');
    
    // 4. Confirmer le paiement
    await page.click('[data-testid="confirm-payment"]');
    
    // 5. Attendre la confirmation
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 10000 });
  });
});
```

**Fichier : `tests/e2e/signature-workflow.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Electronic Signature Workflow', () => {
  test('should sign lease electronically', async ({ page }) => {
    // 1. Aller au bail
    await page.goto('/lease/lease-123');
    
    // 2. Cliquer sur "Signer électroniquement"
    await page.click('[data-testid="sign-electronically"]');
    
    // 3. Entrer le numéro de téléphone
    await page.fill('[data-testid="phone-number"]', '0709123456');
    await page.click('[data-testid="send-otp"]');
    
    // 4. Entrer l'OTP
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-otp"]');
    
    // 5. Vérifier la signature
    await expect(page.locator('[data-testid="signature-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="certificate-link"]')).toBeVisible();
  });
});
```

#### 3.3 Exécution des Tests E2E (1h)

```bash
# Démarrer le serveur de développement
npm run dev &

# Exécuter les tests E2E
npx playwright test

# Voir le rapport
npx playwright show-report
```

### Après-midi (4h) : Tests de Performance

#### 3.4 Tests de Performance des Edge Functions (2h)

**Fichier : `tests/performance/edge-functions-bench.ts`**

```typescript
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";

// Benchmark helper
async function benchmark(name: string, fn: () => Promise<any>, iterations: number = 100) {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];
  
  console.log(`\n${name}:`);
  console.log(`  Average: ${avg.toFixed(2)}ms`);
  console.log(`  Min: ${min.toFixed(2)}ms`);
  console.log(`  Max: ${max.toFixed(2)}ms`);
  console.log(`  P95: ${p95.toFixed(2)}ms`);
  
  return { avg, min, max, p95 };
}

Deno.test("Performance: Tenant Scoring", async () => {
  const { default: handler } = await import("../../supabase/functions/tenant-scoring/index.ts");
  
  const result = await benchmark("Tenant Scoring", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: "test-123",
        income: 500000,
      }),
    });
    await handler(request);
  }, 50);
  
  // Assertion: doit être < 500ms en moyenne
  assertEquals(result.avg < 500, true, `Average time ${result.avg}ms exceeds 500ms threshold`);
});

Deno.test("Performance: Generate Report", async () => {
  const { default: handler } = await import("../../supabase/functions/generate-report/index.ts");
  
  const result = await benchmark("Generate Report", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        report_type: "monthly",
        user_id: "test-123",
      }),
    });
    await handler(request);
  }, 20);
  
  // Assertion: doit être < 2000ms en moyenne
  assertEquals(result.avg < 2000, true, `Average time ${result.avg}ms exceeds 2000ms threshold`);
});
```

**Exécution :**
```bash
deno test --allow-net --allow-env tests/performance/edge-functions-bench.ts
```

#### 3.5 Tests de Charge avec k6 (2h)

**Installation de k6 :**
```bash
sudo apt-get update
sudo apt-get install -y k6
```

**Fichier : `tests/performance/load-test.js`**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 50 },   // Scale down to 50
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.05'],   // Error rate must be below 5%
  },
};

const BASE_URL = 'https://your-project.supabase.co/functions/v1';
const API_KEY = __ENV.SUPABASE_ANON_KEY;

export default function () {
  // Test 1: Search properties
  const searchRes = http.get(`${BASE_URL}/search-properties?city=Abidjan`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
  
  // Test 2: Get property details
  const detailsRes = http.get(`${BASE_URL}/get-property?id=123`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });
  
  check(detailsRes, {
    'details status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

**Exécution :**
```bash
export SUPABASE_ANON_KEY="your-anon-key"
k6 run tests/performance/load-test.js
```

---

## 📊 MÉTRIQUES DE SUCCÈS

### Objectifs de Couverture

| Type de Test | Objectif | Priorité |
|--------------|----------|----------|
| **Edge Functions Critiques** | 100% (9/9) | ⭐⭐⭐ |
| **Edge Functions Hautes** | 100% (9/9) | ⭐⭐ |
| **Composants React Critiques** | 100% (5/5) | ⭐⭐⭐ |
| **Workflows E2E** | 3 workflows | ⭐⭐⭐ |
| **Performance** | Benchmarks + Load | ⭐⭐ |

### Critères de Validation

**Tests Unitaires :**
- ✅ Tous les tests passent (0 échecs)
- ✅ Couverture de code ≥ 70% pour les fonctions testées
- ✅ Temps d'exécution < 5 minutes

**Tests d'Intégration :**
- ✅ 3 workflows E2E complets fonctionnels
- ✅ Screenshots/vidéos des échecs disponibles
- ✅ Temps d'exécution < 10 minutes

**Tests de Performance :**
- ✅ P95 < 500ms pour fonctions simples
- ✅ P95 < 2000ms pour fonctions complexes
- ✅ Taux d'erreur < 5% sous charge

---

## 🛠️ OUTILS ET COMMANDES

### Scripts npm à Ajouter

Ajouter ces scripts dans `package.json` :

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:edge": "cd supabase/functions && deno test --allow-net --allow-env _tests/unit/*.test.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:perf": "deno test --allow-net --allow-env tests/performance/*.ts",
    "test:load": "k6 run tests/performance/load-test.js",
    "test:all": "npm run test:edge && npm run test && npm run test:e2e"
  }
}
```

### Commandes Utiles

```bash
# Tests Edge Functions
npm run test:edge

# Tests Frontend
npm run test
npm run test:coverage

# Tests E2E
npm run test:e2e
npm run test:e2e:ui  # Mode interactif

# Tests de Performance
npm run test:perf
npm run test:load

# Tous les tests
npm run test:all
```

---

## 📝 CHECKLIST DE RÉALISATION

### Jour 1 ✅
- [ ] Installer Deno
- [ ] Créer la structure de tests
- [ ] Créer test_helper.ts
- [ ] Créer les mocks d'APIs externes
- [ ] Tester les 6 fonctions CryptoNeo
- [ ] Tester generate-lease-pdf
- [ ] Tester tenant-scoring
- [ ] Tester generate-receipt
- [ ] Générer le rapport Jour 1

### Jour 2 ✅
- [ ] Tester book-property-visit
- [ ] Tester verify-visit-qr-code
- [ ] Tester passport-verification
- [ ] Tester face-verification
- [ ] Tester mobile-money-webhook
- [ ] Tester add-role
- [ ] Tester switch-role
- [ ] Tester switch-role-v2
- [ ] Tester PropertyCard
- [ ] Tester SearchBar
- [ ] Tester PropertyDetails
- [ ] Tester BookingForm
- [ ] Tester PaymentForm
- [ ] Générer le rapport de couverture frontend

### Jour 3 ✅
- [ ] Installer Playwright
- [ ] Configurer Playwright
- [ ] Créer test E2E booking workflow
- [ ] Créer test E2E payment workflow
- [ ] Créer test E2E signature workflow
- [ ] Exécuter les tests E2E
- [ ] Créer benchmarks Edge Functions
- [ ] Installer k6
- [ ] Créer tests de charge k6
- [ ] Exécuter les tests de charge
- [ ] Générer le rapport final

---

## 🎯 RÉSULTATS ATTENDUS

### Fin de la Phase 5 (Jour 3)

**Couverture de Tests :**
- ✅ **18 Edge Functions testées** (9 critiques + 9 hautes)
- ✅ **5 composants React testés**
- ✅ **3 workflows E2E complets**
- ✅ **Benchmarks de performance** pour fonctions critiques
- ✅ **Tests de charge** jusqu'à 100 utilisateurs simultanés

**Métriques :**
- ✅ **60+ tests unitaires** écrits et passants
- ✅ **Couverture de code ≥ 70%** pour le code testé
- ✅ **3 workflows E2E** validés
- ✅ **Performance P95 < 500ms** pour fonctions simples
- ✅ **Taux d'erreur < 5%** sous charge

**Livrables :**
- ✅ Infrastructure de tests complète
- ✅ Suite de tests réutilisable
- ✅ Mocks d'APIs externes
- ✅ Rapports de tests automatisés
- ✅ Documentation des tests

---

## 🚀 APRÈS LA PHASE 5

### Prochaines Étapes

Une fois la Phase 5 complétée, les prochaines étapes recommandées sont :

**Intégration Continue (CI) :**
- Configurer GitHub Actions pour exécuter les tests automatiquement
- Bloquer les merges si les tests échouent
- Générer des rapports de couverture automatiques

**Extension de la Couverture :**
- Tester les 12 fonctions de priorité moyenne
- Tester les 39 fonctions de priorité basse
- Augmenter la couverture frontend à 80%+

**Monitoring en Production :**
- Implémenter Sentry pour le tracking d'erreurs
- Configurer des alertes de performance
- Créer des dashboards de métriques

---

## 💡 CONCLUSION

Cette stratégie de tests en **2-3 jours** permet d'atteindre une couverture significative des fonctionnalités critiques de la plateforme Mon Toit. En se concentrant sur les **20% de fonctionnalités** qui représentent **80% de l'utilisation**, elle offre un excellent retour sur investissement.

L'approche pragmatique adoptée garantit que les fonctionnalités essentielles au business (signature électronique, paiements, scoring) sont robustement testées, tout en établissant une infrastructure de tests réutilisable pour l'avenir.

Les tests unitaires, d'intégration et de performance créés serviront de **filet de sécurité** pour les refactorings futurs et permettront de détecter les régressions avant qu'elles n'atteignent la production.

---

**Stratégie de tests créée par Manus AI**  
**Date : 21 novembre 2025**  
**Version : 1.0**

