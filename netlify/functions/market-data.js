// Server-side proxy for Alpha Vantage and Finnhub.
// API keys live only here, as environment variables set in the Netlify dashboard —
// they are never sent to or visible in the browser.

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  const params = event.queryStringParameters || {};
  const { provider, path, ...rest } = params;

  try {
    let url;

    if (provider === 'av') {
      const key = process.env.ALPHA_VANTAGE_KEY;
      if (!key) throw new Error('ALPHA_VANTAGE_KEY is not set on the server');
      const qs = new URLSearchParams({ ...rest, apikey: key }).toString();
      url = `https://www.alphavantage.co/query?${qs}`;
    } else if (provider === 'finnhub') {
      const key = process.env.FINNHUB_KEY;
      if (!key) throw new Error('FINNHUB_KEY is not set on the server');
      if (!path) throw new Error('Missing "path" for finnhub request');
      const qs = new URLSearchParams({ ...rest, token: key }).toString();
      url = `https://finnhub.io/api/v1/${path}?${qs}`;
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown or missing provider' }) };
    }

    const res = await fetch(url);
    const data = await res.json();

    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
