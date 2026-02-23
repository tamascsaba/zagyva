/**
 * Publishes the extension to the Chrome Web Store using a service account.
 *
 * Setup (one-time):
 *   1. Enable Chrome Web Store API in Google Cloud Console
 *   2. Create a service account + download JSON key file
 *   3. Add the service account email in Chrome Developer Dashboard > Account
 *   4. Create an extension item manually (first time only) to get the extension ID
 *
 * Environment variables:
 *   CWS_KEY_FILE     - Path to service account JSON key file
 *   CWS_EXTENSION_ID - Chrome Web Store extension ID
 *   CWS_PUBLISH      - Set to "true" to publish after upload (default: upload only)
 *   CWS_TARGET       - "default" (public) or "trustedTesters" (default: "default")
 *
 * Usage:
 *   CWS_KEY_FILE=key.json CWS_EXTENSION_ID=abc123 npm run publish
 *   CWS_KEY_FILE=key.json CWS_EXTENSION_ID=abc123 CWS_PUBLISH=true npm run publish
 *
 * Run with: npm run publish
 */

const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const STORE_DIR = path.resolve(__dirname, '..', 'store');
const ZIP_PATH = path.join(STORE_DIR, 'zagyva.zip');

const API_BASE = 'https://www.chromewebstore.com/api/v2';
const SCOPE = 'https://www.googleapis.com/auth/chromewebstore';

async function getAccessToken(keyFilePath) {
  var auth = new GoogleAuth({
    keyFile: keyFilePath,
    scopes: [SCOPE],
  });
  var client = await auth.getClient();
  var tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

async function apiRequest(method, url, token, body, contentType) {
  var headers = {
    'Authorization': 'Bearer ' + token,
    'x-goog-api-version': '2',
  };
  if (contentType) headers['Content-Type'] = contentType;

  var opts = { method: method, headers: headers };
  if (body) opts.body = body;

  var res = await fetch(url, opts);
  var text = await res.text();
  var json;
  try { json = JSON.parse(text); } catch (e) { json = null; }

  if (!res.ok) {
    console.error('API error (' + res.status + '):', text);
    throw new Error('API request failed: ' + res.status);
  }
  return json || text;
}

async function upload(token, extensionId) {
  console.log('Uploading ' + ZIP_PATH + '...');

  if (!fs.existsSync(ZIP_PATH)) {
    throw new Error('Zip not found at ' + ZIP_PATH + '. Run "npm run build" first.');
  }

  var zipBuffer = fs.readFileSync(ZIP_PATH);
  var url = 'https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + extensionId;

  var result = await apiRequest('PUT', url, token, zipBuffer, 'application/zip');
  console.log('Upload result:', JSON.stringify(result, null, 2));

  if (result.uploadState === 'FAILURE') {
    console.error('Upload failed:', result.itemError);
    throw new Error('Upload failed');
  }

  return result;
}

async function publish(token, extensionId, target) {
  console.log('Publishing to "' + target + '"...');

  var url = 'https://www.googleapis.com/chromewebstore/v1.1/items/' + extensionId + '/publish';
  if (target && target !== 'default') {
    url += '?publishTarget=' + target;
  }

  var result = await apiRequest('POST', url, token, null);
  console.log('Publish result:', JSON.stringify(result, null, 2));
  return result;
}

async function getStatus(token, extensionId) {
  var url = 'https://www.googleapis.com/chromewebstore/v1.1/items/' + extensionId + '?projection=DRAFT';
  var result = await apiRequest('GET', url, token, null);
  return result;
}

async function main() {
  var keyFile = process.env.CWS_KEY_FILE;
  var extensionId = process.env.CWS_EXTENSION_ID;
  var doPublish = process.env.CWS_PUBLISH === 'true';
  var target = process.env.CWS_TARGET || 'default';

  if (!keyFile) {
    console.error('Error: CWS_KEY_FILE environment variable is required.');
    console.error('  Set it to the path of your service account JSON key file.');
    console.error('');
    console.error('Usage:');
    console.error('  CWS_KEY_FILE=key.json CWS_EXTENSION_ID=abc123 npm run publish');
    process.exit(1);
  }

  if (!extensionId) {
    console.error('Error: CWS_EXTENSION_ID environment variable is required.');
    console.error('  Find it in the Developer Dashboard URL or item details.');
    process.exit(1);
  }

  if (!fs.existsSync(keyFile)) {
    console.error('Error: Key file not found: ' + keyFile);
    process.exit(1);
  }

  console.log('=== Chrome Web Store Publish ===');
  console.log('Extension ID: ' + extensionId);
  console.log('Key file: ' + keyFile);
  console.log('Publish after upload: ' + doPublish);
  console.log('Target: ' + target);
  console.log('');

  console.log('Authenticating with service account...');
  var token = await getAccessToken(keyFile);
  console.log('Authenticated.\n');

  // Check current status
  try {
    var status = await getStatus(token, extensionId);
    console.log('Current item status: ' + (status.status || 'unknown'));
    console.log('Current version: ' + (status.crxVersion || 'none'));
    console.log('');
  } catch (e) {
    console.log('Could not fetch current status (may be first upload).\n');
  }

  await upload(token, extensionId);
  console.log('');

  if (doPublish) {
    await publish(token, extensionId, target);
    console.log('\nExtension published! It may take a few minutes to propagate.');
    console.log('https://chrome.google.com/webstore/detail/' + extensionId);
  } else {
    console.log('Upload complete. To publish, run again with CWS_PUBLISH=true');
    console.log('Or publish manually from the Developer Dashboard.');
  }
}

main().catch(function (err) {
  console.error('\nPublish failed:', err.message);
  process.exit(1);
});
