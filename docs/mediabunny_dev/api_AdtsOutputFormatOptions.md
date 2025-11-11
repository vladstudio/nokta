---
url: https://mediabunny.dev/api/AdtsOutputFormatOptions
title: AdtsOutputFormatOptions | Mediabunny
---

# AdtsOutputFormatOptions | Mediabunny

# AdtsOutputFormatOptions

ADTS-specific output options.

```
type AdtsOutputFormatOptions = {
	onFrame?: (data: Uint8Array, position: number) => unknown;
};
```

## Used by

-   [`new AdtsOutputFormat()`](./AdtsOutputFormat#constructor)

## Events

### `onFrame`

```
onFrame?: ((data: Uint8Array<ArrayBufferLike>, position: number) => unknown);
```

Will be called for each ADTS frame that is written.