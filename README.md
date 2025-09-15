# 🔗 Linkbac.app

Linkbac.app is a Chrome extension that helps students manage their time by turning ManageBac (online learning platform often used by IB schools) tasks into actionable items inside their productivity tools. From any ManageBac task page you can push assignments to Notion or Google Sheets, keep them updated with one click, and bulk-sync upcoming work.

## Screenshots

<img height="200" src="https://github.com/user-attachments/assets/7bcb7fe5-efeb-4a9b-b331-f46ab6b146bc" />
<img height="200" src="https://github.com/user-attachments/assets/97895040-2f6c-4afc-9dcc-c602cb249fa7" />
<img height="200" src="https://github.com/user-attachments/assets/af1ccc43-2f4c-4f0d-879e-e8353e98d4a9" />

## Status

- [x] Notion OAuth login
- [x] One-click bulk task syncing
- [x] Onboarding page
- [x] Automatic task emoji hints
- [x] Rich Notion database support (either using template or map ManageBac fields to arbitrary Notion columns)
- [x] Google OAuth login
- [x] Google Sheets integration
- [x] Sync settings with Google Chrome profile
- [ ] AI task summaries (early implementation in notionService.js [here](https://github.com/JoelHorrocks/Linkbac/commit/54edc4a6994d23b738b7f60cb0da2988acfec580) and [here](https://github.com/JoelHorrocks/Linkbac/commit/c1ee2b55104e7ff860f392323d5775723ffa70ba) - removed later in the repo history as I built this in the days of GPT-3 and results were mixed)
- [ ] Google Calendar integration

> [!NOTE]  
> I built this when I last had access to ManageBac in 2023. Any subsequent changes they have made to the website may have rendered this extension no longer functional.

## External services

For Notion access, after signing in through the Linkbac OAuth helper (`https://linkbac.app/oauth/oauth.php`) the extension receives an access token, bot ID, and optional duplicated template ID (`src/contentScript.js`). If you intend to self-host the OAuth helper used for Notion, deploy a service that proxies the Notion OAuth flow (authorize URL, token exchange, and optional template duplication) and update the URLs in 'src/onboarding.js', 'src/options.js', 'src/contentScript.js', and 'public/manifest.json' to point to your domain.

Update  'public/manifest.json' before distributing the extension:
- Replace the placeholder '"key": "KEY"' with your extension key.
- Set 'oauth2.client_id' to the client ID generated for your Chrome extension in Google Cloud.

## Disclaimer

> [!NOTE]  
> Linkbac is an independent time-management tool for students and has no affiliation with or endorsement by ManageBac or Faria Education Group.
