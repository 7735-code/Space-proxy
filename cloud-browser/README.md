# Space Browser

A lightweight browser-style web app designed to be hosted on Cloudflare Pages. It is a normal web app, not a proxy and not a standalone browser engine.

## Deploy to Cloudflare Pages (no Linux required)

1. Open the Cloudflare dashboard and choose **Workers & Pages**.
2. Choose **Create application** → **Pages** → **Connect to Git**.
3. Select this GitHub repository.
4. Set **Root directory (advanced)** to `cloud-browser`.
5. Choose **None** for the framework preset.
6. Leave the build command empty.
7. Set the build output directory to `.`.
8. Save and deploy.

The app is a static site: no server, secrets, or build step are required.

## Features and limitations

- Search using Google and navigate to regular HTTP/HTTPS addresses.
- Multiple local tabs, bookmarks, and recent history.
- Bookmarks and history are stored in the browser's local storage on the current device.
- Websites may refuse to load inside the embedded frame using browser security headers. This is a normal browser restriction; this app does not bypass it. Open those websites directly in a regular browser tab instead.
- This web app does not include an independent Chromium/Firefox engine or sync data between devices.
