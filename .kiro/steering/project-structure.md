---
inclusion: auto
---

# Project Structure

- Root folder contains only folders + `.gitignore`, `LICENSE`, `README.md`
- Dotfolders (`.kiro`, `.vscode`, `.git`) stay at root
- All tests go in `tests/` folder, never inside `backend/` or `frontend/`
- Config files for a stack go inside that stack's folder
- Infrastructure configs go in `infra/`
- Documentation goes in `docs/`
- If no existing subfolder fits, create a new one
- Spec versioning: archive current as `v1/` when major changes happen
