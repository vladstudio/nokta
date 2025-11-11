---
url: https://mediabunny.dev/api/InputFormat
title: InputFormat | Mediabunny
---

# InputFormat | Mediabunny

# InputFormat

Base class representing an input media file format.

## Subclasses

-   [`AdtsInputFormat`](#)
-   [`IsobmffInputFormat`](#)
    -   [`Mp4InputFormat`](#)
    -   [`QuickTimeInputFormat`](#)
-   [`MatroskaInputFormat`](#)
    -   [`WebMInputFormat`](#)
-   [`Mp3InputFormat`](#)
-   [`OggInputFormat`](#)
-   [`WaveInputFormat`](#)
-   [`FlacInputFormat`](#)

## Used by

-   [`Input.getFormat()`](#)
-   [`InputOptions.formats`](#)

## Properties

### `mimeType`

ts
```
get mimeType(): string;
```

Returns the typical base MIME type of the input format.

### `name`

ts
```
get name(): string;
```

Returns the name of the input format.