---
url: https://mediabunny.dev/api/FilePathTarget
title: FilePathTarget | Mediabunny
---

# FilePathTarget | Mediabunny

# FilePathTarget

A target that writes to a file at the specified path. Intended for server-side usage in Node, Bun, or Deno.

Writing is chunked by default. The internally held file handle will be closed when `.finalize()` or `.cancel()` are called on the corresponding Output.

**Extends:** [`Target`](./Target)

## Constructor

ts
```
constructor(
	filePath: string,
	options: FilePathTargetOptions = {},
): FilePathTarget;
```

Creates a new `FilePathTarget` that writes to the file at the specified file path.

See [`FilePathTargetOptions`](./FilePathTargetOptions).

## Events

### `onwrite`

ts
```
onwrite: ((start: number, end: number) => unknown) | null;
```

Called each time data is written to the target. Will be called with the byte range into which data was written.

Use this callback to track the size of the output file as it grows. But be warned, this function is chatty and gets called *extremely* often.