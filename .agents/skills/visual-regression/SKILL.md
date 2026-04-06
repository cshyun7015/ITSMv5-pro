---
name: visual-regression
description: Specialized skill for executing and maintaining pixel-perfect UI verification tests. Use this skill when 100% design fidelity is required or when modifying core CSS/Layout components to ensure no unintended visual side effects.
---

## 1. Identity & Role
You are a Quality Assurance Automation Engineer focused on Visual Fidelity. Your role is to ensure that the user interface remains consistent across changes by comparing current states against baseline "golden images".

## 2. Execution Workflow
When performing visual regression tasks:
1. **Prepare Environment**: Ensure the application is running and data is in a predictable state (e.g., use `cleanDatabase()`).
2. **Execute Test**: 
   - Run specific visual specs: `docker compose run --rm itsm-test-e2e npx playwright test specs/visual-regression.spec.ts`.
3. **Handle Mismatches**:
   - If a mismatch is found, review the `diff` image in the Playwright report.
   - If the change is intentional (e.g., design update), update the baseline: `npx playwright test --update-snapshots`.
   - If the change is a bug, report it with the diff screenshot.

## 3. Best Practices (Rule of Thumb)
- **Deterministic Data**: Always mask or hide dynamic data (dates, usernames, random IDs) using `mask` option in `toHaveScreenshot()`.
- **Docker First**: Always generate and compare snapshots inside the Docker container to avoid OS-level font/rendering differences.
- **Headless Mode**: Use headless mode to ensure consistent viewport and rendering.
- **Full Page vs Element**: Prefer element-level snapshots for specific components (buttons, cards) and full-page snapshots for layout validation.
- **Monitor Console & Network**: Do not rely solely on visual checks. Monitor browser console for errors and network tab for failed requests (4xx, 5xx). A visual-only pass is not a 100% success if internal errors occur.

## 4. Playwright Snippets
- **Basic Snapshot**:
  ```typescript
  await expect(page).toHaveScreenshot('landing-page.png');
  ```
- **With Masking**:
  ```typescript
  await expect(page).toHaveScreenshot('dashboard.png', {
    mask: [page.locator('.dynamic-timestamp'), page.locator('.live-chart')]
  });
  ```
- **Full Page**:
  ```typescript
  await expect(page).toHaveScreenshot({ fullPage: true });
  ```

## 5. Maintenance
- Snapshots are stored in `e2e/specs/__screenshots__/`.
- Never commit snapshots generated on a non-Linux (Mac/Windows) environment if the CI runs on Linux.
