"""MCP tools for accessing PixelBlaze documentation."""

import logging

import httpx

from .config import DOCS_DIR

logger = logging.getLogger(__name__)


def docs_get_api_reference() -> str:
    """Get the full PixelBlaze language reference (electromage.com/docs/language-reference).

    This covers all built-in functions available when writing pattern code:
    render(index), beforeRender(delta), color functions (hsv, rgb),
    math/waveform functions (time, wave, triangle, sin, cos, etc.),
    array functions, 2D/3D rendering, UI controls (sliders, pickers),
    language features and limitations, variables, constants, and more.

    Always call this before writing or editing any PixelBlaze pattern code.
    """
    path = DOCS_DIR / "language-reference.md"
    if not path.exists():
        return (
            "Documentation not found locally. Run `python scripts/fetch_docs.py` "
            "from the project root to download it."
        )
    return path.read_text(encoding="utf-8")


def docs_get_mapper_reference() -> str:
    """Get the PixelBlaze 2D/3D pixel mapping reference documentation.

    This covers how to define spatial coordinates for pixels using the mapper,
    coordinate systems, and the render2D/render3D pattern functions.

    Call this when working with multi-dimensional LED layouts or spatial effects.
    """
    path = DOCS_DIR / "mapper.md"
    if not path.exists():
        return (
            "Documentation not found locally. Run `python scripts/fetch_docs.py` "
            "from the project root to download it."
        )
    return path.read_text(encoding="utf-8")


def docs_fetch_page(url: str) -> str:
    """Fetch the text content of a PixelBlaze documentation page from the web.

    Use this to look up specific pages on electromage.com/docs/ that aren't
    covered by the cached API reference, such as hardware-specific guides,
    GPIO, networking, or advanced topics.

    Args:
        url: Full URL of the documentation page (e.g. https://electromage.com/docs/GPIO/).

    Returns the page text content, or an error message if unreachable.
    """
    if not url.startswith("http"):
        return f"Invalid URL: {url!r}. Must start with http or https."

    try:
        with httpx.Client(follow_redirects=True, timeout=15.0) as client:
            response = client.get(
                url,
                headers={"User-Agent": "pixelblaze-mcp/0.1 (documentation fetcher)"},
            )
            response.raise_for_status()
            # Return the raw text; Claude can parse HTML if needed, but many
            # electromage.com pages include readable content in the raw HTML.
            return response.text
    except httpx.HTTPStatusError as e:
        return f"HTTP error fetching {url}: {e.response.status_code}"
    except httpx.RequestError as e:
        return f"Network error fetching {url}: {e}"
