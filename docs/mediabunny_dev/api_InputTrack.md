---
url: https://mediabunny.dev/api/InputTrack
title: InputTrack | Mediabunny
---

# InputTrack | Mediabunny

# InputTrack

Represents a media track in an input file.

## Subclasses

-   InputVideoTrack
-   InputAudioTrack

## Used by

-   Conversion.utilizedTracks
-   DiscardedTrack.track
-   Input.getTracks()
-   new EncodedPacketSink()

## Properties

### `codec`

The codec of the track's packets.

See MediaCodec.

### `id`

The unique ID of this track in the input file.

### `input`

The input file this track belongs to.

See Input.

### `internalCodecId`

The identifier of the codec used internally by the container. It is not homogenized by Mediabunny and depends entirely on the container format.

This field can be used to determine the codec of a track in case Mediabunny doesn't know that codec.

-   For ISOBMFF files, this field returns the name of the Sample Description Box (e.g. `'avc1'`).
-   For Matroska files, this field returns the value of the `CodecID` element.
-   For WAVE files, this field returns the value of the format tag in the `'fmt '` chunk.
-   For ADTS files, this field contains the `MPEG-4 Audio Object Type`.
-   In all other cases, this field is `null`.

### `languageCode`

The ISO 639-2/T language code for this track. If the language is unknown, this field is `'und'` (undetermined).

### `name`

A user-defined name for this track.

### `timeResolution`

A positive number x such that all timestamps and durations of all packets of this track are integer multiples of 1/x.

### `type`

The type of the track.

See TrackType.

## Methods

### `getCodecParameterString()`

Returns the full codec parameter string for this track.

### `canDecode()`

Checks if this track's packets can be decoded by the browser.

### `determinePacketType()`

For a given packet of this track, this method determines the actual type of this packet (key/delta) by looking into its bitstream. Returns null if the type couldn't be determined.

See EncodedPacket and PacketType.

### `isVideoTrack()`

Returns true if and only if this track is a video track.

### `isAudioTrack()`

Returns true if and only if this track is an audio track.

### `getFirstTimestamp()`

Returns the start timestamp of the first packet of this track, in seconds. While often near zero, this value may be positive or even negative. A negative starting timestamp means the track's timing has been offset. Samples with a negative timestamp should not be presented.

### `computeDuration()`

Returns the end timestamp of the last packet of this track, in seconds.

### `computePacketStats()`

Computes aggregate packet statistics for this track, such as average packet rate or bitrate.

**Parameters:**

-   **targetPacketCount**: This optional parameter sets a target for how many packets this method must have looked at before it can return early; this means, you can use it to aggregate only a subset (prefix) of all packets. This is very useful for getting a great estimate of video frame rate without having to scan through the entire file.

See PacketStats.