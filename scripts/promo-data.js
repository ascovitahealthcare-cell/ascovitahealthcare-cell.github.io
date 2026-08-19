/* PROMO-DATA.js — extracted from index.html inline block (19 Aug 2026, Manus SEO pass).
   Referenced by scripts/promo-media.js (window.PROMO_MEDIA). */
/**
 * PROMO_MEDIA.js — Ozylix
 * ─────────────────────────────────────────────────────────────────
 * Upload your promo images to https://ascovita.imgbb.com/
 * Then paste the direct image links into the `src` fields below.
 *
 * ⚠️ PERFORMANCE — READ BEFORE UPLOADING (important, unlike your
 * product images) ⚠️
 * Your product photos are hosted on Wix, which auto-generates
 * compressed AVIF versions on the fly (that's what "enc_avif,quality_auto"
 * in those URLs does). imgbb does NOT do this — whatever file you
 * upload here is served byte-for-byte as-is, full resolution, to
 * every mobile visitor. These 19 cards are one of the heaviest asset
 * groups on the site if uploaded as raw phone-camera JPG/PNG.
 *
 * BEFORE uploading each image to imgbb:
 *   1. Resize it to roughly the display size — these cards render at
 *      185px wide (desktop) / ~50vw (mobile), max ~260px tall. A
 *      1200px+ source image is pure waste at this size.
 *   2. Run it through a WebP converter at ~80% quality:
 *        - Squoosh.app (drag & drop, no install), or
 *        - `cwebp -q 80 input.jpg -o output.webp` locally
 *   3. Upload the resulting .webp file to imgbb — it hosts and
 *      direct-links .webp exactly like .jpg/.png.
 *   4. Paste that link into `src` below.
 *
 * The on-page card container already has a fixed height via CSS
 * (.pm-card-media), so image weight — not layout shift — is the
 * only thing to worry about here.
 *
 * HOW TO UPDATE:
 *   1. Go to https://ascovita.imgbb.com/ and upload your (pre-compressed,
 *      WebP) image.
 *   2. Copy the "Direct link" (ends in .jpg / .png / .webp).
 *   3. Paste it into the `src` field of the card you want to update.
 *   4. Commit & push this file to GitHub — changes go live instantly.
 *
 * FIELDS PER CARD:
 *   src      — Direct image URL from imgbb  (required for image)
 *   type     — "image" | "video"            (default: "image")
 *   poster   — Thumbnail URL for videos     (optional)
 *   ctaPage  — Page to open on click        (default: "shop")
 *              Options: "shop", "home", "about", "contact"
 * ─────────────────────────────────────────────────────────────────
 */

var PROMO_MEDIA = [

  {
    src:     '/assets/blog/post-acv.webp',
    type:    'image',
    ctaPage: 'shop'
  },

  {
    src:     '/assets/blog/post-ashwagandha.webp',
    type:    'image',
    ctaPage: 'shop'
  },

  {
    src:     '/assets/blog/post-bone-health.webp',
    type:    'image',
    ctaPage: 'shop'
  },

  {
    src:     '/assets/blog/post-glutathione.webp',
    type:    'image',
    ctaPage: 'shop'
  },

  {
    src:     '/assets/blog/post-green-tea.webp',
    type:    'image',
    ctaPage: 'shop'
  },

  {
    src:     'https://i.ibb.co/CK6rBfjD/post-lcarnitine.webp',
    type:    'image',
    ctaPage: 'shop'
  },

  {
    src:     'https://i.ibb.co/Xxwfv8MZ/post-mens-multi.webp',
    type:    'image',
    ctaPage: 'shop'
  },

  {
    src:     'https://i.ibb.co/pjvGggG9/post-rehydration.webp',
    type:    'image',
    ctaPage: 'shop'
  },

  {
    src:     'https://i.ibb.co/5hn0S7Dj/post-vit-c.webp',
    type:    'image',
    ctaPage: 'shop'
  },

  {
    src:     'https://i.ibb.co/60WYZVQ0/post-womens-multi.webp',
    type:    'image',
    ctaPage: 'shop'
  },

];
