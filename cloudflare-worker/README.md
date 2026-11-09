# 🛡️ Cloudflare Worker Proxy for "Ai plant"

This worker protects your Google Gemini API key by acting as a secure intermediary between your public GitHub Pages website and Google's Gemini 3 AI API.

---

### Method A: 2-Minute Setup via Cloudflare Web Dashboard (No terminal needed)

1. **Sign in to Cloudflare**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com/) and sign up for a **100% Free** account.

2. **Create a Worker**:
   - In the left sidebar, click **Workers & Pages** -> **Create application** -> **Create Worker**.
   - Name it `ai-plant-doctor-proxy` and click **Deploy**.

3. **Paste the Worker Code**:
   - Click **Edit Code** (Quick Edit).
   - Delete everything in `worker.js`, copy all the code from `cloudflare-worker/worker.js`, and paste it in.
   - Click **Save and deploy**.

4. **Add your Gemini API Key as an Encrypted Secret**:
   - Go back to the Worker's main page in Cloudflare Dashboard.
   - Click the **Settings** tab -> **Variables and Secrets**.
   - Under **Secrets**, click **Add** (or **Add Secret**):
     - Variable name: `GEMINI_API_KEY`
     - Value: *(Paste your key from `private/gemini-api-key.txt`)*
   - Click **Deploy** / **Save**.

5. **Copy your Worker URL**:
   - On the worker summary page, copy your public worker URL:
     e.g., `https://ai-plant-doctor-proxy.<your-subdomain>.workers.dev`
   - Paste this URL into your website's **Settings Modal** (or update the default proxy URL in the website).

---

### Method B: Deploy via Command Line (Wrangler CLI)

From your `victor ai` folder:
```bash
cd cloudflare-worker
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
# (When prompted, paste your key)
npx wrangler deploy
```

Done! Your key is encrypted in Cloudflare's global edge network and NEVER exposed to the public!

