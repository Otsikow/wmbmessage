# Message Church Directory Test Plan

## Validation & Security
- Submit a church with a WhatsApp number missing the country code (e.g. `0551234567`) and confirm the form blocks submission with an error.
- Submit a church with an invalid WhatsApp number (e.g. `+12`) and confirm the server rejects the insert.
- Attempt to submit without checking the affirmation checkbox and confirm the form blocks progression.
- Confirm public directory only returns `verified = true` and `status = PUBLISHED` records by querying `/message-churches` unauthenticated.

## Duplicate Protection
- Submit a church with the same `church_name + city + country` as an existing listing and confirm the submission status is `NEEDS_REVIEW`.
- Submit a church with the same WhatsApp number as an existing listing and confirm the submission status is `NEEDS_REVIEW`.

## Admin Workflow
- Approve a pending submission and verify a new church record is created with `verified = true`, `status = PUBLISHED`, `verified_at` set, and `verified_by_admin_id` populated.
- Mark a submission as Needs Review and verify it remains hidden from the public directory.
- Reject a submission and verify the rejection reason is required and stored.
- Edit a church’s WhatsApp number and confirm it is saved in normalized E.164 format.

## Directory UX
- Search by church name, city, country, and pastor/contact name and confirm results update.
- Verify the WhatsApp button opens `https://wa.me/<E164_without_plus>`.
- Open a church detail page and confirm full address, pastor/contact name, and optional contact links render correctly.
