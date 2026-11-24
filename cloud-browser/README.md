# Space Cloud Browser

A Chromebook-friendly launch page for temporary remote Chromium sessions powered by Cloudflare Browser Run. The browser itself runs in Cloudflare's cloud; the Chromebook needs only Chrome and an internet connection.

## Deploy without Linux or a terminal

1. In Cloudflare, open **Workers & Pages** and choose **Create application → Import a repository**.
2. Connect GitHub and select `7735-code/Space-proxy`.
3. Select branch `space-cloud-browser` and set the root directory to `cloud-browser`.
4. Deploy the Worker. It uses the `wrangler.toml` and `src/index.js` in this folder.
5. Open the new Worker → **Settings → Variables and Secrets**. Add:
   - `CF_ACCOUNT_ID` — your Cloudflare account ID (text variable).
   - `CF_API_TOKEN` — a Cloudflare API token with **Browser Rendering: Edit** permission (secret).
   - `ACCESS_CODE` — create a private launch code of your own (secret).
6. Save the settings and redeploy the Worker.
7. Open the Worker URL on your Chromebook. Enter your launch code and press **Launch cloud browser**.

Never put the API token in frontend code, GitHub files, or a public message. Keep the launch code private.

## Usage and limits

The launch page creates a temporary Cloudflare Browser Run session with a 10-minute keep-alive request. On the Workers Free plan, Cloudflare currently includes 10 browser minutes per day and up to 3 concurrent browser sessions. Check the current Browser Run usage page before using it; paid usage can incur charges.

This project is a browser-session launcher, not a web proxy. It does not remove website security controls or bypass school, workplace, or network restrictions. Follow the rules that apply to your network.

## Troubleshooting

- **Owner must finish setup:** one or more Worker variables/secrets are missing.
- **Could not start a browser:** confirm the API token has Browser Rendering: Edit permission and that Browser Run is enabled for the account.
- **Popup blocked:** allow pop-ups for your Worker URL and launch again.
- **Incorrect launch code:** check the `ACCESS_CODE` secret in Worker settings.

Cloudflare docs: https://developers.cloudflare.com/browser-run/get-started/
