# ELTEX Webhook Form

A professional webhook form application built with Next.js for collecting contact information and routing data based on phone number validation.

## Features

- **Modern UI/UX**: Clean, responsive design with ELTEX branding
- **Phone Number Validation**: Automatically detects Spanish vs foreign phone numbers
- **Smart Routing**: Routes Spanish numbers to automation workflows
- **Test Case Integration**: Pre-configured test scenarios for validation
- **Form Validation**: Comprehensive client-side validation with Zod
- **Webhook Integration**: Seamless integration with automation platforms

## Technology Stack

- **Framework**: Next.js 15.3.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel

## Project Structure

```
webhook-form/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       └── WebhookForm.tsx
├── public/
│   ├── eltex-logo.svg
│   ├── eltex-logo-small.svg
│   └── favicon.ico
├── package.json
└── vercel.json
```

## Phone Number Validation Logic

The application validates phone numbers to determine if they are Spanish:

- **Spanish Numbers**: `+34`, `0034`, `34`, `6xx`, `7xx`
- **Foreign Numbers**: All other international formats

## Environment Variables

- `NEXT_PUBLIC_N8N_WEBHOOK_URL`: n8n webhook endpoint for automation

## Development

```bash
cd webhook-form
npm install
npm run dev
```

## Deployment

This application is configured for deployment on Vercel with automatic builds from the GitHub repository.

## License

© 2024 ELTEX. All rights reserved.
