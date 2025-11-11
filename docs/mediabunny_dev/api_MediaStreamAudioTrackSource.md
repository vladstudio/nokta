---
url: https://mediabunny.dev/api/MediaStreamAudioTrackSource
title: MediaStreamAudioTrackSource | Mediabunny
---

# MediaStreamAudioTrackSource | Mediabunny

# MediaStreamAudioTrackSource

Audio source that encodes the data of a [`MediaStreamAudioTrack`](#) and pipes it into the output. This is useful for capturing live or real-time audio such as microphones or audio from other media elements. Audio will automatically start being captured once the connected [`Output`](#) is started, and will keep being captured until the [`Output`](#) is finalized or this source is closed.

**Extends:** [`AudioSource`](#)

## Constructor

Creates a new `MediaStreamAudioTrackSource` from a `MediaStreamAudioTrack`, which will pull audio samples from the stream in real time and encode them according to [`AudioEncodingConfig`](#).

## Properties

### `errorPromise`

A promise that rejects upon any error within this source. This promise never resolves.