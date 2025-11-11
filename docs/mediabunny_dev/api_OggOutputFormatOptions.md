---
url: https://mediabunny.dev/api/OggOutputFormatOptions
title: OggOutputFormatOptions | Mediabunny
---

# OggOutputFormatOptions | Mediabunny

# OggOutputFormatOptions

Ogg-specific output options.

ts
```
type OggOutputFormatOptions = {
	onPage?: (data: Uint8Array, position: number, source: MediaSource) => unknown;
};
```

See MediaSource.

## Used by

- new OggOutputFormat()

## Events

### onPage

ts
```
onPage?: ((data: Uint8Array<ArrayBufferLike>, position: number, source: MediaSource) => unknown);
```

Will be called for each Ogg page that is written.

See MediaSource.