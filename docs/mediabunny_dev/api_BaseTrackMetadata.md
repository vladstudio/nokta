---
url: https://mediabunny.dev/api/BaseTrackMetadata
title: BaseTrackMetadata | Mediabunny
---

# BaseTrackMetadata | Mediabunny

# BaseTrackMetadata

Base track metadata, applicable to all tracks.

```typescript
type BaseTrackMetadata = {
	languageCode?: string;
	name?: string;
	maximumPacketCount?: number;
};
```

## Used by

-   AudioTrackMetadata
-   SubtitleTrackMetadata
-   VideoTrackMetadata

## Properties

### `languageCode`

The three-letter, ISO 639-2/T language code specifying the language of this track.

```typescript
languageCode?: string;
```

### `name`

A user-defined name for this track, like "English" or "Director Commentary".

```typescript
name?: string;
```

### `maximumPacketCount`

The maximum amount of encoded packets that will be added to this track. Setting this field provides the muxer with an additional signal that it can use to preallocate space in the file.

When this field is set, it is an error to provide more packets than whatever this field specifies.

Predicting the maximum packet count requires considering both the maximum duration as well as the codec.

-   For video codecs, you can assume one packet per frame.
-   For audio codecs, there is one packet for each "audio chunk", the duration of which depends on the codec. For simplicity, you can assume each packet is roughly 10 ms or 512 samples long, whichever is shorter.
-   For subtitles, assume each cue and each gap in the subtitles adds a packet.

If you're not fully sure, make sure to add a buffer of around 33% to make sure you stay below the maximum.

```typescript
maximumPacketCount?: number;
```