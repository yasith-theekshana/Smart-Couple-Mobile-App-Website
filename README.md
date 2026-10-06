<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/01889b02-11c6-4f57-a5b8-80325cb1eae0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Host the mobile test on a separate domain

The mobile test has its own entry point and build. It opens directly at `/`,
without the main website's navbar or footer. The existing `/mobile-test` page
in the main website remains available.

- Local development: `npm run dev:mobile` (port 3001).
- Production build: `npm run build:mobile`.
- Preview the production build: `npm run preview:mobile` (port 4174).

Create a separate static hosting project using this repository. Set its build
command to `npm run build:mobile` and its publish/output directory to
`dist-mobile`. Alternatively, upload the contents of `dist-mobile` to the
document root of your domain on a static web server.

Add your desired domain (for example, `mobile.example.com`) to that hosting
project, then set the DNS records supplied by your hosting provider and enable
HTTPS. The main website uses `npm run build` and `dist` independently.

This is the existing test/demo interface: its data is held in component state
and resets on reload. Hosting it separately does not add accounts or a backend.
