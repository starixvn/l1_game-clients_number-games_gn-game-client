const installEvent = () => {
  self.addEventListener('install', () => {
      console.log('service worker installed');
  });
};
installEvent();

const activateEvent = () => {
  self.addEventListener('activate', () => {
      console.log('service worker activated');
  });
};
activateEvent();

const cacheName = 'v2';

const cacheClone = async (e) => {
  const res = await fetch(e.request);
  const resClone = res.clone();

  const cache = await caches.open(cacheName);
  await cache.put(e.request, resClone);
  return res;
};


const fetchEvent = () => {
  self.addEventListener('fetch', (event) => {
      const url = new URL(event.request.url);
      const extensions = ["mp3", "png", "webp","jpg", "gif", "svg", "font"];
      const isMatchingExtension = extensions.some(ext => url.pathname.endsWith(`.${ext}`));

      if (isMatchingExtension) {
          event.respondWith((async () => {
              try {
                  await cacheClone(event)
                      .catch(async () => await caches.match(event.request))
                      .then(async (res) => res);
              } catch (e) {
                  console.error(e);
              }

              return fetch(event.request);
          })());
      }
  });
};

fetchEvent();