---
url: https://mediabunny.dev/api/Target
title: Target | Mediabunny
---

# Target | Mediabunny

# Target

Base class for targets, specifying where output files are written.

## Subclasses

-   BufferTarget
-   FilePathTarget
-   NullTarget
-   StreamTarget

## Used by

-   Output
-   OutputOptions

## Events

### onwrite

Called each time data is written to the target. Will be called with the byte range into which data was written.

Use this callback to track the size of the output file as it grows. But be warned, this function is chatty and gets called *extremely* often.