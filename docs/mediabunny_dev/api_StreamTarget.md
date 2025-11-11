---
url: https://mediabunny.dev/api/StreamTarget
title: StreamTarget | Mediabunny
---

# StreamTarget | Mediabunny

# StreamTarget

This target writes data to a WritableStream, making it a general-purpose target for writing data anywhere. It is also compatible with FileSystemWritableFileStream for use with the File System Access API. The WritableStream can also apply backpressure, which will propagate to the output and throttle the encoders.

**Extends:** Target

## Constructor

Creates a new StreamTarget which writes to the specified writable.

See StreamTargetChunk and StreamTargetOptions.

## Events

### `onwrite`

Called each time data is written to the target. Will be called with the byte range into which data was written.

Use this callback to track the size of the output file as it grows. But be warned, this function is chatty and gets called *extremely* often.