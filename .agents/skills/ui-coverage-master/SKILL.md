---
name: ui-coverage-master
description: Web page analysis and 100% test coverage automation. Focuses on functional and visual perfection using Playwright and Snapshots.
---

# UI-Coverage-Master Skill

This skill ensures that every interactive element on a page is accounted for, tested, and visually verified.

## 1. Goal
Achieve 100% visual and functional coverage for the target web page.

## 2. Instructions

### Phase 1: Analysis
- Navigate to the target URL.
- Extract all interactive elements (buttons, links, inputs, selects) and represent them in a hierarchical tree.
- Note the `data-testid` or stable selectors for each.

### Phase 2: Scenario Design
- For **EVERY** element, define:
  - **Success Path**: Correct interaction (e.g., clicking a button opens a modal).
  - **Error Path**: Handling invalid state (e.g., form validation errors, network failure).

### Phase 3: Test Generation (Playwright)
- Write tests using Playwright.
- Use `data-testid` as much as possible.
- Include `expect(page).toMatchSnapshot()` for all key states.
- Ensure tests are **independent**.

### Phase 4: Self-Correction Loop
- Run tests in the container: `docker compose run --rm itsm-test-e2e npx playwright test`.
- If a test fails:
  1. Capture a screenshot of the failure state.
  2. Capture browser console logs.
  3. Analyze why it failed (selector changed? data mismatch? mock failed?).
  4. Edit the test code to fix the issue.

## 3. Constraints
- **NO `page.waitForTimeout()`**: Use `page.waitForSelector()` or `page.waitForLoadState()`.
- **Atomic Tests**: Each `test()` block should handle one primary action to ensure failure isolation.
- **Visual Baseline**: Baselines MUST be generated in the Docker environment for consistency.
