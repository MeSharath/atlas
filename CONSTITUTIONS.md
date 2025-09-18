# CONSTITUTIONS.md

## Project Constitution: SoloAI Travel Planner

---

### 1. Inspiration
We believe solo travel should be safe, empowering, and uniquely tailored for each person. Harnessing the latest AI and Google tech, we’re building the MVP that lets anyone confidently plan and explore the world—solo.

---

### 2. Mission & Scope
**Mission:**  
Build and demo an AI-powered, solo-first travel planner that leverages Google AI stack, dynamic APIs, and spec-driven development for hackathon excellence and real-world value.

**Scope:**  
- Strictly adhere to Hack2Skill Vision requirements (see `/docs/HACKATHON_RULES.md`).
- Prioritize MVP features that directly address solo traveler pain points and scoring criteria.

---

### 3. Product & Development Principles

- **User-first**: Every feature solves a real solo travel need (autonomy, safety, adaptivity).
- **Transparency**: Warn users rather than silently taking automated actions.
- **Spec-driven Development**: All work tied to issues, stories or PRDs in `/specs`.
- **Security & Privacy**: Minimal, secure auth (Firebase), no unnecessary PII.
- **Traceability**: Features, decisions, and bug fixes reference at least one `.md` and Issue/PR.

---

### 4. Team Model & Roles

- **Default (Solo/Agile) Mode:** Team = 1, but supports easy handoff for new collaborators.
- **Roles (if team grows):**
    - Project Owner: Mission, merges, hackathon compliance.
    - Engineer(s): Code, tests, proto features from .md specs.
    - AI/Prompt Lead: Gems/Vertex AI, doc and workflow QA.
    - QA: Test plans, acceptance reviews.

---

### 5. Workflow & Amendment Policy

- **Initiate New Feature:**  
  - Create/Link story in `/specs` OR draft Issue referencing spec section.
- **Before Merge:**  
  - Code in PR *must* reference relevant `.md` and/or Issue for traceability.
  - Run tests (manual/automated); green before merge.
- **Amendment Process:**  
  - Propose update in PR referencing this file (+ reason).
  - Log amendment in `CHANGELOG` section of this file.
  - Owner/PM reviews and merges with 1-line summary in log.
- **Amendment Log:**  
  - _2025-09-18_: Initial creation.

---

### 6. Tools, Integrations, and Policies

- **Core Stack:** Gemini Pro (Vertex AI), Google Maps API, Windsurf Pro, Firebase, BigQuery, Perplexity Pro, Github Spec Kit.
- **Folder Guidance:**  
    - `/specs`: All live PRDs, stories, acceptance.
    - `/docs`: Hackathon rules, user guides, onboarding.
    - `/src`: All code for frontend, backend, cloud.
    - `/tests`: Scripts, notebooks, or checklists.
    - `/scripts`: Tools/automation helpers, Gemini CLI flows, etc.
- **Testing Policy:**  
    - All new features have at least manual acceptance test or checklist reference in `.md` file.
    - Significant bugs/issues must be cross-referenced to a spec or acceptance.
    - Tests/acceptance must pass before hackathon milestone merges.

---

### 7. Coding & Documentation Practices

- All PRs, commits, and merges must reference `.md` spec and (preferably) an Issue number.
- README and this document must be kept up to date.
- Use structured frontmatter (where useful) for easy parsing by automation (Windsurf etc.).
- All decisions, pivots, and major bug fixes logged via PR referencing this constitution.

---

### 8. Communication & Collaboration

- Major milestones or releases recapped in PRs/issues.
- All onboarding, handoff, or troubleshooting steps documented in `/docs` for async clarity.

---

### 9. Values

- **Empathy:** Build for real people. Be mindful of travel edge cases/hardships.
- **Radical Simplicity:** Simpler flows, less friction, more power to the user.
- **Learning Mindset:** Review post-hackathon for direct lessons and retro documentation.

---

### 10. FAQ (Preview)

- *How do I propose a new feature/idea?*  
  _Draft an Issue linking to specs and suggest a PRD update in `/specs`._

- *Am I allowed to pivot or remove legacy code?*  
  _Yes, via PR referencing amendment + rationale, updating this constitution as needed._

- *Where do I document an API or model change?_  
  _In `/specs`, link to live endpoint or updated prompt, and cross-reference in code._

---

_Last updated: 2025-09-18_

