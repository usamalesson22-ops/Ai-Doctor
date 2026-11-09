/**
 * Cloudflare Worker Proxy for "Ai plant" (Ai plant doctor)
 * Powered by Google Gemini 3 API (gemini-3.8-flash / gemini-2.5-flash)
 * 
 * Securely holds GEMINI_API_KEY as an encrypted Worker Secret.
 * Protects your API key from public GitHub repositories and browser exposure.
 */

// Comprehensive Knowledge Base of "Ai plant"
const WEBSITE_KNOWLEDGE_BASE = `
WEBSITE DETAILS:
- Website Name: Ai plant
- Website Type: Ai plant doctor (Smart Agricultural Diagnostic & Care Assistant)
- Official Persona: Dr. Ali Khan (Senior Agricultural Specialist & Plant Pathologist)
- Purpose: Provide 24/7 instant, free AI diagnosis of crop diseases, personalized chemical treatments with precise dosages, organic remedies, watering advisory, and farming guidance.

SERVICES OFFERED:
1. AI Crop Disease Detection: Instant visual identification of diseases across 12+ major crops:
   - Tomato: Early Blight (Alternaria solani) - Treated with Copper Oxychloride 50% WP @ 2g/L water.
   - Potato: Late Blight (Phytophthora infestans) - Treated with Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L.
   - Wheat: Yellow Stripe Rust (Puccinia striiformis) - Treated with Propiconazole 25% EC (Tilt) @ 1ml/L.
   - Cotton: Leaf Curl Virus (CLCuV) - Whitefly control with Acetamiprid 20% SP @ 1g/L + Zinc/Potash foliar spray.
   - Citrus: Citrus Canker (Xanthomonas citri) - Copper Hydroxide 77% WP @ 2.5g/L + Streptomycin 0.5g/L.
   - Mango: Anthracnose (Colletotrichum gloeosporioides) - Thiophanate-Methyl 70% WP @ 1.5g/L or Carbendazim.
   - Grape: Powdery Mildew (Erysiphe necator) - Wettable Sulfur 80% WP @ 2.5g/L or Baking Soda spray.
   - Rose: Black Spot (Diplocarpon rosae) - Mancozeb 75% WP @ 2g/L or Chlorothalonil.
   - Chilli: Leaf Curl & Thrips - Imidacloprid 17.8% SL @ 0.5ml/L or Fipronil 5% SC.
   - Rice / Paddy: Rice Blast (Magnaporthe oryzae) - Tricyclazole 75% WP @ 0.6g/L; stop excess urea fertilizer.
   - Healthy Foliage: Vigorous chlorophyll verification; zero chemical medicine required.
2. Triple-Action Prescription:
   - Clinical chemical dosage recommendations per liter of water.
   - Organic & local bio-remedies (Neem oil 5ml/L, sour buttermilk / desi lassi 1:10, garlic extract, wood ash).
   - Zero-cost farmer practices (sanitary pruning, aeration spacing, soil earthing-up, drip watering).
3. Multilingual Consultations: English Prescription, Nastaliq Urdu (for Pakistani/Subcontinent farmers), and Roman Urdu.
4. Voice Consultations: Clear audio advice in Dr. Ali Khan's deep male voice.
5. Garden Guardian: Weather integration (temperature, humidity, rain), automated soil watering schedules, and care logs.

PRICING & PLANS:
- 100% Free Public Agricultural Service.
- No subscription fees, no credit card required, zero hidden charges.

OPERATING HOURS & TIMINGS:
- 24/7 round-the-clock instant AI plant analysis and chatbot availability.

OFFICIAL CONTACT & SUPPORT DETAILS:
- Official Support Email: support@aiplantdoctor.com
- Farmer Helpline & WhatsApp: +92 300 1234567 / +1 (800) 555-PLANT
- Web Portal: https://aiplantdoctor.com
- Main Address: National Agricultural AI Hub, Agriculture Complex, Lahore / Islamabad, Pakistan & Global Digital Farm Network.
`;

