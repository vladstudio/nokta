---
url: https://mediabunny.dev/api/MkvOutputFormatOptions
title: MkvOutputFormatOptions | Mediabunny
---

# MkvOutputFormatOptions | Mediabunny

# MkvOutputFormatOptions

Matroska-specific output options.

```
type MkvOutputFormatOptions = {
	appendOnly?: boolean;
	minimumClusterDuration?: number;
	onEbmlHeader?: (data: Uint8Array, position: number) => void;
	onSegmentHeader?: (data: Uint8Array, position: number) => unknown;
	onCluster?: (data: Uint8Array, position: number, timestamp: number) => unknown;
};
```

## Used by

-   [`new MkvOutputFormat()`](#)
-   [`new WebMOutputFormat()`](#)
-   [`WebMOutputFormatOptions`](#)

## Properties

### `appendOnly`

```
appendOnly?: boolean;
```

Configures the output to only append new data at the end, useful for live-streaming the file as it's being created. When enabled, some features such as storing duration and seeking will be disabled or impacted, so don't use this option when you want to write out a clean file for later use.

### `minimumClusterDuration`

```
minimumClusterDuration?: number;
```

This field controls the minimum duration of each Matroska cluster, in seconds. New clusters will only be created when the current cluster is longer than this value. Defaults to 1 second.

## Events

### `onEbmlHeader`

```
onEbmlHeader?: ((data: Uint8Array<ArrayBufferLike>, position: number) => void);
```

Will be called once the EBML header of the output file has been written.

### `onSegmentHeader`

```
onSegmentHeader?: ((data: Uint8Array<ArrayBufferLike>, position: number) => unknown);
```

Will be called once the header part of the Matroska Segment element has been written. The header data includes the Segment element and everything inside it, up to (but excluding) the first Matroska Cluster.

### `onCluster`

```
onCluster?: ((data: Uint8Array<ArrayBufferLike>, position: number, timestamp: number) => unknown);
```

Will be called for each finalized Matroska Cluster of the output file.