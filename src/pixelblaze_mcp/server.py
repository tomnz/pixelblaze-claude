"""PixelBlaze MCP server entry point.

Run with:
    uv run python -m pixelblaze_mcp.server

Or via the MCP dev inspector:
    uv run mcp dev src/pixelblaze_mcp/server.py
"""

import logging
import sys

from mcp.server.fastmcp import FastMCP

from .config import PIXELBLAZE_HOST
from .docs_tools import docs_fetch_page, docs_get_api_reference, docs_get_mapper_reference
from .pixelblaze_tools import (
    pixelblaze_create_pattern,
    pixelblaze_delete_pattern,
    pixelblaze_get_active_pattern,
    pixelblaze_get_controls,
    pixelblaze_get_device_info,
    pixelblaze_get_pattern_code,
    pixelblaze_list_patterns,
    pixelblaze_set_active_pattern,
    pixelblaze_set_brightness,
    pixelblaze_set_control,
    pixelblaze_update_pattern,
)

# Log to stderr only — stdout is reserved for MCP JSON-RPC messages
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    stream=sys.stderr,
)
logger = logging.getLogger(__name__)

mcp = FastMCP(
    "pixelblaze",
    instructions=(
        f"You are connected to a PixelBlaze LED controller at {PIXELBLAZE_HOST}. "
        "PixelBlaze runs LED patterns written in a JavaScript-like language. "
        "Each pattern must define a `render(index)` function that sets pixel colors "
        "using hsv() or rgb(). Patterns can also define `beforeRender(delta)` for "
        "per-frame logic, and export UI controls via special variable naming conventions "
        "(e.g. `export var sliderSpeed` creates a slider). "
        "Before writing any pattern code, call docs_get_api_reference to see all "
        "available built-in functions. Use pixelblaze_list_patterns to see what's "
        "currently on the device, and pixelblaze_create_pattern to deploy new effects."
    ),
)

# --- PixelBlaze device tools ---

mcp.tool()(pixelblaze_list_patterns)
mcp.tool()(pixelblaze_get_active_pattern)
mcp.tool()(pixelblaze_set_active_pattern)
mcp.tool()(pixelblaze_get_pattern_code)
mcp.tool()(pixelblaze_create_pattern)
mcp.tool()(pixelblaze_update_pattern)
mcp.tool()(pixelblaze_delete_pattern)
mcp.tool()(pixelblaze_get_controls)
mcp.tool()(pixelblaze_set_control)
mcp.tool()(pixelblaze_get_device_info)
mcp.tool()(pixelblaze_set_brightness)

# --- Documentation tools ---

mcp.tool()(docs_get_api_reference)
mcp.tool()(docs_get_mapper_reference)
mcp.tool()(docs_fetch_page)


# --- Resource: quick device context ---

@mcp.resource("pixelblaze://device")
def device_context() -> str:
    """Current PixelBlaze device connection info."""
    return f"PixelBlaze host: {PIXELBLAZE_HOST}"


def main():
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
