---
url: https://mediabunny.dev/api/VideoEncodingConfig
title: VideoEncodingConfig | Mediabunny
---

# VideoEncodingConfig | Mediabunny

# VideoEncodingConfig

Configuration object that controls video encoding. Can be used to set codec, quality, and more.

```
type VideoEncodingConfig = {
	codec: VideoCodec;
	bitrate: number | Quality;
	keyFrameInterval?: number;
	sizeChangeBehavior?: 'deny' | 'passThrough' | 'fill' | 'contain' | 'cover';
	onEncodedPacket?: (packet: EncodedPacket, meta: EncodedVideoChunkMetadata | undefined) => unknown;
	onEncoderConfig?: (config: VideoEncoderConfig) => unknown;
} & VideoEncodingAdditionalOptions;
```

See VideoCodec, Quality, EncodedPacket, and VideoEncodingAdditionalOptions.

## Used by

- new CanvasSource()
- new MediaStreamVideoTrackSource()
- new VideoSampleSource()

## Properties

### `codec`

The video codec that should be used for encoding the video samples (frames).

See VideoCodec.

### `bitrate`

The target bitrate for the encoded video, in bits per second. Alternatively, a subjective Quality can be provided.

See Quality.

### `keyFrameInterval`

The interval, in seconds, of how often frames are encoded as a key frame. The default is 5 seconds. Frequent key frames improve seeking behavior but increase file size. When using multiple video tracks, you should give them all the same key frame interval.

### `sizeChangeBehavior`

Video frames may change size over time. This field controls the behavior in case this happens.

- 'deny' (default) will throw an error, requiring all frames to have the exact same dimensions.
- 'passThrough' will allow the change and directly pass the frame to the encoder.
- 'fill' will stretch the image to fill the entire original box, potentially altering aspect ratio.
- 'contain' will contain the entire image within the original box while preserving aspect ratio. This may lead to letterboxing.
- 'cover' will scale the image until the entire original box is filled, while preserving aspect ratio.

The "original box" refers to the dimensions of the first encoded frame.

### `alpha`

What to do with alpha data contained in the video samples.

- 'discard' (default): Only the samples' color data is kept; the video is opaque.
- 'keep': The samples' alpha data is also encoded as side data. Make sure to pair this mode with a container format that supports transparency (such as WebM or Matroska).

### `bitrateMode`

Configures the bitrate mode.

### `latencyMode`

The latency mode used by the encoder; controls the performance-quality tradeoff.

### `fullCodecString`

The full codec string as specified in the WebCodecs Codec Registry. This string must match the codec specified in `codec`. When not set, a fitting codec string will be constructed automatically by the library.

### `hardwareAcceleration`

A hint that configures the hardware acceleration method of this codec. This is best left on 'no-preference'.

### `scalabilityMode`

An encoding scalability mode identifier as defined by WebRTC-SVC.

### `contentHint`

An encoding video content hint as defined by mst-content-hint.

## Events

### `onEncodedPacket`

Called for each successfully encoded packet. Both the packet and the encoding metadata are passed.

See EncodedPacket.

### `onEncoderConfig`

Called when the internal encoder config, as used by the WebCodecs API, is created.