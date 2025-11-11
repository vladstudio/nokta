---
url: https://mediabunny.dev/api/ConversionOptions
title: ConversionOptions | Mediabunny
---

# ConversionOptions | Mediabunny

# ConversionOptions

The options for media file conversion.

```ts
type ConversionOptions = {
	input: Input;
	output: Output;
	video?: ConversionVideoOptions
		| ((track: InputVideoTrack, n: number) => MaybePromise<ConversionVideoOptions | undefined>);
	audio?: ConversionAudioOptions
		| ((track: InputAudioTrack, n: number) => MaybePromise<ConversionAudioOptions | undefined>);
	trim?: {
		start: number;
		end: number;
	};
	tags?: MetadataTags | ((inputTags: MetadataTags) => MaybePromise<MetadataTags>);
	showWarnings?: boolean;
};
```

See [`Input`](./Input), [`Output`](./Output), [`ConversionVideoOptions`](./ConversionVideoOptions), [`InputVideoTrack`](./InputVideoTrack), [`MaybePromise`](./MaybePromise), [`ConversionAudioOptions`](./ConversionAudioOptions), [`InputAudioTrack`](./InputAudioTrack), and [`MetadataTags`](./MetadataTags).

## Used by

- [`Conversion.init()`](./Conversion#init)

## Properties

### `input`

```ts
input: Input;
```

The input file.

See [`Input`](./Input).

### `output`

```ts
output: Output;
```

The output file.

See [`Output`](./Output).

### `video`

```ts
video?: ConversionVideoOptions | ((track: InputVideoTrack, n: number) => MaybePromise<ConversionVideoOptions | undefined>);
```

Video-specific options. When passing an object, the same options are applied to all video tracks. When passing a function, it will be invoked for each video track and is expected to return or resolve to the options for that specific track. The function is passed an instance of [`InputVideoTrack`](./InputVideoTrack) as well as a number `n`, which is the 1-based index of the track in the list of all video tracks.

See [`ConversionVideoOptions`](./ConversionVideoOptions), [`InputVideoTrack`](./InputVideoTrack), and [`MaybePromise`](./MaybePromise).

### `audio`

```ts
audio?: ConversionAudioOptions | ((track: InputAudioTrack, n: number) => MaybePromise<ConversionAudioOptions | undefined>);
```

Audio-specific options. When passing an object, the same options are applied to all audio tracks. When passing a function, it will be invoked for each audio track and is expected to return or resolve to the options for that specific track. The function is passed an instance of [`InputAudioTrack`](./InputAudioTrack) as well as a number `n`, which is the 1-based index of the track in the list of all audio tracks.

See [`ConversionAudioOptions`](./ConversionAudioOptions), [`InputAudioTrack`](./InputAudioTrack), and [`MaybePromise`](./MaybePromise).

### `trim`

```ts
trim?: { start: number; end: number; };
```

Options to trim the input file.

### `tags`

```ts
tags?: MetadataTags | ((inputTags: MetadataTags) => MaybePromise<MetadataTags>);
```

An object or a callback that returns or resolves to an object containing the descriptive metadata tags that should be written to the output file. If a function is passed, it will be passed the tags of the input file as its first argument, allowing you to modify, augment or extend them.

If no function is set, the input's metadata tags will be copied to the output.

See [`MetadataTags`](./MetadataTags) and [`MaybePromise`](./MaybePromise).

### `showWarnings`

```ts
showWarnings?: boolean;
```

Whether to show potential console warnings about discarded tracks after calling `Conversion.init()`, defaults to `true`. Set this to `false` if you're properly handling the `discardedTracks` and `isValid` fields already and want to keep the console output clean.