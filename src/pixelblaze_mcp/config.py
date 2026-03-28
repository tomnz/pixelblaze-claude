import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (two levels up from this file)
_project_root = Path(__file__).parent.parent.parent
load_dotenv(_project_root / ".env")

PIXELBLAZE_HOST: str = os.environ.get("PIXELBLAZE_HOST", "192.168.2.97")
DOCS_DIR: Path = _project_root / "docs" / "pixelblaze"
