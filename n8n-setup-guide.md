# n8n Phone Number Automation - Complete Setup Guide

## Overview
This n8n workflow replicates the Make.com automation exercise. It processes incoming webhook data, checks if phone numbers are Spanish, and takes appropriate actions.

## Quick Setup Steps

### 1. Import the Workflow
1. Open your n8n instance
2. Click "Import from File" or "Import from URL"
3. Upload the `n8n-phone-number-automation.json` file
4. The workflow will be imported with all nodes configured

### 2. Configure Email Credentials (Required)
Before activating the workflow, you need to set up SMTP credentials:

1. Go to **Settings** → **Credentials**
2. Click **Add Credential**
3. Select **SMTP**
4. Configure with your email provider:
   ```
   Host: smtp.gmail.com (for Gmail)
   Port: 587
   Security: STARTTLS
   Username: your-email@gmail.com
   Password: your-app-password
   ```
5. Save the credential
6. Go back to the workflow and update the "Send Foreign Alert Email" node to use your credential

### 3. Activate the Workflow
1. Click the **Active** toggle in the top-right corner
2. The webhook will become available

### 4. Get Your Webhook URL
1. Click on the **Webhook** node
2. Copy the **Test URL** or **Production URL**
3. Use this URL for testing with Postman

**Current Production URL**: `https://primary-production-1cd8.up.railway.app/webhook/webhook-phone-automation`

## Workflow Logic

### Node Breakdown:

1. **Webhook Node**: Receives POST requests with JSON data
2. **Check Spanish Phone**: Uses regex to identify Spanish numbers
3. **Send Spanish Data**: HTTP request to Make.com endpoint (for Spanish numbers)
4. **Send Foreign Alert Email**: Sends email notification (for foreign numbers)
5. **Response Nodes**: Return success responses

### Phone Number Detection Logic:
The workflow identifies Spanish numbers using this regex pattern:
```regex
^(\+34|tel:\s*[67]|[67])
```

This matches:
- `+34` prefix (international Spanish format)
- `tel: 6` or `tel: 7` (local format with tel: prefix)
- Numbers starting with `6` or `7` (local Spanish mobile format)

## Test Cases

### Case 1: Spanish Number (+34651558844)
- **Expected**: HTTP request to Make.com endpoint
- **Response**: `{"status": "success", "message": "Spanish number processed"}`

### Case 2: Foreign Number (005411556699)
- **Expected**: Email sent to l.lemos@eltex.es
- **Response**: `{"status": "success", "message": "Foreign number alert sent"}`

### Case 3: Spanish Local Number (tel: 604112266)
- **Expected**: HTTP request to Make.com endpoint (starts with 6)
- **Response**: `{"status": "success", "message": "Spanish number processed"}`

## Testing with Postman

1. Create a new POST request
2. Use your webhook URL
3. Set Content-Type to `application/json`
4. Paste one of the test case JSON payloads
5. Send the request
6. Check the response and verify the action taken

## Customization Options

### Modify Phone Detection:
Edit the regex in the "Check Spanish Phone" node:
```javascript
^(\+34|tel:\s*[67]|[67])
```

### Change Email Template:
Update the text in "Send Foreign Alert Email" node:
```javascript
A new foreign number has entered the system today: Contact {{ $json.payload.first_name }} {{ $json.payload.last_name }} with phone number {{ $json.payload.phone }}.

Date: {{ $now.format('YYYY-MM-DD') }}
```

### Modify HTTP Payload:
Edit the JSON body in "Send Spanish Data" node to include different fields.

## Troubleshooting

### Common Issues:
1. **Email not sending**: Check SMTP credentials and firewall settings
2. **Webhook not triggering**: Ensure workflow is active and URL is correct
3. **Phone detection not working**: Verify regex pattern matches your number format

### Debug Tips:
1. Use the **Execute Workflow** button to test manually
2. Check the **Executions** tab for error details
3. Add **Set** nodes to log intermediate values during testing

## Production Considerations

1. **Security**: Consider adding authentication to your webhook
2. **Error Handling**: Add error handling nodes for failed HTTP requests or emails
3. **Logging**: Add logging nodes to track all processed requests
4. **Rate Limiting**: Consider implementing rate limiting for high-volume scenarios

## Next Steps

1. Import the workflow file
2. Configure your SMTP credentials
3. Activate the workflow
4. Test with the provided JSON cases
5. Monitor the executions tab for results

The workflow is now ready to handle the same logic as the Make.com scenario but running on n8n!
