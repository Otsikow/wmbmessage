# CODEX Prompt 2: WhatsApp Notifications (Primary Channel)

## Purpose
Deliver high-impact event alerts via WhatsApp without becoming spammy or unprofessional.

## System Objective
Build a WhatsApp Event Notification System using the WhatsApp Business API.

## 1. User Opt-In (Non-Negotiable)
Users must explicitly opt-in to WhatsApp notifications. Provide the following opt-in options:

- All events
- Events in my country
- Events in my city
- Events from my church/group only

Store:
- Phone number (with country code)
- Consent timestamp
- Notification preferences

## 2. WhatsApp Message Types
Only allow the following WhatsApp messages:

### a) New Event Alert
Sent when a relevant event is published.

**Example**
“📍 Upcoming Revival Meeting in Accra
🗓️ 12–14 March
Tap to view details”

### b) Event Reminder
- 24 hours before event
- 2 hours before event (optional)

### c) Event Update
- Time change
- Venue change
- Cancellation

## 3. Message Limiting
- Max 2 WhatsApp messages per event per user
- Hard daily cap per user
- No bulk blast without filtering

## 4. WhatsApp Template Management
- Use approved WhatsApp templates
- No emojis overload
- Clear, respectful tone

## 5. Unsubscribe & Control
Every WhatsApp message must include:

“Reply STOP to unsubscribe”

Users can also manage preferences in-app.

## 6. Failover to Email
If WhatsApp delivery fails:

- Send email fallback (optional)
- Track delivery status
