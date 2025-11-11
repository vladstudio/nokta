---
url: https://mediabunny.dev/api/DiscardedTrack
title: DiscardedTrack | Mediabunny
---

# DiscardedTrack | Mediabunny

# DiscardedTrack

An input track that was discarded (excluded) from a Conversion alongside the discard reason.

```
type DiscardedTrack = {
	track: InputTrack;
	reason:
		| 'discarded_by_user'
		| 'max_track_count_reached'
		| 'max_track_count_of_type_reached'
		| 'unknown_source_codec'
		| 'undecodable_source_codec'
		| 'no_encodable_target_codec';
};
```

See InputTrack.

## Used by

- Conversion.discardedTracks

## Properties

### `track`

```
track: InputTrack;
```

The track that was discarded.

See InputTrack.

### `reason`

```
reason:
	| 'discarded_by_user'
	| 'max_track_count_reached'
	| 'max_track_count_of_type_reached'
	| 'unknown_source_codec'
	| 'undecodable_source_codec'
	| 'no_encodable_target_codec';
```

The reason for discarding the track.

- `'discarded_by_user'`: You discarded this track by setting `discard: true`.
- `'max_track_count_reached'`: The output had no more room for another track.
- `'max_track_count_of_type_reached'`: The output had no more room for another track of this type, or the output doesn't support this track type at all.
- `'unknown_source_codec'`: We don't know the codec of the input track and therefore don't know what to do with it.
- `'undecodable_source_codec'`: The input track's codec is known, but we are unable to decode it.
- `'no_encodable_target_codec'`: We can't find a codec that we are able to encode and that can be contained within the output format. This reason can be hit if the environment doesn't support the necessary encoders, or if you requested a codec that cannot be contained within the output format.