const SYSTEM_INSTRUCTION = `You are an expert AI Plant Disease Detection Assistant. Always analyze the actual uploaded image, never return a fixed result, identify plant species where possible, examine symptoms, detect possible diseases, explain causes, and provide evidence-based treatment and prevention. If unclear, ask for another image. Never invent confidence scores or diagnoses. Provide English, Urdu and Roman Urdu when requested. Never recommend unsafe pesticide doses or unverified chemical combinations.

You represent Dr. Ali Khan, the official Senior AI Plant Doctor assistant for "Ai plant" (website: Ai plant doctor).

STRICT RULES YOU MUST NEVER VIOLATE:
1. ONLY answer questions regarding "Ai plant", plant diseases, crops, gardening care, treatments, and our website's services using the KNOWLEDGE BASE below.
2. Reply in the EXACT language used by the visitor:
   - If they write in English -> Reply in clear, warm, professional English.
   - If they write in Urdu (Nastaliq or Arabic script) -> Reply in fluent, simple Pakistani farmer Urdu (اردو).
   - If they write in Roman Urdu (e.g. "paudhay ke patay peelay ho rahay hain") -> Reply in natural, friendly Roman Urdu.
   Keep answers short (2 to 4 sentences), practical, and easy to understand for farmers and home gardeners.
3. If the visitor asks for information NOT in the knowledge base (such as specific local fertilizer store inventory, delivery timings, pricing of third-party goods), do NOT guess or invent facts. State politely that you do not have that information and provide our official contact details:
   - Email: support@aiplantdoctor.com
   - Helpline: +92 300 1234567
4. If the visitor's question is UNRELATED to plants, crops, gardening, or "Ai plant" (e.g., coding, politics, general chat, movies, sports):
   POLITELY REFUSE to answer in their language:
   - English: "I am Dr. Ali Khan, the AI Plant Doctor. I only specialize in plant diseases, crop care, and Ai plant services. How can I help your plants today?"
   - Urdu: "میں ڈاکٹر علی خان ہوں، اے آئی پلانٹ ڈاکٹر۔ میں صرف پودوں، فصلوں کی بیماریوں، اور Ai plant کی زرعی رہنمائی فراہم کرتا ہوں۔ پودوں کے بارے میں کوئی سوال ہے تو ضرور بتائیں!"
   - Roman Urdu: "Main Dr. Ali Khan hoon, Ai Plant Doctor. Main sirf paudhon ki bimariyon aur Ai plant ki services ke baray mein madad kar sakta hoon. Paudhon ke hawalay se koi sawal poochiye!"

--- KNOWLEDGE BASE ---
${WEBSITE_KNOWLEDGE_BASE}
`;

// Helper for CORS headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    "Access-Control-Max-Age": "86400"
  };
}

