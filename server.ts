import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

interface CachedItem {
  data: any;
  timestamp: number;
}

// In-memory cache for MedEx search results (30 minute TTL)
const medexCache = new Map<string, CachedItem>();
const CACHE_TTL_MS = 30 * 60 * 1000;

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
      },
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function parseMedexSearch(query: string) {
  const cacheKey = `search:${query.toLowerCase().trim()}`;
  const cached = medexCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, cached: true };
  }

  const searchUrl = `https://medex.com.bd/search?search=${encodeURIComponent(query)}`;
  const res = await fetchWithTimeout(searchUrl);
  if (!res.ok) {
    throw new Error(`MedEx server responded with HTTP status ${res.status}`);
  }

  const html = await res.text();
  const rowRegex = /<div class="search-result-row">[\s\S]*?<img src=[\x27"]([^\x27"]+)[\x27"][^>]*alt=[\x27"]([^\x27"]*)[\x27"][^>]*>[\s\S]*?<a href="([^"]*\/brands\/[^"]*)">\s*([\s\S]*?)\s*<\/a>[\s\S]*?<p>\s*([\s\S]*?)\s*<\/p>/gi;
  
  const rawResults: Array<{
    name: string;
    form: string;
    icon: string;
    link: string;
    generic: string;
    company: string;
    description: string;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(html)) !== null && rawResults.length < 8) {
    const icon = match[1];
    const form = match[2];
    const link = match[3];
    const name = match[4].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const rawDesc = match[5].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const genMatch = rawDesc.match(/\(([^)]+)\)/);
    const compMatch = rawDesc.match(/manufactured by\s+([^.]+)/i);

    rawResults.push({
      name,
      form,
      icon,
      link,
      generic: genMatch ? genMatch[1].trim() : '',
      company: compMatch ? compMatch[1].trim() : '',
      description: rawDesc,
    });
  }

  // Enrich top 5 brand items with real-time pricing from their respective brand page
  const enrichedResults = await Promise.all(
    rawResults.map(async (item, index) => {
      // Only fetch full brand page for top 5 to keep response time fast (<1.2s)
      if (index >= 5) {
        return {
          id: `medex-${item.link.replace(/[^a-zA-Z0-9]/g, '-')}`,
          ...item,
          unitPrice: null,
          stripPrice: null,
          packInfo: null,
          packages: [],
        };
      }

      try {
        const brandRes = await fetchWithTimeout(item.link, 5000);
        if (!brandRes.ok) throw new Error('Brand fetch failed');
        const brandHtml = await brandRes.text();

        const unitMatch = brandHtml.match(/Unit Price:\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);
        const stripMatch = brandHtml.match(/Strip Price:\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);
        const packInfoMatch = brandHtml.match(/pack-size-info">\s*([^<]+)/i);

        const packages: Array<{
          type: 'unit_strip' | 'pack_item';
          unitPrice?: string;
          stripPrice?: string;
          packInfo?: string;
          label?: string;
          price?: string;
        }> = [];

        // Parse packages from brand page
        const pkgRegex = /<div class="package-container[^"]*">([\s\S]*?)<\/div>/gi;
        let pm: RegExpExecArray | null;
        while ((pm = pkgRegex.exec(brandHtml)) !== null) {
          const block = pm[1];
          const uM = block.match(/Unit Price:\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);
          const sM = block.match(/Strip Price:\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);
          const pM = block.match(/pack-size-info">\s*([^<]+)/i);
          const genericLabelMatch = block.match(/<span[^>]*style="[^"]*#3a5571[^"]*"[^>]*>\s*([^:<]+):?\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);

          if (uM) {
            packages.push({
              type: 'unit_strip',
              unitPrice: uM[1],
              stripPrice: sM ? sM[1] : undefined,
              packInfo: pM ? pM[1].trim() : undefined,
            });
          } else if (genericLabelMatch) {
            packages.push({
              type: 'pack_item',
              label: genericLabelMatch[1].trim(),
              price: genericLabelMatch[2].trim(),
              packInfo: pM ? pM[1].trim() : undefined,
            });
          }
        }

        return {
          id: `medex-${item.link.replace(/[^a-zA-Z0-9]/g, '-')}`,
          ...item,
          unitPrice: unitMatch ? unitMatch[1] : (packages[0]?.price || null),
          stripPrice: stripMatch ? stripMatch[1] : null,
          packInfo: packInfoMatch ? packInfoMatch[1].trim() : (packages[0]?.label || null),
          packages,
        };
      } catch (err) {
        return {
          id: `medex-${item.link.replace(/[^a-zA-Z0-9]/g, '-')}`,
          ...item,
          unitPrice: null,
          stripPrice: null,
          packInfo: null,
          packages: [],
        };
      }
    })
  );

  const resultData = {
    query,
    count: enrichedResults.length,
    results: enrichedResults,
    source: 'medex.com.bd',
    timestamp: Date.now(),
  };

  medexCache.set(cacheKey, { data: resultData, timestamp: Date.now() });
  return resultData;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // MedEx Real-time Price & Product Search API
  app.get('/api/medex/search', async (req, res) => {
    const query = String(req.query.query || req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    try {
      const data = await parseMedexSearch(query);
      res.json(data);
    } catch (error: any) {
      console.error('MedEx search error:', error);
      res.status(502).json({
        error: 'Failed to fetch real-time price from MedEx',
        message: error?.message || 'Network error or timeout connecting to medex.com.bd',
        query,
      });
    }
  });

  // Detailed Brand Page Inspection Endpoint
  app.get('/api/medex/details', async (req, res) => {
    const brandUrl = String(req.query.url || '').trim();
    if (!brandUrl || !brandUrl.startsWith('https://medex.com.bd/brands/')) {
      return res.status(400).json({ error: 'Valid MedEx brand URL is required' });
    }

    const cacheKey = `brand:${brandUrl}`;
    const cached = medexCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ ...cached.data, cached: true });
    }

    try {
      const resp = await fetchWithTimeout(brandUrl, 6000);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();

      const unitMatch = html.match(/Unit Price:\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);
      const stripMatch = html.match(/Strip Price:\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);
      const packInfoMatch = html.match(/pack-size-info">\s*([^<]+)/i);
      const indMatch = html.match(/id="indications"[\s\S]*?<div class="body-text">([\s\S]*?)<\/div>/i);
      const dosageMatch = html.match(/id="dosage"[\s\S]*?<div class="body-text">([\s\S]*?)<\/div>/i);

      const packages: Array<any> = [];
      const pkgRegex = /<div class="package-container[^"]*">([\s\S]*?)<\/div>/gi;
      let pm: RegExpExecArray | null;
      while ((pm = pkgRegex.exec(html)) !== null) {
        const block = pm[1];
        const uM = block.match(/Unit Price:\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);
        const sM = block.match(/Strip Price:\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);
        const pM = block.match(/pack-size-info">\s*([^<]+)/i);
        const gLabel = block.match(/<span[^>]*style="[^"]*#3a5571[^"]*"[^>]*>\s*([^:<]+):?\s*<\/span>\s*<span>\s*৳\s*([0-9.,]+)/i);

        if (uM) {
          packages.push({
            type: 'unit_strip',
            unitPrice: uM[1],
            stripPrice: sM ? sM[1] : null,
            packInfo: pM ? pM[1].trim() : null,
          });
        } else if (gLabel) {
          packages.push({
            type: 'pack_item',
            label: gLabel[1].trim(),
            price: gLabel[2].trim(),
            packInfo: pM ? pM[1].trim() : null,
          });
        }
      }

      const brandDetails = {
        url: brandUrl,
        unitPrice: unitMatch ? unitMatch[1] : (packages[0]?.price || null),
        stripPrice: stripMatch ? stripMatch[1] : null,
        packInfo: packInfoMatch ? packInfoMatch[1].trim() : null,
        packages,
        indications: indMatch ? indMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null,
        dosage: dosageMatch ? dosageMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null,
        timestamp: Date.now(),
      };

      medexCache.set(cacheKey, { data: brandDetails, timestamp: Date.now() });
      res.json(brandDetails);
    } catch (error: any) {
      res.status(502).json({
        error: 'Failed to fetch brand details',
        message: error?.message || 'Error connecting to MedEx',
      });
    }
  });

  // PWA Service Worker & Web App Manifest specific headers for PWABuilder
  app.get('/sw.js', (req, res, next) => {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
  });

  app.get(['/manifest.json', '/manifest.webmanifest'], (req, res, next) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediExpences POS server running on port ${PORT}`);
  });
}

startServer();
