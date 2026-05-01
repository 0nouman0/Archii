# Floor Plan Reference Images

Drop 10-15 floor plan images per dimension folder.

## Folder naming
Each folder is named `{width}x{height}` in feet (e.g. `30x40`).

## File naming convention (optional but recommended)
Name files as: `{bhk}bhk_{facing}_{number}.jpg`

Examples:
  - `3bhk_north_01.jpg`
  - `2bhk_east_03.png`
  - `4bhk_south_02.jpg`

If BHK or facing is NOT in the filename, Claude Vision will auto-detect both from the image.

## Supported image formats
JPG, JPEG, PNG, WEBP

## After adding images
Run from the `Arch/` directory:
```bash
node scripts/ingest-plans.mjs
```

This processes every image, extracts vastu data, creates embeddings, and stores them in Supabase.
You only need to run it once per batch of new images.
