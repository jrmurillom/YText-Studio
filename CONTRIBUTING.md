# Contributing to YText Studio

Thank you for your interest in contributing to **YText Studio**! We welcome meaningful contributions that advance the project's mission: delivering a commercial-grade, ultra-fast, and ergonomic YouTube thumbnail typography and art-direction workstation.

To maintain the architectural health, performance (<40MB RAM footprint), and strict quality standards of the codebase, all contributors must adhere to the guidelines outlined below.

---

## 🛑 The Golden Rule: Pitch First, Code Later

**Never start coding a new feature, enhancement, or major refactor without an approved issue first.**

1. **Bug Fixes:** Check existing [Issues](https://github.com/jrmurillom/YText-Studio/issues) or open a new Bug Report detailing the problem and steps to reproduce.
2. **Enhancements & Improvements:** Open a **Feature Request / Enhancement** issue describing:
   - What problem or user friction this solves for YouTube creators.
   - The proposed technical approach and architectural impact.
   - Alternatives considered.
3. **Wait for Maintainer Approval:** Once the maintainer discusses and approves the proposal, you will be invited to submit a Pull Request referencing that issue.

> ⚠️ **Pull Requests submitted without a linked, approved issue will be closed without review.**

---

## 🚫 Zero Tolerance: Low-Effort & "Drive-By" PRs

To protect maintainer bandwidth and repository hygiene, the following types of Pull Requests are strictly prohibited and will be rejected immediately:

- **Trivial Edits:** Changing single words, fixing minor typos in comments, modifying punctuation, or adjusting whitespace for GitHub activity badges (e.g. Hacktoberfest spam).
- **Unsolicited Aesthetic Refactors:** Reformatting code, reorganizing imports, or changing stylistic conventions without measurable architectural or runtime improvements.
- **Heavy or Redundant Dependencies:** Introducing external frameworks, component libraries, or canvas abstraction wrappers (e.g., Fabric.js, Konva, lodash). YText Studio relies exclusively on **native browser APIs** (`Canvas 2D`, `DOMMatrix`, `OffscreenCanvas`, `fetch`).
- **AI-Generated Slop:** Submitting untested code dumps from LLMs without thorough human verification, local testing, and clear rationale.

---

## 🧪 Quality Standards & Acceptance Criteria

Every Pull Request must satisfy the following technical prerequisites before it can be merged:

1. **TypeScript Strictness:**
   - Cero `any` abuse. All types, interfaces, and function signatures must be strictly typed.
   - Verification command: `npx tsc --noEmit` must exit with `0` errors.
2. **Mandatory Test Coverage:**
   - Any new feature or bug fix **must include corresponding unit tests** in Vitest (`*.test.ts`).
   - All existing tests must pass: `npm test` (or `npx vitest run`).
3. **Minimal Diff Surface:**
   - Touch only the lines strictly necessary to solve the issue. Collateral changes or unrelated file formatting will be rejected.
4. **Performance & Memory:**
   - The render loop must sustain 60–120 FPS on canvas operations.
   - Background bitmap operations must use `OffscreenCanvas` and avoid blocking the main thread.

---

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jrmurillom/YText-Studio.git
   cd YText-Studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Run tests and typecheck:**
   ```bash
   npx tsc --noEmit
   npm test
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📬 Submitting a Pull Request

1. Create a descriptive feature branch from `main`:
   ```bash
   git checkout -b feat/your-approved-feature-name
   # or
   git checkout -b fix/your-approved-bug-name
   ```
2. Make clean, atomic commits following the [Conventional Commits](https://www.conventionalcommits.org/) specification (`feat:`, `fix:`, `docs:`, `chore:`, `perf:`).
3. Ensure all tests and type checks pass locally.
4. Open your Pull Request using the official **PR Template** and fill out all required checklist fields completely.
