# Qadasy.Aymen AI

A responsive, English-first AI chat website with a private server-side Gemini API connection.

## Included
- Polished responsive chat interface
- Conversation history in the current browser session
- Copy response, new conversation, prompt suggestions
- Gemini API integration through a server-side endpoint
- API key kept out of public browser code
- Basic input validation, request timeout and friendly error handling

## Important
The website files are ready, but the live AI service requires your own Gemini API key and deployment. Free usage is subject to Google's current model availability, quotas and terms. The free tier can change and may be limited. Do not publish an API key in `public/index.html`.

## Setup

1. Create a Gemini API key in Google AI Studio: https://aistudio.google.com/app/apikey
2. Create a Vercel account and import this project.
3. In the Vercel project settings, open **Environment Variables** and add:
   - Name: `GEMINI_API_KEY`
   - Value: your private API key
4. Redeploy the project.
5. Open the deployment URL and send a test message.

The key is stored as a server environment variable. Do not send it in chat or commit it to a public repository.

## Run locally

Requires Node.js 20+ and the Vercel CLI.

```bash
npm install -g vercel
vercel dev
```

Create a local `.env` file from `.env.example`, add your key, then run `vercel dev`.

## Customization
- Brand name and page text: `public/index.html`
- AI behavior and model endpoint: `api/chat.js`
- Deployment configuration: `vercel.json`

## Current limitations
- No user accounts or cross-device synced chat history.
- Conversations are kept in browser memory for the current page session; they are not uploaded to a database.
- No live web search, file uploads, image generation or voice mode.
- The assistant can make mistakes. Verify important information.
