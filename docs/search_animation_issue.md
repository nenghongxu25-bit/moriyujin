# Search Animation Jitter

## Problem
The player had a visible snap when transitioning between non-loop Spine animation segments, especially in `search`:
- `search_start -> search_loop`
- `search_loop -> search_end`
- `search_end -> idle`

The logs showed that the final action segment finished, then locomotion switched on the next update, which left a visible gap at the pose boundary.

## Cause
The sequence was being advanced by a time-based step flow. When a non-loop segment finished, the controller waited for the next update tick before switching to the next animation. That created a one-frame pose reset / snap.

## Fix
- Switched the `search` chain to event-driven progression.
- Used the Spine/Laya stopped signal to advance to the next segment immediately when the current segment naturally ended.
- On sequence completion, the controller now plays the fallback locomotion animation directly instead of waiting for the next `sync()` pass.

## Result
The `search` sequence no longer visibly jitters at segment boundaries.