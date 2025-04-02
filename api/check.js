// api/check.js
export default async (req, res) => {
  // Support for both single URL and batch mode
  const urls = req.query.urls ? req.query.urls.split(',') : [req.query.url];
  const results = {};
  
  try {
    // Process all URLs in parallel
    await Promise.all(urls.map(async (url) => {
      if (!url) return;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`https://${url}`, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; GovMonitor/1.0; +https://govstatustracker.org)'
          }
        });

        clearTimeout(timeoutId);
        
        // Consider 3xx and 4xx codes differently
        const statusCode = response.status;
        const isOnline = statusCode < 400;
        
        results[url] = {
          status: isOnline ? 'online' : 'offline',
          code: statusCode,
          finalUrl: response.url,
          checked: new Date().toISOString()
        };
      } catch (error) {
        results[url] = {
          status: 'offline',
          code: 0,
          error: error.message,
          checked: new Date().toISOString()
        };
      }
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'max-age=300');
    
    // If only one URL was requested, return the direct result for backward compatibility
    if (Object.keys(results).length === 1 && req.query.url) {
      res.status(200).json(results[req.query.url]);
    } else {
      res.status(200).json(results);
    }
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({
      error: error.message
    });
  }
};
