#!/usr/bin/env python3
"""Fetch and cache PixelBlaze documentation from GitHub.

Run this script to refresh the locally cached docs:
    python scripts/fetch_docs.py
"""

import httpx
import sys
from pathlib import Path

DOCS_DIR = Path(__file__).parent.parent / "docs" / "pixelblaze"

SOURCES = [
    {
        # Source for https://electromage.com/docs/language-reference (client-side rendered,
        # so we use the canonical GitHub source which is the same content)
        "url": "https://raw.githubusercontent.com/simap/pixelblaze/master/README.expressions.md",
        "filename": "language-reference.md",
        "description": "PixelBlaze language reference (electromage.com/docs/language-reference)",
    },
    {
        "url": "https://raw.githubusercontent.com/simap/pixelblaze/master/README.mapper.md",
        "filename": "mapper.md",
        "description": "2D/3D pixel coordinate mapping reference",
    },
    {
        "url": "https://raw.githubusercontent.com/simap/pixelblaze/master/README.md",
        "filename": "overview.md",
        "description": "PixelBlaze project overview",
    },
]


def fetch_docs():
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    with httpx.Client(follow_redirects=True, timeout=30.0) as client:
        for source in SOURCES:
            print(f"Fetching {source['description']}...")
            try:
                response = client.get(source["url"])
                response.raise_for_status()
                output_path = DOCS_DIR / source["filename"]
                output_path.write_text(response.text, encoding="utf-8")
                print(f"  -> saved {output_path} ({len(response.text):,} bytes)")
            except httpx.HTTPError as e:
                print(f"  ERROR: {e}", file=sys.stderr)
                sys.exit(1)

    print("\nDone. Docs saved to:", DOCS_DIR)


if __name__ == "__main__":
    fetch_docs()
