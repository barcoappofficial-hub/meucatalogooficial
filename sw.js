// ATUALIZADO PARA V8 PARA GARANTIR QUE OS NOVOS LIMITES E O STORAGE SEJAM BAIXADOS
const CACHE_NAME = 'painel-gestor-v8-final';

const urlsToCache = [
  './',
  './admin.html',
  './index.html',
  './catalogo.html',
  './manifest.json',
  './logo.png',
  './firebase-config.js' // Essencial para a conexão com o banco
];

// 1. Instalação: Baixa os arquivos novos
self.addEventListener('install', (event) => {
  // Força o SW a assumir o controle imediatamente, sem esperar fechar o app
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache v8 aberto e arquivos salvos');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Ativação: Limpa os caches antigos (v7, v6...) para liberar espaço
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
  // Garante que as abas abertas já usem o novo SW imediatamente
  return self.clients.claim();
});

// 3. Interceptação: Serve o cache se existir, senão busca na rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se achou no cache, retorna. Se não, busca na internet (ex: imagens do Storage)
        return response || fetch(event.request);
      })
  );
});
