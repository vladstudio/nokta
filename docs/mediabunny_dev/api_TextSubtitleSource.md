---
url: https://mediabunny.dev/api/TextSubtitleSource
title: TextSubtitleSource | Mediabunny
---

# TextSubtitleSource | Mediabunny

# TextSubtitleSource

This source can be used to add subtitles from a subtitle text file.

**Extends:** `SubtitleSource`

## Constructor

Creates a new `TextSubtitleSource` where added text chunks are in the specified `codec`.

See `SubtitleCodec`.

## Methods

### `add()`

Parses the subtitle text according to the specified codec and adds it to the output track. You don't have to add the entire subtitle file at once here; you can provide it in chunks.

**Returns:** A Promise that resolves once the output is ready to receive more samples. You should await this Promise to respect writer and encoder backpressure.