"""MCP tools for interacting with the PixelBlaze device."""

import logging
from contextlib import contextmanager
from typing import Any

from pixelblaze import Pixelblaze

from .config import PIXELBLAZE_HOST

logger = logging.getLogger(__name__)


@contextmanager
def _pb():
    """Context manager that yields a connected Pixelblaze instance."""
    pb = Pixelblaze(PIXELBLAZE_HOST)
    try:
        yield pb
    finally:
        pb._close()


def pixelblaze_list_patterns() -> list[dict[str, str]]:
    """List all patterns stored on the PixelBlaze device.

    Returns a list of dicts with 'id' and 'name' keys.
    """
    with _pb() as pb:
        patterns = pb.getPatternList()
        return [{"id": pid, "name": name} for pid, name in patterns.items()]


def pixelblaze_get_active_pattern() -> dict[str, str]:
    """Get the currently active (running) pattern on the PixelBlaze.

    Returns a dict with 'id' and 'name' of the active pattern.
    """
    with _pb() as pb:
        active = pb.getActivePattern()
        if active is None:
            return {"id": "", "name": "(none)"}
        # getActivePattern returns a dict like {id: name}
        pid, name = next(iter(active.items()))
        return {"id": pid, "name": name}


def pixelblaze_set_active_pattern(pattern_id: str) -> str:
    """Switch the PixelBlaze to run a specific pattern by its ID.

    Args:
        pattern_id: The pattern ID to activate (from pixelblaze_list_patterns).

    Returns a confirmation message.
    """
    with _pb() as pb:
        pb.setActivePattern(pattern_id)
        return f"Activated pattern {pattern_id}"


def pixelblaze_get_pattern_code(pattern_id: str) -> str:
    """Get the JavaScript source code of a pattern.

    Args:
        pattern_id: The pattern ID to retrieve code for.

    Returns the JavaScript source code string.
    """
    with _pb() as pb:
        code = pb.getPatternSourceCode(pattern_id)
        if code is None:
            return f"No source code found for pattern {pattern_id}"
        return code


def pixelblaze_create_pattern(name: str, code: str) -> dict[str, str]:
    """Create a new pattern on the PixelBlaze with the given JavaScript code,
    then activate it.

    Args:
        name: Display name for the new pattern.
        code: PixelBlaze JavaScript source code (must define a render(index) function).

    Returns a dict with the new pattern's 'id' and 'name'.
    """
    with _pb() as pb:
        pattern_id = pb.savePattern(previewImage=b"", sourceCode=code, name=name, allowCache=True)
        pb.setActivePattern(pattern_id)
        return {"id": pattern_id, "name": name}


def pixelblaze_update_pattern(pattern_id: str, code: str) -> str:
    """Replace the JavaScript source code of an existing pattern.

    Args:
        pattern_id: The ID of the pattern to update.
        code: New PixelBlaze JavaScript source code.

    Returns a confirmation message.
    """
    with _pb() as pb:
        # Get name first so we preserve it
        patterns = pb.getPatternList()
        name = patterns.get(pattern_id, pattern_id)
        pb.savePattern(previewImage=b"", sourceCode=code, name=name, id=pattern_id, allowCache=True)
        return f"Updated pattern '{name}' ({pattern_id})"


def pixelblaze_delete_pattern(pattern_id: str) -> str:
    """Delete a pattern from the PixelBlaze device.

    Args:
        pattern_id: The ID of the pattern to delete.

    Returns a confirmation message.
    """
    with _pb() as pb:
        pb.deletePattern(pattern_id)
        return f"Deleted pattern {pattern_id}"


def pixelblaze_get_controls() -> list[dict[str, Any]]:
    """Get the UI controls for the currently active pattern.

    Returns a list of control dicts, each with 'name', 'value', and 'type' keys.
    The controls correspond to exported slider/toggle/picker variables in the pattern code.
    """
    with _pb() as pb:
        active = pb.getActivePattern()
        if not active:
            return []
        pattern_id = next(iter(active.keys()))
        controls = pb.getPatternControls(pattern_id)
        if not controls:
            return []
        return [{"name": k, "value": v} for k, v in controls.items()]


def pixelblaze_set_control(name: str, value: float) -> str:
    """Set the value of a UI control (slider, toggle, etc.) on the active pattern.

    Args:
        name: The control variable name (as it appears in pixelblaze_get_controls).
        value: Numeric value (sliders: 0.0–1.0; toggles: 0 or 1).

    Returns a confirmation message.
    """
    with _pb() as pb:
        pb.setControl(name, value)
        return f"Set control '{name}' to {value}"


def pixelblaze_get_device_info() -> dict[str, Any]:
    """Get hardware and runtime information about the PixelBlaze device.

    Returns a dict with keys: host, pixel_count, fps, uptime_s,
    version_major, version_minor.
    """
    with _pb() as pb:
        stats = pb.getStatistics()
        info: dict[str, Any] = {
            "host": PIXELBLAZE_HOST,
            "fps": pb.getFPS(),
            "uptime_s": pb.getUptime(),
            "version_major": pb.getVersionMajor(),
            "version_minor": pb.getVersionMinor(),
        }
        if stats:
            info["pixel_count"] = stats.get("pixelCount")
            info["render_ms"] = stats.get("renderMs")
        return info


def pixelblaze_set_brightness(value: float) -> str:
    """Set the global brightness of the PixelBlaze.

    Args:
        value: Brightness level from 0.0 (off) to 1.0 (full brightness).

    Returns a confirmation message.
    """
    value = max(0.0, min(1.0, value))
    with _pb() as pb:
        pb.setBrightnessSlider(value)
        return f"Set brightness to {value:.2f}"
