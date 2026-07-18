# 001 — Snappy Recipient Pills Layout

- **Status**: DONE
- **Commit**: 4fb4b415e
- **Severity**: HIGH
- **Category**: Easing & duration
- **Estimated scope**: 1 file, small change

## Problem

The layout transition for recipient pills (`EmailPillsInput`) is slow and sluggish. This happens because Framer Motion uses a default, slow spring configuration for layout animations, which takes ~450ms. As a result, when elements are added or deleted, their shifts are noticeably delayed.

Pill exit dimensions collapse using the default transition duration of 0.18s, which is slightly too slow for immediate feedback on deletion.

Verbatim code in `apps/frontend/dashboard/src/features/agent-inbox/components/email-pills-input.tsx`:

```tsx
								exit={
									shouldReduceMotion
										? { opacity: 0 }
										: {
												opacity: 0,
												scale: 0.8,
												width: 0,
												paddingLeft: 0,
												paddingRight: 0,
												marginLeft: 0,
												marginRight: 0,
												borderWidth: 0,
											}
								}
								transition={
									shouldReduceMotion
										? { duration: 0.1 }
										: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
								}
```

And on `motion.input`:

```tsx
				<motion.input
					layout={!shouldReduceMotion}
					transition={
						shouldReduceMotion
							? { duration: 0.1 }
							: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
					}
```

## Target

Override the layout transition to use a snappy spring (`stiffness: 600, damping: 48`), and speed up the entry/exit duration to `0.14s` with a custom cubic bezier (`[0.16, 1, 0.3, 1]`).

Target configuration:

```tsx
								transition={
									shouldReduceMotion
										? { duration: 0.1 }
										: {
												layout: { type: "spring", stiffness: 600, damping: 48 },
												opacity: { duration: 0.12, ease: "easeOut" },
												scale: { duration: 0.12, ease: "easeOut" },
												default: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
											}
								}
```

And target configuration for `motion.input`:

```tsx
				<motion.input
					layout={!shouldReduceMotion}
					transition={
						shouldReduceMotion
							? { duration: 0.1 }
							: {
									layout: { type: "spring", stiffness: 600, damping: 48 },
									default: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
								}
					}
```

## Repo conventions to follow

- Accessibility support: Use the `shouldReduceMotion` boolean to select between standard transitions and instant ones.
- Keep layout animations off if `prefers-reduced-motion` is enabled.

## Steps

1. In `apps/frontend/dashboard/src/features/agent-inbox/components/email-pills-input.tsx`:
   - Replace the `transition` prop in the `motion.div` mapping the emails.
   - Replace the `transition` prop in the `motion.input`.

## Boundaries

- Do NOT touch other components.
- Do NOT add new animation libraries.

## Verification

- **Mechanical**: Run `bun run --filter=fe-dashboard typecheck` to verify no typescript/build issues.
- **Feel check**:
  - Open the email compose modal.
  - Add multiple recipient email addresses.
  - Delete a recipient pill from the middle of the list.
  - Verify that the layout adjusts instantly (without lag or bounciness).
  - Verify that reducing system motion falls back to instant opacity changes.
