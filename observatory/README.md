# The Observatory

The private editing interface is available at https://letterstothespace.com/observatory/ after the PR has been merged and the host has deployed main. The route is intentionally absent from the public navigation and sitemap and carries noindex. The HTML login shell is public because LTTS uses static hosting; GitHub authorizes all changes, not the obscurity of the URL.

## First-time access

1. Sign in to GitHub and open Settings > Developer settings > Personal access tokens > Fine-grained tokens.
2. Generate a token called LTTS Observatory with a short expiration (e.g. 30 days).
3. Select resource owner gmedinat911, Only select repositories, letters-to-the-space, and Repository permissions > Contents: Read and write. Metadata read is automatically included. No other permissions are needed.
4. Enter the token only at https://letterstothespace.com/observatory/ in a top-level HTTPS tab. Never send the token in chat, place it in a URL, or commit it. The page sends the token directly to GitHub's API, keeps it in memory only, and clears it on lock/navigation or 30 minutes of inactivity. Refreshing requires signing in again. Revoke it in GitHub if necessary.

The token can write the selected repository's contents, not just the schedule; GitHub does not offer file-level PAT permissions. Use a restricted, short-lived token, and verify the deployed site before entering it. This is not server-side login or a hidden route behind an access gateway. A real single sign-on or access-gated page would require configuring the hosting provider or an auth backend.

## Editing

Each managed star has a destination, an optional local date/time, a Move now button, and Keep active / clear timer. Times are converted to ISO timestamps; the reader's clock determines expiry. Adjust X/Y positions for ordinary stars using the schematic desktop/mobile sky preview; the custom Afterlight and 75 Minutes positions are intentionally fixed. A Tale of the Author remains a permanent Easter egg.

Press Publish changes and confirm to commit only preview/star-lifecycles.json to main. GitHub checks the credential, write permission, and current file SHA; conflicting updates fail rather than silently overwriting another edit. If the repository requires pull requests, direct publication may be rejected: make the change via a normal PR instead. The dashboard reports the commit, not deployment success. Wait for the site's normal deployment before expecting changes in the public Space. Reload from GitHub to discard local edits or recover after a conflict.

The public schedule is data, not secret information, and remains readable in the public repository and Git history. Far Away and Far, Far Away are visual states, not access control. The public homepage validates the schedule and uses the original known-good defaults when the data cannot be loaded.

## Verification

Test the admin interface at the actual HTTPS domain after deployment. Preview hosts cannot accept credentials. Test unlock, edit, preview, publish, reload, and lock; then check the resulting commit and the deployed public site. Never use a real credential in a test or on an untrusted preview.

## Hidden destinations

A star's distant state now also determines which hidden realm contains it. The main Space still shows all distant stars at their configured positions. The Observatory controls the same schedule and needs no new credential or data migration. The two destination pages are not linked publicly. These remain discovery-based visual experiences, not access control.

### Preserving star forms

The destination preview can switch between the main Space, Far Away and Far, Far Away. A regular star keeps its original shape, colors, glow, rings, rays, and cloud artwork inside its assigned destination; only the overall scale changes. The main Space still uses subtle distant dots so discovery remains intact. Existing bespoke Afterlight, 75 Minutes and author Easter egg designs are unchanged. The preview is schematic and uses smaller copies of the same foreground CSS, not independently redesigned icons. No schedule migration is required.
