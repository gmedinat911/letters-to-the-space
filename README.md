# Letters to the Space

Static HTML/CSS source for **letterstothespace.com**.

## Structure
- `index.html` — persistent soundtrack shell; `space-view.html` — visual universe
- `site-navigation.js` — real route URLs, history and scroll restoration
- `wormhole.js` — existing star and constellation behavior (unchanged)
- `letters/index.html` — static index of published standalone letters
- `letters/*/index.html` — individual letter pages (unchanged)
- `sitemap.xml` and `robots.txt` — machine-readable discovery

## Published standalone letters (19)
- [Always Here](letters/always-here/index.html)
- [Born Again](letters/born-again/index.html)
- [For All the People I Couldn't Keep](letters/for-all-the-people-i-couldnt-keep/index.html)
- [For the People Who Stayed](letters/for-the-people-who-stayed/index.html)
- [Going Rogue](letters/going-rogue/index.html)
- [If a Leaf Falls Quietly](letters/if-a-leaf-falls-quietly/index.html)
- [Invisible :)](letters/invisible/index.html)
- [Ordinary](letters/ordinary/index.html)
- [Remember Me](letters/remember-me/index.html)
- [Someone Who Remembers](letters/someone-who-remembers/index.html)
- [The Future I Had Already Met](letters/the-future-i-had-already-met/index.html)
- [The Goodbye You'll Never Hear](letters/the-goodbye-youll-never-hear/index.html)
- [The Raffle](letters/the-raffle/index.html)
- [The Space Between Our Words](letters/the-space-between-our-words/index.html)
- [This Is Where I Leave the Light](letters/this-is-where-i-leave-the-light/index.html)
- [Three Dots](letters/three-dots/index.html)
- [Too Much](letters/too-much/index.html)
- [When the Future Went Quiet](letters/when-the-future-went-quiet/index.html)
- [When I'm Ready](letters/when-im-ready/index.html)

## Visibility
The **Almost** constellation remains intentionally hidden from the main space and is excluded from this index and sitemap. Its direct URL is unchanged. Far, Far Away Easter eggs remain unlisted in the public letter index and sitemap. The original letter prose remains canonical.

## Deployment
Deploy the repository contents to the hosting document root. All files are UTF-8. The prose is canonical and must not be rewritten without permission.

## Star lifecycles

The Observatory lives at `/observatory/`. It edits `preview/star-lifecycles.json`, the shared lifecycle schedule. The public homepage loads and validates this JSON, using a known-good fallback if it cannot be loaded. See `observatory/README.md` for access, publishing and recovery instructions.

A `null` deadline leaves a star active; ISO 8601 timestamps with an explicit offset schedule its move to `far-away` or `far-far-away`. The same anchor remains clickable. The author's tale is an independent Easter egg. Existing positions and the two special distant designs are retained. Dates use the visitor's clock. No timers or countdowns appear in the public Space. The schedule and its Git history are public; it is not a privacy or access-control mechanism.
