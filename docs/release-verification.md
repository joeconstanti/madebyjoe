# Release verification and recovery

## Before merge

1. Record the PR number and full head SHA. Run the [local validation commands](../README.md#validate)
   in a clean checkout of that SHA. Record `git rev-parse HEAD` with the results.
   If GitHub tests a synthetic merge commit, record that SHA too.
2. Open the [Validate static site workflow](../.github/workflows/validate.yml)
   run for the current PR head. Confirm that both the source checks and the
   Apache checks against the staged public files passed. Compare the current
   PR head again before merging. A new push can cancel the superseded run for
   that PR. Use the result for the replacement head.
3. For changes to public files, stage the upload tree and use it for an Apache
   check. Choose a new directory outside the checkout. The validation workflow
   shows how to serve it as the Apache document root with `AllowOverride All`.

   ```sh
   stage_parent=$(mktemp -d)
   python3 scripts/stage-public.py "$stage_parent/public"
   # After starting Apache with that document root on port 8088:
   python3 scripts/check-server.py http://127.0.0.1:8088
   ```

4. For runtime or media changes, use the [browser acceptance checks](../README.md#validate)
   on the affected paths. Use an Apache preview when a check depends on redirects,
   404 responses, security headers or range requests. A Python preview can serve
   the HTML for rendering checks and does not apply `.htaccess`.

## After merge

1. Record the SHA pushed to `main`. The push starts both **Validate static site**
   and [**Deploy to GoDaddy via FTP**](../.github/workflows/deploy.yml). The deploy
   workflow runs its own source checks, stages the public files and uploads them.
   Check both workflow conclusions for the same SHA. Record the deploy run URL,
   attempt number and result of the FTP step. The production concurrency group
   allows only one active upload and does not cancel an upload when a new push arrives.
2. Check the public site after the upload. Compare a changed response or asset
   with the expected content from the staged files for that SHA. A successful
   upload confirms the workflow result. A matching public response confirms
   delivery for that URL at the time of the request.
3. Repeat the affected browser checks on the public site. Record the URL,
   browser, viewport, relevant console or network results and observed behavior.
   For an affected video, check playback or seeking as well as the range response.
   For a recovery-page change, open a missing URL and use the homepage link.

## Public HTTP checks

Use the public hostname for these requests. The host overrides in
[`check-server.py`](../scripts/check-server.py) are for direct Apache testing.

```sh
site=https://madebyjoe.co
evidence_dir=$(mktemp -d)

curl -sS -D "$evidence_dir/home.headers" -o "$evidence_dir/home.html" "$site/"
curl -sS -D "$evidence_dir/404.headers" -o "$evidence_dir/404.html" \
  "$site/definitely-missing-mbj-page"
curl -sS -D - -o /dev/null "$site/OG.jpg?test=1"
curl -sS -D "$evidence_dir/share.headers" -o "$evidence_dir/share.jpg" \
  "$site/img/OG.jpg"
curl -sS --max-filesize 16 -H 'Range: bytes=0-15' \
  -D "$evidence_dir/range.headers" -o "$evidence_dir/range.bin" \
  "$site/media/v2/aut-pipes.mp4"
wc -c < "$evidence_dir/range.bin"
```

| Request | Expected evidence |
| --- | --- |
| `/` | `200`, HTML and the content expected for this release. `og:url` points to `https://madebyjoe.co/` and `og:image` points to `https://madebyjoe.co/img/OG.jpg`. |
| `/definitely-missing-mbj-page` | `404` on a GET, with `Page not found`, a `Back to madebyjoe` link to `/` and the recovery page's `noindex` directive. |
| `/OG.jpg?test=1` | `301` with `Location: https://madebyjoe.co/img/OG.jpg?test=1`. Check the first response before following a redirect. |
| `/img/OG.jpg` | `200`, `Content-Type: image/jpeg` and the expected share image. Compare its bytes with the staged JPEG if the public response has no image transformation. |
| `/media/v2/aut-pipes.mp4` with `Range: bytes=0-15` | `206`, `Content-Type: video/mp4`, `Content-Range: bytes 0-15/<total>` with total greater than 15, and a 16-byte body. For a release that changes this file, compare the returned bytes with the first 16 bytes of the staged file. |

Check relevant canonical redirects, cache directives and security headers when
the release changes them. The staged Apache check covers these contracts,
including the isolated analytics worker CSP and internal path denials.

| Observation point | What to record |
| --- | --- |
| Staged Apache | Source commit SHA and check output for the public artifact built from it. This tests `.htaccess` and staged files under Apache. |
| Public HTTP through the CDN | Status, actual redirect, relevant headers, body or asset comparison and request time in UTC. If the response is stale, record `Age`, `Cache-Control` and any cache status headers present. |
| Browser on the public URL | Rendered result and actual interaction. If only an existing browser profile shows old content, repeat in a fresh profile and check its Network panel. |

If staged Apache passes and public HTTP differs, check the matching FTP run and
the public cache evidence. If an approved direct production origin endpoint is
available, compare the same request at the origin. Use the comparison to locate
the discrepancy before attributing it to the origin or CDN. Old immutable
responses can persist until they expire or the relevant cache is cleared.

## Recover a failed release

1. Identify the failed step and attempt. A source or staging failure needs a
   fix and a new validated commit. For an FTP failure, use the log to establish
   whether it stopped before upload, during transfer or at an unknown point.
   Record the error and phase without connection details.
2. Consider one retry of the same run for a transient connection or control
   socket timeout **before upload starts**. First confirm the intended SHA is
   still current on `main` and no newer deployment is queued, active or already
   complete. Rerun the failed job with the same inputs and record the new attempt.
   If a newer release superseded it, verify the newer deployment instead.
3. If the retry fails, the error is authentication or configuration related, or
   upload may have started, diagnose before retrying. A partial transfer can
   leave mixed files on the server. Check the affected public URLs against the
   intended release and the last verified release. Coordinate recovery through
   the production workflow and keep the legacy manual route out of this process.
4. If a change must be rolled back, revert it through a reviewed PR. Confirm
   validation and FTP results for the revert SHA on `main`, then repeat the
   public HTTP and affected browser checks. Record which results passed and
   which remain unverified before closing the release.
