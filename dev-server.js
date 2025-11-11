const express = require('express');
const { createServer } = require('vite');

async function createDevServer() {
  const app = express();

  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    define: {
      // No problematic defines
    }
  });

  // Use vite's connect instance as middleware
  app.use(vite.ssrLoadModule);

  // Add aggressive cache-busting headers
  app.use((req, res, next) => {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Build-Time': Date.now().toString(),
      'X-Cache-Bust': Math.random().toString(36).substring(7)
    });
    next();
  });

  app.use(vite.middlewares);

  const port = 4000;
  app.listen(port, '127.0.0.1', () => {
    console.log('🚀 Dev server running at: http://127.0.0.1:4000');
    console.log('✅ Cache-busting headers enabled');
    console.log('✅ No problematic defines');
    console.log('🎯 All syntax errors should be resolved!');
  });
}

createDevServer().catch(console.error);
