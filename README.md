# ELTEX Webhook Form

A Next.js form application for testing Make.com and n8n phone number automation workflows. This form generates the exact JSON payload structure required by the ELTEX automation exercise and sends it to your configured webhook endpoints.

## Features

- ✅ **Pre-configured Test Cases**: Load the 3 test cases from the automation exercise with one click
- ✅ **Phone Number Detection Preview**: Shows which numbers will be detected as Spanish vs Foreign
- ✅ **Multiple Webhook Support**: Send to Make.com, n8n, or custom webhook endpoints
- ✅ **Form Validation**: Comprehensive validation with helpful error messages
- ✅ **Response Display**: Shows the webhook response for debugging
- ✅ **Mobile Responsive**: Works on all device sizes

## Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd webhook-form
npm install
```

### 2. Configure Webhook URLs
Copy the environment variables file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual webhook URLs:
```env
NEXT_PUBLIC_MAKE_WEBHOOK_URL=https://hook.eu2.make.com/your-actual-webhook-id
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://primary-production-1cd8.up.railway.app/webhook/webhook-phone-automation
```

### 3. Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Cases

The form includes 3 pre-configured test cases that match the automation exercise:

1. **Spanish Number (+34651558844)** - Should trigger HTTP request to Make.com endpoint
2. **Foreign Number (005411556699)** - Should trigger email alert to l.lemos@eltex.es
3. **Spanish Local (tel: 604112266)** - Should trigger HTTP request to Make.com endpoint

Click "Load Test Case" on any test case to populate the form with that data.

## Phone Number Detection Logic

The automation workflows use this regex pattern to detect Spanish numbers:
```regex
^(\+34|tel:\s*[67]|[67])
```

**Spanish Numbers (HTTP Request):**
- `+34` prefix (international format)
- `tel: 6` or `tel: 7` (local format with tel: prefix)
- Numbers starting with `6` or `7` (local Spanish mobile)

**Foreign Numbers (Email Alert):**
- Any number that doesn't match the Spanish pattern
- Sends email to `l.lemos@eltex.es`

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Deploy via GitHub
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_MAKE_WEBHOOK_URL`
   - `NEXT_PUBLIC_N8N_WEBHOOK_URL`

## Setting Up Automation Workflows

### Make.com Setup
1. Import the `make-com-phone-automation-blueprint.json` file
2. Configure the webhook URL in your scenario
3. Copy the webhook URL to your environment variables
4. Activate the scenario

### n8n Setup
1. Import the `n8n-phone-number-automation.json` file
2. Configure SMTP credentials for email sending
3. Activate the workflow
4. Copy the webhook URL to your environment variables

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zod** - Form validation
- **Lucide React** - Icons
