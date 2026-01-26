// ATUALIZADO PARA V10 - CORREÇÃO CRÍTICA DE IMAGEM (CORS)
const CACHE_NAME = 'painel-gestor-v10-cors';

const urlsToCache = [
  './',
  './index.html',
  './admin.html',
  './entrada.html', // A nova capa precisa ser salva
  './catalogo.html',
  './manifest.json',
  './logo.png',
  './firebase-config.js'
];

// 1. Instalação: Baixa os arquivos novos
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força a atualização imediata
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache v10 aberto e arquivos salvos');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Ativação: Limpa os caches antigos (v9, v8...)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Apagando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Interceptação: Gerencia o tráfego de rede
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // --- PROTEÇÃO CONTRA ERRO DE IMAGEM (NOVO) ---
  // Se a url for do Firebase Storage ou Google APIs, o Service Worker NÃO mexe.
  // Deixa passar direto para a rede. Isso evita o erro de CORS ao desenhar no Canvas.
  if (url.hostname.includes('firebase') || url.hostname.includes('google') || url.hostname.includes('googleapis')) {
    return; // Sai da função e deixa o navegador cuidar normalmente
  }

  // Estratégia "Network First" para HTML (Admin, Entrada, Catalogo)
  // Tenta baixar a versão mais nova. Se falhar (offline), usa o cache.
  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(req); // Se estiver offline, usa o cache
        })
    );
  } else {
    // Estratégia "Cache First" para imagens locais, JS, CSS, fontes
    // Tenta pegar do cache primeiro para ser rápido. Se não tiver, baixa.
    event.respondWith(
      caches.match(req).then((response) => {
        return response || fetch(req);
      })
    );
  }
});
