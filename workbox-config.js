// Service worker per l'uso offline: mette in cache tutto il sito esportato in dist/.
// skipWaiting + clientsClaim: una nuova versione pubblicata si attiva alla prima
// riapertura, senza restare bloccati sulla vecchia copia in cache.
module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,html,css,ttf,ico,json,png}'],
  swDest: 'dist/sw.js',
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  skipWaiting: true,
  clientsClaim: true,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
};
