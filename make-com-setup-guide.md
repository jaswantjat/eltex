# Make.com Phone Number Automation - Complete Setup Guide

## Overview
This Make.com scenario blueprint replicates the exact automation exercise requirements. It processes incoming webhook data, checks if phone numbers are Spanish, and takes appropriate actions.

## Quick Setup Steps

### 1. Import the Blueprint
1. Log into your Make.com account
2. Go to **Scenarios** → **Create a new scenario**
3. Click the **...** (ellipsis) menu at the bottom
4. Select **Import Blueprint**
5. Upload the `make-com-phone-automation-blueprint.json` file
6. The scenario will be imported with all modules configured

### 2. Configure the Webhook (Required)
After import, you need to set up the webhook:

1. Click on the **Webhook** module (first module)
2. Click **Add** to create a new webhook
3. Copy the webhook URL that's generated
4. Save the scenario
5. Use this URL for testing with Postman

### 3. Configure Email Settings (Required)
The email module needs your SMTP configuration:

1. Click on the **Email** module
2. Set up your email connection:
   ```
   SMTP Server: smtp.gmail.com (for Gmail)
   Port: 587
   Username: your-email@gmail.com
   Password: your-app-password
   ```
3. Update the "from" email address to match your SMTP account

### 4. Activate the Scenario
1. Turn **ON** the scenario using the toggle switch
2. The webhook becomes active and ready to receive data

## Scenario Logic

### Module Breakdown:

1. **Webhook Module**: Receives POST requests with JSON data
2. **Router Module**: Splits the flow into two conditional paths
3. **HTTP Request Module**: Sends data to Make.com endpoint (Spanish numbers)
4. **Email Module**: Sends alert email (Foreign numbers)

### Phone Number Detection Logic:
The scenario identifies Spanish numbers using this regex pattern:
```regex
^(\+34|tel:\s*[67]|[67])
```

This matches:
- `+34` prefix (international Spanish format)
- `tel: 6` or `tel: 7` (local format with tel: prefix)
- Numbers starting with `6` or `7` (local Spanish mobile format)

### Router Filters:

**Spanish Phone Filter:**
- Condition: Phone number matches regex `^(\+34|tel:\s*[67]|[67])`
- Action: Send HTTP request to Make.com endpoint

**Foreign Phone Filter:**
- Condition: Phone number does NOT match Spanish regex
- Action: Send email alert to l.lemos@eltex.es

## Test Cases

### Case 1: Spanish Number (+34651558844)
- **Expected**: HTTP request sent to Make.com endpoint
- **Data Sent**:
```json
{
  "full_name": "Test Luciano",
  "phone_number": "+34651558844",
  "address1": "  Calle falsa, 61",
  "postcode": "17481",
  "email": "test@gmail.com",
  "city": "Buenos aires",
  "nutzflaeche": "50"
}
```

### Case 2: Foreign Number (005411556699)
- **Expected**: Email sent to l.lemos@eltex.es
- **Email Content**:
```
Subject: New Foreign Number Alert

A new foreign number has entered the system today: Contact Test Luciano with phone number 005411556699.

Date: 2025-06-20
```

### Case 3: Spanish Local Number (tel: 604112266)
- **Expected**: HTTP request sent to Make.com endpoint (starts with 6)

## Testing with Postman

1. Create a new POST request
2. Use your webhook URL from step 2
3. Set Content-Type to `application/json`
4. Paste one of the test case JSON payloads:

```json
{
  "action": "sale:created",
  "payload": {
    "sale_id": 9394559,
    "sale_date": "2025-06-19T16:41:41+0200",
    "lead_id": 10675703,
    "title": "Herr",
    "first_name": "Test",
    "last_name": "Luciano",
    "phone": "+34651558844",
    "mobile": null,
    "email": "test@gmail.com",
    "street": "  Calle falsa, 61",
    "zipcode": "17481",
    "city": "Buenos aires",
    "postal_address": null,
    "subject": "photovoltaics",
    "service": "power_system",
    "comment": "Importante: contactar el 23.05.2025\nCasa recién comprada. \nInterés en subvención. ",
    "infos": {
      "dachtyp": "Tejado a 3 aguas",
      "nutzflaeche": "50",
      "zeitpunkt_projektbegin": "De 3 a 6 meses",
      "ortstermin": "19.06.2025",
      "erreichbarkeit": "De jornada completa",
      "objekt": "Adosado",
      "dacheindeckung": "Teja de barro tipo arabe",
      "eigentumsverhaeltnisse": "Propietario / Poder decisión",
      "stromspeicher": "Si",
      "buy_rent": "Comprar",
      "largescaleconsumer": "151 a 250€",
      "power_consumption": "Conectada a la red",
      "photovoltaic_system_interest": "Ninguna petición especial"
    },
    "price": "41.00",
    "subscription_group": "Cataluña",
    "images": [],
    "product": "FV"
  }
}
```

5. Send the request
6. Check the scenario execution history in Make.com

## Customization Options

### Modify Phone Detection:
Edit the regex in both router filters:
```regex
^(\+34|tel:\s*[67]|[67])
```

### Change Email Template:
Update the email content in the Email module:
```
Subject: New Foreign Number Alert
Body: A new foreign number has entered the system today: Contact {{1.payload.first_name}} {{1.payload.last_name}} with phone number {{1.payload.phone}}.

Date: {{formatDate(now; "YYYY-MM-DD")}}
```

### Modify HTTP Payload:
Edit the JSON data in the HTTP Request module to include different fields.

## Troubleshooting

### Common Issues:
1. **Webhook not triggering**: Ensure scenario is active and webhook URL is correct
2. **Email not sending**: Check SMTP credentials and "from" email address
3. **HTTP request failing**: Verify the Make.com endpoint URL
4. **Phone detection not working**: Check regex pattern in router filters

### Debug Tips:
1. Use the **Run once** button to test manually
2. Check the **Execution history** for detailed logs
3. Use the **Data structure** feature to map fields correctly
4. Test regex patterns using online regex testers

## Production Considerations

1. **Error Handling**: Add error handling modules for failed HTTP requests or emails
2. **Logging**: Consider adding logging modules to track all processed requests
3. **Rate Limiting**: Be aware of Make.com operation limits
4. **Security**: Consider adding webhook authentication

## Next Steps

1. Import the blueprint file
2. Configure webhook and email settings
3. Activate the scenario
4. Test with the provided JSON cases
5. Monitor the execution history for results

The Make.com scenario is now ready to handle the same logic as described in the original exercise!
