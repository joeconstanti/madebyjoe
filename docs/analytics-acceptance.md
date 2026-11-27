# GA4 acceptance checks

Use the deployed homepage at `https://madebyjoe.co/` and a browser profile
with storage available and no analytics blockers. Use a fresh visitor profile
for visitor checks and a separate profile for the staff check. For checks in
GA4, select the property whose web stream measurement ID matches the Google
tag in [analytics.js](../js/analytics.js). Record the date, time zone, browser, URL
path, and result for each check. Keep raw network captures, cookies, client
and session identifiers, and account details out of shared evidence.

## 1. Page-view request transport

1. Open the browser Network panel and enable Preserve log before loading the
   homepage. Reload and leave the page open while Partytown starts.
2. Find the GA4 collection request, usually `/g/collect` on a
   `google-analytics.com` host. Inspect the query or payload for
   `en=page_view`, a `tid` that matches the homepage tag, and a page location
   (`dl`) on `madebyjoe.co`.
3. Record the event name, destination host, and HTTP status. A completed
   successful request, commonly HTTP 204, confirms transport to the collector.
   If the request is missing or blocked, check the browser console and the
   Partytown and Google tag requests. The production CSP in
   [.htaccess](../.htaccess) gives the isolated Partytown sandbox its own
   policy. A successful Google tag script load or a Microsoft Clarity request
   gives evidence for that request only.

## 2. Event delivery

Use the visitor profile on `madebyjoe.co`. The custom-event handler in
[js/enhance.js](../js/enhance.js) checks that hostname and the presence of
`gtag`.

| Action | Expected GA4 event | Parameters to check |
| --- | --- | --- |
| Scroll a section or project chapter with an ID into view and keep at least a quarter of it visible for one second in the active tab. | `section_view` | `section_id` matches the section or chapter ID. |
| Click an external HTTP(S) link inside a project chapter. | `project_click` | `section_id`, `link_domain`, and `link_url` match the chapter and destination. |
| Click a project source link on one of the project pages. | `project_click` | `section_id` is the project identifier, such as `jg-audi-a1-red-and-blue`. |
| Click the contact email link. | `contact_intent` | `contact_method` is `email_copy` after a successful copy or `email_link` when the mail link is used as a fallback. |

Check the Network panel for each exact event name and its parameters. Then
match the `page_view` and each custom event to the test visit in the property's
[Realtime report](https://support.google.com/analytics/answer/9271392), or use
[DebugView](https://support.google.com/analytics/answer/7201382) with a
debug-enabled test browser to inspect individual events and parameters. Record
the request result and GA4 observation separately for each event. If you can
see the requests but lack property access or cannot isolate the test events
from other traffic, record delivery in GA4 as unverified.

## 3. Staff traffic filtering

1. In the staff profile, open `https://madebyjoe.co/?mbj_staff=1`. Check that
   the flag disappears from the address bar and that the document's
   `<html>` element has `data-staff-traffic="internal"`. Reload the clean URL
   to check that the marker persists. Open the archive or a resource guide
   in the same profile and check for the same marker. The shared Analytics
   script stores the choice in localStorage and sets
   `traffic_type: 'internal'` in the Google tag config.
   If the browser blocks storage, the flag applies only to that visit.
2. Check the new page-view request and a custom-event request for the
   `internal` traffic type. Compare with a clean visitor profile. Run both
   profiles on a connection outside any GA4 internal-traffic IP rules to
   isolate the browser flag. The visitor profile should have no site-set
   staff marker or traffic type.
3. In the same GA4 property, inspect the Internal Traffic data filter and
   confirm that it is configured to exclude traffic type `internal`. In
   **Testing**, use an exploration with **Test data filter name** and
   **Event name** to verify that the filter marks the staff events. In
   **Active**, compare the processed report for the staff visit with the
   matched visitor visit. Use distinct test campaigns to isolate the two
   sessions and confirm that the visitor control appears before treating an
   absent staff session as evidence of exclusion. Inactive or missing filters
   leave exclusion unverified. Record the filter state and evidence. An
   active exclusion permanently drops matching incoming data. See Google's
   [internal traffic filter guidance](https://support.google.com/analytics/answer/10104470).
4. Open `https://madebyjoe.co/?mbj_staff=0` in the staff profile and reload.
   Verify that the document marker and client traffic type are absent on
   both the homepage and the secondary page.

## 4. Dashboard attribution

Start a fresh visitor session without debug mode or staff mode. Open the
homepage with distinct, non-sensitive test campaign parameters. For example,
use `utm_source=qa&utm_medium=referral&utm_campaign=analytics-check-<run>` in
the query string and replace `<run>` with a unique run label. Record that
label, the expected source and medium, and the visit time.

After processing, open **Traffic acquisition** in the correct GA4 property.
Use the property's time zone to select a date range that includes the visit.
Locate the test session by **Session campaign** and check **Session source /
medium** against the expected values. For a check of an attributed event,
also match its exact event name in that session's campaign data. If another
dashboard is under test, verify its property, date range, and dimension scope
and confirm the matching row there as well. Record the report, dimension, and
observed values. Keep the attribution result pending while the data
processes or if the report is unavailable. Google's
[Traffic acquisition guide](https://support.google.com/analytics/answer/12923437)
and [data freshness guide](https://support.google.com/analytics/answer/11198161)
describe the report and processing windows.
