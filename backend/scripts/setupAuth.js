/**
 * YouTube OAuth2 setup wizard.
 *
 * Run once per YouTube channel owner account:
 *   node scripts/setupAuth.js
 *
 * Opens the OAuth URL in the console. Paste the redirect URL to complete
 * auth and save credentials/tokens.json.
 *
 * Multiple channel owners: run once per owner, using a different account key.
 *   node scripts/setupAuth.js --account owner2
 */

import 'dotenv/config';
import { createServer } from 'http';
import { URL } from 'url';
import { getAuthUrl, exchangeCode } from '../lib/youtubeApi.js';
import { logger } from '../lib/logger.js';

const PORT = 5000;
const accountKey = process.argv.includes('--account')
  ? process.argv[process.argv.indexOf('--account') + 1]
  : 'default';

async function main() {
  if (!process.env.YOUTUBE_CLIENT_ID || !process.env.YOUTUBE_CLIENT_SECRET) {
    console.error('\n❌ YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET must be set in .env\n');
    console.error('   Get credentials at: https://console.cloud.google.com/apis/credentials');
    process.exit(1);
  }

  const authUrl = getAuthUrl(accountKey);

  console.log('\n=== Empirika YouTube OAuth Setup ===\n');
  console.log(`Account key: ${accountKey}`);
  console.log('\n1. Open this URL in your browser (channel owner must be logged in):\n');
  console.log(`   ${authUrl}\n`);
  console.log('2. Grant access, then you will be redirected to localhost.\n');
  console.log('   Waiting for redirect...\n');

  // Start a temporary HTTP server to catch the OAuth callback
  await new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      if (!req.url?.startsWith('/auth/callback')) {
        res.end('Waiting...');
        return;
      }

      const url = new URL(`http://localhost${req.url}`);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state') || accountKey;
      const error = url.searchParams.get('error');

      if (error) {
        res.end(`<h1>Error: ${error}</h1>`);
        server.close();
        reject(new Error(`OAuth denied: ${error}`));
        return;
      }

      try {
        await exchangeCode(code, state);
        res.end('<h1>✅ Authorisation successful!</h1><p>You can close this tab.</p>');
        server.close();

        console.log(`\n✅ Tokens saved for account: "${state}"`);
        console.log('   File: credentials/tokens.json\n');
        console.log('Next step: node scripts/fetchAnalytics.js\n');

        resolve();
      } catch (err) {
        res.end(`<h1>Error</h1><pre>${err.message}</pre>`);
        server.close();
        reject(err);
      }
    });

    server.listen(PORT, () => {
      logger.info(`OAuth callback server listening`, { port: PORT });
    });

    server.on('error', reject);
  });
}

main().catch(err => {
  logger.error('Auth setup failed', err);
  process.exit(1);
});
