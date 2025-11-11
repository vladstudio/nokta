---
url: https://mediabunny.dev/api/TrackCountLimits
title: TrackCountLimits | Mediabunny
---

# TrackCountLimits | Mediabunny

# TrackCountLimits [​](#trackcountlimits)

Specifies the number of tracks (for each track type and in total) that an output format supports.

ts
```
type TrackCountLimits = {
	[K in TrackType]: InclusiveIntegerRange;
} & {
	total: InclusiveIntegerRange;
};
```

See [`TrackType`](./TrackType) and [`InclusiveIntegerRange`](./InclusiveIntegerRange).


## Used by [​](#used-by)

-   [`AdtsOutputFormat.getSupportedTrackCounts()`](./AdtsOutputFormat#getsupportedtrackcounts)
-   [`FlacOutputFormat.getSupportedTrackCounts()`](./FlacOutputFormat#getsupportedtrackcounts)
-   [`IsobmffOutputFormat.getSupportedTrackCounts()`](./IsobmffOutputFormat#getsupportedtrackcounts)
-   [`MkvOutputFormat.getSupportedTrackCounts()`](./MkvOutputFormat#getsupportedtrackcounts)
-   [`MovOutputFormat.getSupportedTrackCounts()`](./MovOutputFormat#getsupportedtrackcounts)
-   [`Mp3OutputFormat.getSupportedTrackCounts()`](./Mp3OutputFormat#getsupportedtrackcounts)
-   [`Mp4OutputFormat.getSupportedTrackCounts()`](./Mp4OutputFormat#getsupportedtrackcounts)
-   [`OggOutputFormat.getSupportedTrackCounts()`](./OggOutputFormat#getsupportedtrackcounts)
-   [`OutputFormat.getSupportedTrackCounts()`](./OutputFormat#getsupportedtrackcounts)
-   [`WavOutputFormat.getSupportedTrackCounts()`](./WavOutputFormat#getsupportedtrackcounts)
-   [`WebMOutputFormat.getSupportedTrackCounts()`](./WebMOutputFormat#getsupportedtrackcounts)


## Properties [​](#properties)


### `video` [​](#video)

ts
```
video: InclusiveIntegerRange;
```

See [`InclusiveIntegerRange`](./InclusiveIntegerRange).


### `audio` [​](#audio)

ts
```
audio: InclusiveIntegerRange;
```

See [`InclusiveIntegerRange`](./InclusiveIntegerRange).


### `subtitle` [​](#subtitle)

ts
```
subtitle: InclusiveIntegerRange;
```

See [`InclusiveIntegerRange`](./InclusiveIntegerRange).


### `total` [​](#total)

ts
```
total: InclusiveIntegerRange;
```

Specifies the overall allowed range of track counts for the output format.

See [`InclusiveIntegerRange`](./InclusiveIntegerRange).