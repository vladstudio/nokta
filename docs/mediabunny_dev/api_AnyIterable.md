---
url: https://mediabunny.dev/api/AnyIterable
title: AnyIterable | Mediabunny
---

# AnyIterable | Mediabunny

# AnyIterable

Sync or async iterable.

ts
```
type AnyIterable<T> = | Iterable<T>
	| AsyncIterable<T>;
```

## Used by

-   AudioBufferSink.buffersAtTimestamps()
-   AudioSampleSink.samplesAtTimestamps()
-   CanvasSink.canvasesAtTimestamps()
-   VideoSampleSink.samplesAtTimestamps()