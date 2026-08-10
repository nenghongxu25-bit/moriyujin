# Bug Log

## 2026-08-10 - Player Spine animation stuck on idle

### Symptom
- Moving the player requested `walk` / `run`, but the Spine node stayed on `idle`.
- Logs showed `request walk`, yet the real animation never switched.

### Root Cause
- `PlayerAnimationController` treated `templet.readyState > 0` as the only condition for animation playback.
- Runtime evidence showed the Spine node was already bound and `source` / `templet` were available, but `readyState` remained `0`.
- As a result, `sync()` exited early through the `not_ready` path and never called `play()`, so movement requests were blocked and the actual playback stayed on `idle`.

### Fix
- Relaxed `isReady()`.
- Playback is no longer gated by `readyState > 0` alone.
- If the Spine node is bound and `templet` or `source` exists, the controller may attempt to play the requested animation.

### Lesson
- In this project/runtime, `readyState` is not a reliable sole readiness check.
- Do not use it as the only condition for Spine animation playback.