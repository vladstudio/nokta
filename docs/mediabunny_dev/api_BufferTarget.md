---
url: https://mediabunny.dev/api/BufferTarget
title: BufferTarget | Mediabunny
---

# BufferTarget | Mediabunny

# BufferTarget

A target that writes data directly into an ArrayBuffer in memory. Great for performance, but not suitable for very large files. The buffer will be available once the output has been finalized.

**Extends:** `Target`

## Properties

### `buffer`

Stores the final output buffer. Until the output is finalized, this will be `null`.

## Events

### `onwrite`

Called each time data is written to the target. Will be called with the byte range into which data was written.

Use this callback to track the size of the output file as it grows. But be warned, this function is chatty and gets called *extremely* often.