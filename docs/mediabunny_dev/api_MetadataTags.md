---
url: https://mediabunny.dev/api/MetadataTags
title: MetadataTags | Mediabunny
---

# MetadataTags | Mediabunny

# MetadataTags

Represents descriptive (non-technical) metadata about a media file, such as title, author, date, cover art, or other attached files. Common tags are normalized by Mediabunny into a uniform format, while the `raw` field can be used to directly read or write the underlying metadata tags (which differ by format).

-   For MP4/QuickTime files, the metadata refers to the data in `'moov'`\-level `'udta'` and `'meta'` atoms.
-   For WebM/Matroska files, the metadata refers to the Tags and Attachments elements whose target is 50 (MOVIE).
-   For MP3 files, the metadata refers to the ID3v2 or ID3v1 tags.
-   For Ogg files, there is no global metadata so instead, the metadata refers to the combined metadata of all tracks, in Vorbis-style comment headers.
-   For WAVE files, the metadata refers to the chunks within the RIFF INFO chunk.
-   For ADTS files, there is no metadata.
-   For FLAC files, the metadata lives in Vorbis style in the Vorbis comment block.

```typescript
type MetadataTags = {
	title?: string;
	description?: string;
	artist?: string;
	album?: string;
	albumArtist?: string;
	trackNumber?: number;
	tracksTotal?: number;
	discNumber?: number;
	discsTotal?: number;
	genre?: string;
	date?: Date;
	lyrics?: string;
	comment?: string;
	images?: AttachedImage[];
	raw?: Record<string, string | Uint8Array | RichImageData | AttachedFile | null>;
};
```

See [`AttachedImage`](./AttachedImage), [`RichImageData`](./RichImageData), and [`AttachedFile`](./AttachedFile).

## Used by

-   [`ConversionOptions.tags`](./ConversionOptions#tags)
-   [`Input.getMetadataTags()`](./Input#getmetadatatags)
-   [`Output.setMetadataTags()`](./Output#setmetadatatags)

## Properties

### `title`

```typescript
title?: string;
```

Title of the media (e.g. Gangnam Style, Titanic, etc.)

### `description`

```typescript
description?: string;
```

Short description or subtitle of the media.

### `artist`

```typescript
artist?: string;
```

Primary artist(s) or creator(s) of the work.

### `album`

```typescript
album?: string;
```

Album, collection, or compilation the media belongs to.

### `albumArtist`

```typescript
albumArtist?: string;
```

Main credited artist for the album/collection as a whole.

### `trackNumber`

```typescript
trackNumber?: number;
```

Position of this track within its album or collection (1-based).

### `tracksTotal`

```typescript
tracksTotal?: number;
```

Total number of tracks in the album or collection.

### `discNumber`

```typescript
discNumber?: number;
```

Disc index if the release spans multiple discs (1-based).

### `discsTotal`

```typescript
discsTotal?: number;
```

Total number of discs in the release.

### `genre`

```typescript
genre?: string;
```

Genre or category describing the media's style or content (e.g. Metal, Horror, etc.)

### `date`

```typescript
date?: Date;
```

Release, recording or creation date of the media.

### `lyrics`

```typescript
lyrics?: string;
```

Full text lyrics or transcript associated with the media.

### `comment`

```typescript
comment?: string;
```

Freeform notes, remarks or commentary about the media.

### `images`

```typescript
images?: AttachedImage[];
```

Embedded images such as cover art, booklet scans, artwork or preview frames.

See [`AttachedImage`](./AttachedImage).

### `raw`

```typescript
raw?: Record<string, string | Uint8Array<ArrayBufferLike> | RichImageData | AttachedFile | null>;
```

The raw, underlying metadata tags.

This field can be used for both reading and writing. When reading, it represents the original tags that were used to derive the normalized fields, and any additional metadata that Mediabunny doesn't understand. When writing, it can be used to set arbitrary metadata tags in the output file.

The format of these tags differs per format:

-   MP4/QuickTime: By default, the keys refer to the names of the individual atoms in the `'ilst'` atom inside the `'meta'` atom, and the values are derived from the content of the `'data'` atom inside them. When a `'keys'` atom is also used, then the keys reflect the keys specified there (such as `'com.apple.quicktime.version'`). Additionally, any atoms within the `'udta'` atom are dumped into here, however with unknown internal format (`Uint8Array`).
-   WebM/Matroska: `SimpleTag` elements whose target is 50 (MOVIE), either containing string or `Uint8Array` values. Additionally, all attached files (such as font files) are included here, where the key corresponds to the FileUID and the value is an [`AttachedFile`](./AttachedFile).
-   MP3: The ID3v2 tags, or a single `'TAG'` key with the contents of the ID3v1 tag.
-   Ogg: The key-value string pairs from the Vorbis-style comment header (see RFC 7845, Section 5.2). Additionally, the `'vendor'` key refers to the vendor string within this header.
-   WAVE: The individual metadata chunks within the RIFF INFO chunk. Values are always ISO 8859-1 strings.
-   FLAC: The key-value string pairs from the vorbis metadata block (see RFC 9639, Section D.2.3). Additionally, the `'vendor'` key refers to the vendor string within this header.

See [`RichImageData`](./RichImageData) and [`AttachedFile`](./AttachedFile).