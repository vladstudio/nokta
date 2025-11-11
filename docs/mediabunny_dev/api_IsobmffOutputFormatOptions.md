---
url: https://mediabunny.dev/api/IsobmffOutputFormatOptions
title: IsobmffOutputFormatOptions | Mediabunny
---

# IsobmffOutputFormatOptions | Mediabunny

# IsobmffOutputFormatOptions

ISOBMFF-specific output options.

ts
```
type IsobmffOutputFormatOptions = {
	fastStart?: false | 'in-memory' | 'reserve' | 'fragmented';
	minimumFragmentDuration?: number;
	metadataFormat?: 'auto' | 'mdir' | 'mdta' | 'udta';
	onFtyp?: (data: Uint8Array, position: number) => unknown;
	onMoov?: (data: Uint8Array, position: number) => unknown;
	onMdat?: (data: Uint8Array, position: number) => unknown;
	onMoof?: (data: Uint8Array, position: number, timestamp: number) => unknown;
};
```

## Used by

-   `new MovOutputFormat()`
-   `new Mp4OutputFormat()`

## Properties

### `fastStart`

ts
```
fastStart?: false | 'in-memory' | 'reserve' | 'fragmented';
```

Controls the placement of metadata in the file. Placing metadata at the start of the file is known as "Fast Start", which results in better playback at the cost of more required processing or memory.

Use `false` to disable Fast Start, placing the metadata at the end of the file. Fastest and uses the least memory.

Use `'in-memory'` to produce a file with Fast Start by keeping all media chunks in memory until the file is finalized. This produces a high-quality and compact output at the cost of a more expensive finalization step and higher memory requirements. Data will be written monotonically (in order) when this option is set.

Use `'reserve'` to reserve space at the start of the file into which the metadata will be written later. This produces a file with Fast Start but requires knowledge about the expected length of the file beforehand. When using this option, you must set the `maximumPacketCount` field in the track metadata for all tracks.

Use `'fragmented'` to place metadata at the start of the file by creating a fragmented file (fMP4). In a fragmented file, chunks of media and their metadata are written to the file in "fragments", eliminating the need to put all metadata in one place. Fragmented files are useful for streaming contexts, as each fragment can be played individually without requiring knowledge of the other fragments. Furthermore, they remain lightweight to create even for very large files, as they don't require all media to be kept in memory. However, fragmented files are not as widely and wholly supported as regular MP4/MOV files. Data will be written monotonically (in order) when this option is set.

When this field is not defined, either `false` or `'in-memory'` will be used, automatically determined based on the type of output target used.

### `minimumFragmentDuration`

ts
```
minimumFragmentDuration?: number;
```

When using `fastStart: 'fragmented'`, this field controls the minimum duration of each fragment, in seconds. New fragments will only be created when the current fragment is longer than this value. Defaults to 1 second.

### `metadataFormat`

ts
```
metadataFormat?: 'auto' | 'mdir' | 'mdta' | 'udta';
```

The metadata format to use for writing metadata tags.

-   `'auto'` (default): Behaves like `'mdir'` for MP4 and like `'udta'` for QuickTime, matching FFmpeg's default behavior.
-   `'mdir'`: Write tags into `moov/udta/meta` using the 'mdir' handler format.
-   `'mdta'`: Write tags into `moov/udta/meta` using the 'mdta' handler format, equivalent to FFmpeg's `use_metadata_tags` flag. This allows for custom keys of arbitrary length.
-   `'udta'`: Write tags directly into `moov/udta`.

## Events

### `onFtyp`

ts
```
onFtyp?: ((data: Uint8Array<ArrayBufferLike>, position: number) => unknown);
```

Will be called once the ftyp (File Type) box of the output file has been written.

### `onMoov`

ts
```
onMoov?: ((data: Uint8Array<ArrayBufferLike>, position: number) => unknown);
```

Will be called once the moov (Movie) box of the output file has been written.

### `onMdat`

ts
```
onMdat?: ((data: Uint8Array<ArrayBufferLike>, position: number) => unknown);
```

Will be called for each finalized mdat (Media Data) box of the output file. Usage of this callback is not recommended when not using `fastStart: 'fragmented'`, as there will be one monolithic mdat box which might require large amounts of memory.

### `onMoof`

ts
```
onMoof?: ((data: Uint8Array<ArrayBufferLike>, position: number, timestamp: number) => unknown);
```

Will be called for each finalized moof (Movie Fragment) box of the output file.