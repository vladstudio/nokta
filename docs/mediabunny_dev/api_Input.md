---
url: https://mediabunny.dev/api/Input
title: Input | Mediabunny
---

# Input | Mediabunny

# Input

Represents an input media file. This is the root object from which all media read operations start.

**Implements:** `Disposable`

## Used by

- Conversion.input
- ConversionOptions.input
- InputAudioTrack.input
- InputTrack.input
- InputVideoTrack.input

## Type parameters

ts
```
Input<
	S extends Source = Source,
>
```

See Source.

## Constructor

ts
```
constructor(
	options: InputOptions<S>,
): Input;
```

Creates a new input file from the specified options. No reading operations will be performed until methods are called on this instance.

See InputOptions.

## Properties

### `disposed`

ts
```
get disposed(): boolean;
```

True if the input has been disposed.

### `source`

ts
```
get source(): S;
```

Returns the source from which this input file reads its data. This is the same source that was passed to the constructor.

## Methods

### `getFormat()`

ts
```
getFormat(): Promise<InputFormat>;
```

Returns the format of the input file. You can compare this result directly to the InputFormat singletons or use `instanceof` checks for subset-aware logic (for example, `format instanceof MatroskaInputFormat` is true for both MKV and WebM).

### `computeDuration()`

ts
```
computeDuration(): Promise<number>;
```

Computes the duration of the input file, in seconds. More precisely, returns the largest end timestamp among all tracks.

### `getTracks()`

ts
```
getTracks(): Promise<InputTrack[]>;
```

Returns the list of all tracks of this input file.

See InputTrack.

### `getVideoTracks()`

ts
```
getVideoTracks(): Promise<InputVideoTrack[]>;
```

Returns the list of all video tracks of this input file.

See InputVideoTrack.

### `getAudioTracks()`

ts
```
getAudioTracks(): Promise<InputAudioTrack[]>;
```

Returns the list of all audio tracks of this input file.

See InputAudioTrack.

### `getPrimaryVideoTrack()`

ts
```
getPrimaryVideoTrack(): Promise<InputVideoTrack | null>;
```

Returns the primary video track of this input file, or null if there are no video tracks.

See InputVideoTrack.

### `getPrimaryAudioTrack()`

ts
```
getPrimaryAudioTrack(): Promise<InputAudioTrack | null>;
```

Returns the primary audio track of this input file, or null if there are no audio tracks.

See InputAudioTrack.

### `getMimeType()`

ts
```
getMimeType(): Promise<string>;
```

Returns the full MIME type of this input file, including track codecs.

### `getMetadataTags()`

ts
```
getMetadataTags(): Promise<MetadataTags>;
```

Returns descriptive metadata tags about the media file, such as title, author, date, cover art, or other attached files.

See MetadataTags.

### `dispose()`

ts
```
dispose(): void;
```

Disposes this input and frees connected resources. When an input is disposed, ongoing read operations will be canceled, all future read operations will fail, any open decoders will be closed, and all ongoing media sink operations will be canceled. Disallowed and canceled operations will throw an InputDisposedError.

You are expected not to use an input after disposing it. While some operations may still work, it is not specified and may change in any future update.

### `[Symbol.dispose]()`

ts
```
[Symbol.dispose](): void;
```

Calls `.dispose()` on the input, implementing the `Disposable` interface for use with JavaScript Explicit Resource Management features.