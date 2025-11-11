---
url: https://mediabunny.dev/api/NullTarget
title: NullTarget | Mediabunny
---

# NullTarget | Mediabunny

# NullTarget

This target just discards all incoming data. It is useful for when you need an Output but extract data from it differently, for example through format-specific callbacks (`onMoof`, `onMdat`, ...) or encoder events.

**Extends:** Target

## Events

### `onwrite`

ts
```
onwrite: ((start: number, end: number) => unknown) | null;
```

Called each time data is written to the target. Will be called with the byte range into which data was written.

Use this callback to track the size of the output file as it grows. But be warned, this function is chatty and gets called *extremely* often.