import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

const faviconPlugin = () => ({
  name: 'serve-root-favicon',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url === '/favicon.ico') {
        res.writeHead(302, { Location: '/saimoon/favicon.png' });
        res.end();
        return;
      }
      // Redirect /saimoon (without trailing slash) to /saimoon/
      if (req.url === '/saimoon' || req.url.startsWith('/saimoon?')) {
        const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        res.writeHead(301, { Location: `/saimoon/${query}` });
        res.end();
        return;
      }
      // Redirect root / or empty to /saimoon/
      if (req.url === '/' || req.url === '') {
        res.writeHead(302, { Location: '/saimoon/' });
        res.end();
        return;
      }
      next();
    });
  },
  configurePreviewServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url === '/favicon.ico') {
        res.writeHead(302, { Location: '/saimoon/favicon.png' });
        res.end();
        return;
      }
      if (req.url === '/saimoon' || req.url.startsWith('/saimoon?')) {
        const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        res.writeHead(301, { Location: `/saimoon/${query}` });
        res.end();
        return;
      }
      if (req.url === '/' || req.url === '') {
        res.writeHead(302, { Location: '/saimoon/' });
        res.end();
        return;
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  base: '/saimoon/',
  plugins: [inspectAttr(), react(), faviconPlugin()],
  server: {
    port: 3000,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    },
  },
  preview: {
    port: 3000,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-animation': ['gsap', 'framer-motion'],
          'vendor-icons': ['lucide-react'],
          'vendor-data': ['papaparse', 'zustand'],
        },
      },
    },
  },
});
