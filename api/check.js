// api/check.js
export default async (req, res) => {
  const url = req.query.url;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(`https://${url}`, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GovMonitor/1.0; +https://github.com/your-repo)'
      }
    });

    clearTimeout(timeoutId);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'max-age=300');
    
    // Consider 3xx and 4xx codes differently
    const statusCode = response.status;
    const isOnline = statusCode < 400;
    
    res.status(200).json({
      status: isOnline ? 'online' : 'offline',
      code: statusCode,
      finalUrl: response.url
    });

  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      status: 'offline',
      code: 0,
      error: error.message
    });
  }
};
