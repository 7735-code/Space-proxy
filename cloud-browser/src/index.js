const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#090d18">
<title>Space Cloud Browser</title>
<style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;background:#090d18;color:#edf2ff}
*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 50% -15%,#243b69 0,transparent 52%),#090d18;display:grid;place-items:center;padding:24px}
main{width:min(100%,560px);border:1px solid #293652;background:#111a2bdb;border-radius:24px;padding:32px;box-shadow:0 24px 90px #0008}
.logo{width:54px;height:54px;border-radius:17px;display:grid;place-items:center;background:linear-gradient(135deg,#7c9cff,#7c52e8);font-size:26px;box-shadow:0 8px 30px #6655dd55}
h1{font-size:clamp(27px,6vw,38px);margin:20px 0 8px;letter-spacing:-1.2px}p{color:#aab7d0;line-height:1.6;margin:0}
.pill{display:inline-flex;gap:8px;align-items:center;color:#9ce8c2;background:#123426;border:1px solid #225b43;padding:6px 10px;border-radius:999px;font-size:12px;margin-top:20px}
.dot{width:7px;height:7px;border-radius:50%;background:#57d99a}
label{display:block;font-size:13px;color:#c6d1e7;margin:24px 0 8px}
input{width:100%;border:1px solid #354563;background:#0a1221;color:#fff;border-radius:12px;padding:14px 15px;font:inherit;outline:none}
input:focus{border-color:#8aa4ff;box-shadow:0 0 0 3px #7c9cff22}
button{width:100%;border:0;border-radius:12px;margin-top:14px;padding:15px;background:linear-gradient(100deg,#7898ff,#8a65ee);color:white;font:700 15px inherit;cursor:pointer}
button:disabled{opacity:.55;cursor:wait}
#status{min-height:24px;margin-top:15px;font-size:13px;color:#b9c6df}
.note{margin-top:22px;padding:14px;border-radius:12px;background:#0b1424;border:1px solid #263550;font-size:12px;color:#aab7d0;line-height:1.6}
footer{margin-top:20px;color:#72819d;font-size:11px;text-align:center}
</style>
</head>
<body>
<main>
  <div class="logo" aria-hidden="true">✦</div>
  <div class="pill"><span class="dot"></span> CLOUD BROWSER READY</div>
  <h1>Space Cloud Browser</h1>
  <p>Launch a real remote Chromium browser hosted by Cloudflare. Your Chromebook only needs a normal web browser — no Linux or installation.</p>
  <label for="access">Private launch code</label>
  <input id="access" type="password" autocomplete="current-password" placeholder="Enter your launch code">
  <button id="launch">Launch cloud browser ↗</button>
  <div id="status" role="status" aria-live="polite"></div>
  <div class="note"><strong>How it works</strong><br>Press Launch to start a temporary Cloudflare browser session. It opens in a new tab, where you can enter a website address and browse normally. Keep your launch code private. Use the browser responsibly and follow the rules of your school and network.</div>
  <footer>SPACE · POWERED BY CLOUDFLARE BROWSER RUN</footer>
</main>
<script>
const button=document.getElementById('launch');
const code=document.getElementById('access');
const status=document.getElementById('status');
button.addEventListener('click',async()=>{
  const access=code.value.trim();
  if(!access){status.textContent='Enter your private launch code first.';code.focus();return;}
  const tab=window.open('about:blank','_blank');
  if(!tab){status.textContent='Allow pop-ups for this site, then try again.';return;}
  tab.document.write('<title>Starting Space Cloud Browser…</title><p style="font:16px system-ui;padding:24px">Starting your secure cloud browser…</p>');
  button.disabled=true;button.textContent='Starting browser…';status.textContent='Connecting to Cloudflare…';
  try{
    const response=await fetch('/api/session',{method:'POST',headers:{'content-type':'application/json','x-space-access-code':access},body:'{}'});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Could not start the browser.');
    tab.location.replace(data.url);
    status.textContent='Your cloud browser opened in a new tab.';
    code.value='';
  }catch(error){
    tab.close();
    status.textContent=error.message||'Something went wrong. Please try again.';
  }finally{button.disabled=false;button.textContent='Launch cloud browser ↗';}
});
code.addEventListener('keydown',e=>{if(e.key==='Enter')button.click()});
</script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/") {
      return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "no-referrer" } });
    }
    if (request.method === "POST" && url.pathname === "/api/session") {
      if (!env.CF_ACCOUNT_ID || !env.CF_API_TOKEN || !env.ACCESS_CODE) {
        return Response.json({ error: "The owner must finish Cloudflare setup before launching." }, { status: 503 });
      }
      const supplied = request.headers.get("x-space-access-code") || "";
      if (supplied.length > 200 || supplied !== env.ACCESS_CODE) {
        return Response.json({ error: "That launch code is not correct." }, { status: 401 });
      }
      try {
        const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.CF_ACCOUNT_ID)}/browser-rendering/devtools/browser?keep_alive=600000&targets=true`;
        const upstream = await fetch(endpoint, {
          method: "POST",
          headers: { "authorization": `Bearer ${env.CF_API_TOKEN}`, "accept": "application/json" }
        });
        const payload = await upstream.json();
        if (!upstream.ok || payload.success === false) {
          return Response.json({ error: "Cloudflare could not start a browser session. Check the Browser Run permission and account setup." }, { status: 502 });
        }
        const target = payload.targets?.find(item => typeof item.devtoolsFrontendUrl === "string");
        if (!target) {
          return Response.json({ error: "Cloudflare did not return a browser tab. Please try again." }, { status: 502 });
        }
        const sessionUrl = new URL(target.devtoolsFrontendUrl);
        if (sessionUrl.protocol !== "https:" || sessionUrl.hostname !== "live.browser.run") {
          return Response.json({ error: "Cloudflare returned an unexpected browser address." }, { status: 502 });
        }
        return Response.json({ url: sessionUrl.toString() }, { headers: { "cache-control": "no-store" } });
      } catch {
        return Response.json({ error: "Could not contact Cloudflare. Please try again later." }, { status: 502 });
      }
    }
    return new Response("Not found", { status: 404, headers: { "x-content-type-options": "nosniff" } });
  }
};