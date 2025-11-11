---
url: https://mediabunny.dev/api/SubtitleSource
title: SubtitleSource | Mediabunny
---

# SubtitleSource | Mediabunny

# SubtitleSource

Base class for subtitle sources - sources for subtitle tracks.

**Extends:** [`MediaSource`](./MediaSource)

## Subclasses

-   [`TextSubtitleSource`](./TextSubtitleSource)

## Used by

-   [`Output.addSubtitleTrack()`](./Output#addsubtitletrack)

## Methods

### `close()`

ts
```
close(): void;
```

Closes this source. This prevents future samples from being added and signals to the output file that no further samples will come in for this track. Calling `.close()` is optional but recommended after adding the last sample - for improved performance and reduced memory usage.