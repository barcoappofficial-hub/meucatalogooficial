// MUDAMOS PARA V7 PARA OBRIGAR A ATUALIZAÇÃO NOS CELULARES
const CACHE_NAME = 'painel-gestor-v7-storage';

const urlsToCache = [
  './',
  './admin.html',
  './index.html',
  './catalogo.html',
  './manifest.json',
  './logo.png',
  './firebase-config.js' // Adicionado para garantir o funcionamento offline do config
];

// 1. Instalação: Baixa os arquivos novos
self.addEventListener('install', (event) => {
  // Força o SW a assumir o controle imediatamente
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto e arquivos salvos');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Ativação: Limpa os caches antigos (v6, v5...) para liberar espaço
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
  // Garante que as abas abertas já usem o novo SW
  return self.clients.claim();
});

// 3. Interceptação: Serve o cache se existir, senão busca na rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se achou no cache, retorna. Se não, busca na internet (ex: imagens do Firebase Storage)
        return response || fetch(event.request);
      })
  );
});
