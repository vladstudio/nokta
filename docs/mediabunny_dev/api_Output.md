---
url: https://mediabunny.dev/api/Output
title: Output | Mediabunny
---

# Output | Mediabunny

# Output

Main class orchestrating the creation of a new media file.

## Used by

*   [`Conversion.output`](./Conversion#output)
*   [`ConversionOptions.output`](./ConversionOptions#output)

## Type parameters

```
Output<
	F extends OutputFormat = OutputFormat,
	T extends Target = Target,
>
```

See [`OutputFormat`](./OutputFormat) and [`Target`](./Target).

## Constructor

```
constructor(
	options: OutputOptions<F, T>,
): Output;
```

Creates a new instance of `Output` which can then be used to create a new media file according to the specified [`OutputOptions`](./OutputOptions).

## Properties

### `format`

```
format: F;
```

The format of the output file.

### `state`

```
state: 'pending' | 'started' | 'canceled' | 'finalizing' | 'finalized';
```

The current state of the output.

### `target`

```
target: T;
```

The target to which the file will be written.

## Methods

### `addVideoTrack()`

```
addVideoTrack(
	source: VideoSource,
	metadata: VideoTrackMetadata = {},
): void;
```

Adds a video track to the output with the given source. Can only be called before the output is started.

See [`VideoSource`](./VideoSource) and [`VideoTrackMetadata`](./VideoTrackMetadata).

### `addAudioTrack()`

```
addAudioTrack(
	source: AudioSource,
	metadata: AudioTrackMetadata = {},
): void;
```

Adds an audio track to the output with the given source. Can only be called before the output is started.

See [`AudioSource`](./AudioSource) and [`AudioTrackMetadata`](./AudioTrackMetadata).

### `addSubtitleTrack()`

```
addSubtitleTrack(
	source: SubtitleSource,
	metadata: SubtitleTrackMetadata = {},
): void;
```

Adds a subtitle track to the output with the given source. Can only be called before the output is started.

See [`SubtitleSource`](./SubtitleSource) and [`SubtitleTrackMetadata`](./SubtitleTrackMetadata).

### `setMetadataTags()`

```
setMetadataTags(
	tags: MetadataTags,
): void;
```

Sets descriptive metadata tags about the media file, such as title, author, date, or cover art. When called multiple times, only the metadata from the last call will be used.

Can only be called before the output is started.

See [`MetadataTags`](./MetadataTags).

### `start()`

```
start(): Promise<void>;
```

Starts the creation of the output file. This method should be called after all tracks have been added. Only after the output has started can media samples be added to the tracks.

**Returns:** A promise that resolves when the output has successfully started and is ready to receive media samples.

### `getMimeType()`

```
getMimeType(): Promise<string>;
```

Resolves with the full MIME type of the output file, including track codecs.

The returned promise will resolve only once the precise codec strings of all tracks are known.

### `cancel()`

```
cancel(): Promise<void>;
```

Cancels the creation of the output file, releasing internal resources like encoders and preventing further samples from being added.

**Returns:** A promise that resolves once all internal resources have been released.

### `finalize()`

```
finalize(): Promise<void>;
```

Finalizes the output file. This method must be called after all media samples across all tracks have been added. Once the Promise returned by this method completes, the output file is ready.