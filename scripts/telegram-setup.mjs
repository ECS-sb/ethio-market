// የቴሌግራም ቦቱን webhook ያዘጋጃል።
//   npm run telegram:setup                         → ያለበትን ሁኔታ ብቻ ያሳያል
//   npm run telegram:setup -- https://your-domain  → webhook-ን ወደ https://your-domain/api/telegram/webhook ያዘጋጃል
// TELEGRAM_BOT_TOKEN እና TELEGRAM_WEBHOOK_SECRET ከ.env.local ይነበባሉ፤ token በፍጹም አይታተምም።
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

// lib/telegram/types.ts ውስጥ ካለው ALLOWED_UPDATES ጋር አንድ መሆን አለበት።
const ALLOWED_UPDATES = ["message", "business_connection", "business_message", "edited_business_message", "deleted_business_messages"];

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const site = (process.argv[2] ?? "").replace(/\/$/, "");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

async function call(method, body = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!data?.ok) fail(`${method}: ${data?.description ?? response.status}`);
  return data.result;
}

if (!token) fail("TELEGRAM_BOT_TOKEN is missing in .env.local");

const me = await call("getMe");
console.log(`✓ Bot: @${me.username}`);
if (me.can_connect_to_business) console.log("✓ Secretary (Business) Mode is on");
else console.log("✗ Secretary (Business) Mode is off. In @BotFather: /mybots → your bot → Bot Settings → Secretary Mode → Turn on");

if (site) {
  if (!site.startsWith("https://")) fail("The site address must start with https://");
  if (!secret || !/^[A-Za-z0-9_-]{16,256}$/.test(secret)) {
    fail("TELEGRAM_WEBHOOK_SECRET must be 16–256 characters of A-Z, a-z, 0-9, _ or -");
  }
  await call("setWebhook", { url: `${site}/api/telegram/webhook`, secret_token: secret, allowed_updates: ALLOWED_UPDATES });
  console.log(`✓ Webhook set to ${site}/api/telegram/webhook`);
}

const info = await call("getWebhookInfo");
console.log(`  Webhook URL: ${info.url || "(none)"}`);
console.log(`  Waiting updates: ${info.pending_update_count}`);
if (info.last_error_message) {
  console.log(`  Last error: ${info.last_error_message} (${new Date(info.last_error_date * 1000).toISOString()})`);
}
