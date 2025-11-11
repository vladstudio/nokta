---
url: https://mediabunny.dev/api/Conversion
title: Conversion | Mediabunny
---

# Conversion | Mediabunny

# Conversion

Represents a media file conversion process, used to convert one media file into another. In addition to conversion, this class can be used to resize and rotate video, resample audio, drop tracks, or trim to a specific time range.

## Static methods

### `init()`

Initializes a new conversion process without starting the conversion.

See ConversionOptions.

## Properties

### `discardedTracks`

The list of tracks from the input file that have been discarded, alongside the discard reason.

See DiscardedTrack.

### `input`

The input file.

See Input.

### `isValid`

Whether this conversion, as it has been configured, is valid and can be executed. If this field is `false`, check the `discardedTracks` field for reasons.

### `output`

The output file.

See Output.

### `utilizedTracks`

The list of tracks that are included in the output file.

See InputTrack.

## Events

### `onProgress`

A callback that is fired whenever the conversion progresses. Returns a number between 0 and 1, indicating the completion of the conversion. Note that a progress of 1 doesn't necessarily mean the conversion is complete; the conversion is complete once `execute()` resolves.

In order for progress to be computed, this property must be set before `execute` is called.

## Methods

### `execute()`

Executes the conversion process. Resolves once conversion is complete.

Will throw if `isValid` is `false`.

### `cancel()`

Cancels the conversion process. Does nothing if the conversion is already complete.