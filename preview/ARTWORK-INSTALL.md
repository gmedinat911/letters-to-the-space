# LTTS Cinematic Artwork Preview

This is an isolated preview branch. Existing homepage, letter pages, and constellation interiors are unchanged.

## Install the artwork

1. Download the supplied `ltts-cosmic-artwork-pack.zip` from the ChatGPT conversation.
2. Extract the archive and upload all files in its `preview/art/` directory to the matching `preview/art/` path on this branch.
3. Preview the deployed `/preview/` page. The image-first homepage and star entry transitions will use the uploaded WebP files.

## What is implemented

- Text-free art backgrounds and color-graded letter/constellation scene exports are supplied separately in the ZIP.
- Preview star click/tap starts a 1.1-second expanding-light transition toward the selected destination artwork.
- Titles appear on hover, focus, or first mobile tap; second tap navigates.
- Reduced-motion preference skips the cinematic transition.
- All original letter pages and constellation interiors remain unchanged. The transition currently navigates to those original pages; bespoke arrival-page artwork is a future integration step after approval.
- `75 Minutes` remains hidden from the main universe. `This Is Where I Leave the Light` belongs inside Afterlight and is not a homepage star. `Almost` stays hidden.

## Status

The GitHub connector can write text but the artwork WebP binaries have not been uploaded to the branch. Do not merge until the files are uploaded and the visual interactions have been tested in a browser.
