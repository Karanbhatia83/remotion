# Devi end-card — 1080x1920

Source HTML for the reel end-card, imported into Adobe Express as an editable
document (background + two image objects, not one flat image).

Express doc: urn:aaid:sc:AP:4b1faab0-dd0e-482f-9046-c5b520685c3a

## Layout

| Element | Position | Size |
|---|---|---|
| Background `#012695` | full bleed | 1080x1920 |
| Devi calligraphy | 210, 490 | 660x743 |
| Antara / N.A.R.G. lockup | 180, 1420 | 720x182 |

Instagram's UI covers roughly the top 130px and the bottom 288px (caption zone).
Artwork runs 490-1233 and 1420-1602, so both sit clear of them.

## Assets

`devi-calligraphy.png` and `devi-lockup.png` are cropped from the supplied 4:5
brand card (calligraphy at x198-806/y233-921, lockup at x135-945/y1007-1193,
separated by an 84px blank band, each padded 12px). They are kept **opaque on
the brand blue** rather than keyed to transparency — placed back on the same
`#012695` the seam is invisible, which avoids any keying fringe around the
white brush strokes.

No CTA, no added type. The 4:5 original crammed both elements together; at 9:16
there is room to give the calligraphy air and drop the lockup into the safe band.

## Regenerating

The HTML embeds both PNGs as base64 so it is self-contained. To re-import after
editing, upload it to Creative Cloud and pass the presigned URL to
`export_html_to_express` — do not inline 740KB of base64 into a tool call.