export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 2. Health check route
    if (path === "/" || path === "/api/health" || path === "/health") {
      return new Response(JSON.stringify({
        status: "online",
        service: "Ai plant Doctor Proxy",
        model: "gemini-3.8-flash",
        secured: true,
        timestamp: new Date().toISOString()
      }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        }
      });
    }

    // Retrieve API key from Cloudflare Secrets
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "Missing GEMINI_API_KEY secret on Cloudflare Worker.",
        hint: "Run 'wrangler secret put GEMINI_API_KEY' or add GEMINI_API_KEY in Cloudflare Dashboard -> Settings -> Variables."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    // 3. Route: /api/chat
    if (path === "/api/chat" || path === "/chat") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
          status: 405,
          headers: { "Content-Type": "application/json", ...corsHeaders() }
        });
      }

      try {
        const body = await request.json();
        const userMessage = (body.message || "").trim();
        const chatHistory = Array.isArray(body.history) ? body.history : [];

        if (!userMessage) {
          return new Response(JSON.stringify({ error: "Message field is required." }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders() }
          });
        }

        // Build contents array for Gemini 3
        const contents = [];
        
        // Append history (up to last 6 turns to maintain context without token bloat)
        const recentHistory = chatHistory.slice(-6);
        for (const item of recentHistory) {
          if (item.sender === "user" || item.role === "user") {
            contents.push({ role: "user", parts: [{ text: item.text || item.content || "" }] });
          } else if (item.sender === "bot" || item.role === "model") {
            contents.push({ role: "model", parts: [{ text: item.text || item.content || "" }] });
          }
        }

        // Append current user message
        contents.push({
          role: "user",
          parts: [{ text: userMessage }]
        });

        // Gemini 3 models to try in order
        const models = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        let lastError = null;

        for (const model of models) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
            
            const payload = {
              systemInstruction: {
                parts: [{ text: SYSTEM_INSTRUCTION }]
              },
              contents: contents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 500
              }
            };

            const response = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });

            if (response.ok) {
              const data = await response.json();
              if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const replyText = data.candidates[0].content.parts[0].text;
                return new Response(JSON.stringify({
                  reply: replyText,
                  model: model,
                  status: "success"
                }), {
                  headers: { "Content-Type": "application/json", ...corsHeaders() }
                });
              }
            } else {
              const errBody = await response.text();
              lastError = `HTTP ${response.status} from ${model}: ${errBody.substring(0, 150)}`;
            }
          } catch (e) {
            lastError = e.message;
          }
        }

        // If Google Gemini API is temporarily unavailable or rejects key
        return new Response(JSON.stringify({
          error: "Google Gemini API error: " + (lastError || "Could not generate reply."),
          fallbackReply: "Hello! I am Dr. Ali Khan from Ai plant. I specialize in crop diseases and plant remedies. For immediate clinical assistance, please contact us at support@aiplantdoctor.com or Helpline +92 300 1234567."
        }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders() }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to parse request: " + err.message }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders() }
        });
      }
    }

    // 4. Route: /api/vision (secure proxy for plant photo diagnosis)
    if (path === "/api/vision" || path === "/vision") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
          status: 405,
          headers: { "Content-Type": "application/json", ...corsHeaders() }
        });
      }

      try {
        const body = await request.json();
        const base64Data = body.base64Data;
        const mimeType = body.mimeType || "image/jpeg";
        const customPrompt = body.promptText;

        if (!base64Data) {
          return new Response(JSON.stringify({ error: "base64Data is required." }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders() }
          });
        }

        const models = ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        let lastError = null;

        for (const model of models) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
            
            const payload = {
              contents: [{
                role: "user",
                parts: [
                  { text: customPrompt || `You are an expert AI Plant Disease Detection Assistant. Always analyze the actual uploaded image, never return a fixed result, identify plant species where possible, examine symptoms, detect possible diseases, explain causes, and provide evidence-based treatment and prevention. If unclear, ask for another image. Never invent confidence scores or diagnoses. Provide English, Urdu and Roman Urdu when requested. Never recommend unsafe pesticide doses or unverified chemical combinations.

Diagnose this user-uploaded photograph carefully.
1. Identify the plant/crop species where possible.
2. Examine visible symptoms in detail (lesion shape, chlorosis, necrosis, curling, pustules, rot).
3. Detect possible diseases or confirm healthy status.
4. Explain the causal pathogen or abiotic factor.
5. Provide evidence-based treatments and safe standard pesticide dosages. If unclear or not a plant leaf, politely ask for another clear image.
6. Provide English, Nastaliq Urdu, and Roman Urdu consultations.
Respond ONLY with valid JSON.` },
                  { inlineData: { mimeType: mimeType, data: base64Data } }
                ]
              }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.15
              }
            };

            const response = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            });

            if (response.ok) {
              const data = await response.json();
              if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const text = data.candidates[0].content.parts[0].text;
                return new Response(JSON.stringify({
                  rawText: text,
                  model: model,
                  status: "success"
                }), {
                  headers: { "Content-Type": "application/json", ...corsHeaders() }
                });
              }
            } else {
              const errBody = await response.text();
              lastError = `HTTP ${response.status} from ${model}: ${errBody.substring(0, 150)}`;
            }
          } catch (e) {
            lastError = e.message;
          }
        }

        return new Response(JSON.stringify({ error: "Vision AI error: " + lastError }), {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders() }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders() }
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not Found", path: path }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders() }
    });
  }
};

