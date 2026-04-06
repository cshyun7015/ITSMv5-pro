# ITSM v5 CSS Design Standard (Draft)

This document defines the unified CSS standard for the ITSM v5 project.

## 1. Core Variables (Unified HSL)
Always use the variables from `index.css`.
- **Backgrounds**: `var(--bg-primary)`, `var(--bg-secondary)`.
- **Accents**: `var(--brand-primary)` (Neon Cyan).
- **Statuses**: `var(--status-critical)`, `var(--status-high)`, `var(--status-medium)`, `var(--status-low)`, `var(--status-resolved)`.

## 2. Shared Component Patterns

### 2.1 Cards & Bento Grid (Unified)
- **Container**: `display: grid; gap: var(--spacing-unit) * 3;`
- **Metric Card**:
  ```css
  .metric-card {
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-unit) * 3;
    transition: transform 0.3s ease;
  }
  .metric-card:hover { transform: translateY(-4px); }
  ```

### 2.2 Buttons (Premium only)
- Always use `.btn-premium` for primary actions.
- Always use `.btn-premium-secondary` for secondary actions.

### 2.3 Forms (Standardized)
- Group labels: `text-transform: uppercase; letter-spacing: 1px; font-weight: 800;`
- Input field: `background: rgba(255,255,255,0.05); border-radius: var(--radius-sm);`

### 2.4 Tables & Lists
- Use `.glass` for table headers.
- Consistent row padding and subtle hover effects.

## 3. Global Utilities
- `.custom-scrollbar`: Use throughout the app.
- `.text-gradient`: Use for key metric values or titles.
- `.status-glow`: Indicator for severity levels.
