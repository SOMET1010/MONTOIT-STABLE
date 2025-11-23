// Service Worker pour Mon Toit - Optimisation performance et cache
const CACHE_NAME = 'mon-toit-v2';
const STATIC_CACHE = 'mon-toit-static-v2';
const DYNAMIC_CACHE = 'mon-toit-dynamic-v2';

// URLs à mettre en cache au démarrage
const STATIC_ASSETS = [
  '/',
  '/recherche',
  '/dashboard/locataire',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo-montoit.png'
];

// Durée de cache (7 jours pour les assets statiques, 1 jour pour le dynamique)
const STATIC_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours en ms
const DYNAMIC_CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 jour en ms

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => {
        console.log('✅ Static assets cached');
        return caches.open(DYNAMIC_CACHE);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        // Précharger les pages les plus importantes
        return preloadCriticalPages();
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  
  // Nettoyer les anciens caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName !== STATIC_CACHE && 
            cacheName !== DYNAMIC_CACHE
          )
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('✅ Old caches cleaned');
      // Prendre le contrôle des pages immédiatement
      return self.clients.claim();
    })
  );
});

// Stratégie de cache : Network First avec fallback au cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return fetch(request);
  }

  // Ignorer les requêtes vers d'autres domaines
  if (url.origin !== location.origin) {
    return fetch(request);
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Stratégie différente selon le type de contenu
      if (isStaticAsset(url.pathname)) {
        // Pour les assets statiques : Cache First
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          // Mettre en cache la réponse réseau
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      } else {
        // Pour le contenu dynamique : Network First avec fallback cache
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            // Mettre en cache les réponses réussies
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
            return networkResponse;
          } else if (cachedResponse) {
            // Fallback vers le cache si le réseau échoue
            return cachedResponse;
          }
          // Si pas de cache et réseau échoue, retourner une erreur
          return new Response('Network error', { 
            status: 408, 
            statusText: 'Request Timeout' 
          });
        }).catch(() => {
          // En cas d'erreur réseau, utiliser le cache si disponible
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response('Offline', { 
            status: 503, 
            statusText: 'Service Unavailable' 
          });
        });
      }
    })
  );
});

// Vérifier si c'est un asset statique
function isStaticAsset(pathname) {
  return pathname.includes('/static/') || 
         pathname.includes('.js') || 
         pathname.includes('.css') || 
         pathname.includes('.png') || 
         pathname.includes('.jpg') || 
         pathname.includes('.svg');
}

// Précharger les pages critiques
async function preloadCriticalPages() {
  const criticalPages = [
    '/dashboard/locataire',
    '/recherche',
    '/mes-contrats'
  ];

  for (const page of criticalPages) {
    try {
      await fetch(page);
      console.log(`📦 Preloaded: ${page}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload: ${page}`, error);
    }
  }
}

// Gestion des messages du client
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      // Forcer le passage en mode actif du Service Worker
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      // Retourner la version du Service Worker
      event.ports[0].post({ version: '2.0.0' });
      break;
      
    case 'CACHE_DYNAMIC_PAGE':
      // Mettre en cache une page spécifique
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(payload.url).then((existing) => {
          if (!existing) {
            return fetch(payload.url).then((response) => {
              if (response.ok) {
                return cache.put(payload.url, response);
              }
            });
          }
        });
      });
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
});

// Nettoyage périodique du cache
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEANUP_CACHE') {
    caches.open(DYNAMIC_CACHE).then((cache) => {
      return cache.keys().then((requests) => {
        return Promise.all(
          requests
            .filter((request) => {
              // Supprimer les anciennes entrées (plus de 7 jours)
              const url = new URL(request);
              return url.searchParams.has('timestamp') && 
                     Date.now() - parseInt(url.searchParams.get('timestamp')) > DYNAMIC_CACHE_DURATION;
            })
            .map((request) => cache.delete(request))
        );
      });
    });
  }
});

// Background sync pour les actions offline
self.addEventListener('sync', (event) => {
  const { tag } = event.tag;
  
  switch (tag) {
    case 'background-sync-messages':
      // Synchroniser les messages envoyés hors ligne
      event.waitUntil(syncMessages());
      break;
      
    case 'background-sync-applications':
      // Synchroniser les candidatures sauvegardées hors ligne
      event.waitUntil(syncApplications());
      break;
      
    default:
      console.warn('Unknown sync tag:', tag);
  }
});

// Fonctions de synchronisation
async function syncMessages() {
  // Récupérer les messages depuis IndexedDB et les envoyer au serveur
  try {
    const messages = await getOfflineMessages();
    for (const message of messages) {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      
      if (response.ok) {
        await removeOfflineMessage(message.id);
      }
    }
  } catch (error) {
    console.error('Failed to sync messages:', error);
  }
}

async function syncApplications() {
  // Synchroniser les candidatures sauvegardées
  try {
    const applications = await getOfflineApplications();
    for (const application of applications) {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });
      
      if (response.ok) {
        await removeOfflineApplication(application.id);
      }
    }
  } catch (error) {
    console.error('Failed to sync applications:', error);
  }
}

// Fonctions IndexedDB pour le stockage offline (simplifié)
async function getOfflineMessages() {
  // Implémentation simplifiée - à remplacer avec votre propre IndexedDB
  return [];
}

async function getOfflineApplications() {
  // Implémentation simplifiée - à remplacer avec votre propre IndexedDB
  return [];
}

async function removeOfflineMessage(id) {
  // Implémentation à compléter
}

async function removeOfflineApplication(id) {
  // Implémentation à compléter
}

console.log('🚀 Service Worker for Mon Toit loaded successfully');