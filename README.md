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

`preview/star-lifecycles.js` is the single schedule for homepage stars. Set `farAwayAfter` to an ISO 8601 timestamp with a timezone (e.g. `2027-01-01T00:00:00-05:00`), or leave it `null` to keep a star active indefinitely. Choose `destination: 'far-away'` for a modest distant light or `destination: 'far-far-away'` for a faint one. The two existing distant stars use the initial example cutoffs; these are configuration values, not historical event dates. The author's tale stays an independent Easter egg. All other timers start disabled.

When a timer expires, the same clickable anchor moves into the fixed background layer; no letter is deleted, duplicated, or automatically removed from the sitemap. Existing distant star positions are preserved. Other stars have reserved viewport positions and retain their tint. The schedule uses the visitor's device clock and checks again when a page is resumed. Changing a timer to `null` restores the foreground star on the next page load. No timer, countdown, or label is displayed to readers. Test via a deployment preview by temporarily giving an active star an already-past date.
