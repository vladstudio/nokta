---
url: https://docs.daily.co/reference/daily-react
title: Using the daily-react library
---

# Using the daily-react library

# Daily React

Daily React is a helper library for handling common patterns when building custom Daily applications in React. It makes it easier to manage state and integrate daily-js methods and events in any React app.

While it is not required to use `daily-react` when building with Daily and React, it is strongly recommended. We use the library internally: Daily Prebuilt, our ready-to-use embeddable video chat interface, uses `daily-react`. We've tested the library extensively, and it is our preferred way to handle Daily events.

## Using `daily-react`

### Install the library

Install Daily React from the npm public registry.

```

1

npm install @daily-co/daily-react @daily-co/daily-js jotai

2

```

The reason for installing `@daily-co/daily-js` and `jotai` separately is that they are peer dependencies. This ensures that if you want to use either `jotai` or `daily-js` in addition to `daily-react`, such as to create your own call object, both your manual usage and `daily-react` will utilize the same version of each library.

## `DailyProvider` component

`DailyProvider` is a component which gives every other component in your application access to the Daily call object.

## Available components

-   `DailyAudio`
-   `DailyAudioTrack`
-   `DailyVideo`

## Available hooks

-   `useActiveParticipant`
-   `useActiveSpeakerId`
-   `useAppMessage`
-   `useAudioLevel`
-   `useAudioLevelObserver`
-   `useCPULoad`
-   `useCallFrame`
-   `useCallObject`
-   `useDaily`
-   `useDailyError`
-   `useDailyEvent`
-   `useDevices`
-   `useInputSettings`
-   `useLiveStreaming`
-   `useLocalParticipant`
-   `useLocalSessionId`
-   `useMediaTrack`
-   `useMeetingSessionState`
-   `useMeetingState`
-   `useNetwork`
-   `useParticipant`
-   `useParticipantCounts`
-   `useParticipantIds`
-   `useParticipantProperty`
-   `usePermissions`
-   `useReceiveSettings`
-   `useRecording`
-   `useRoom`
-   `useRoomExp`
-   `useScreenShare`
-   `useSendSettings`
-   `useThrottledDailyEvent`
-   `useTranscription`
-   `useWaitingParticipants`

---

---
url: https://docs.daily.co/reference/daily-react/daily-provider
title: Daily Provider
---

# Daily Provider

# DailyProvider

The `DailyProvider` gives every component in your application access to the Daily [call object](/guides/products/call-object). It stores call state and initiates a call object instance.

This component allows for two modes: It can take either an existing call object or props to instantiate its own callObject instance.

We recommend utilizing [`useCallObject`](/reference/daily-react/use-call-object) to create your own call object instance.

## Props

In existing call object mode:

| Parameter | Required | Type | Description |
| :-- | :-- | :-- | :-- |
| `callObject` | ✓ | `Object` | Pre-initialized call object instance (instantiated via [`createCallObject()`](/reference/daily-js/factory-methods/create-call-object)) |

In call object creation mode:

| Parameter | Required | Type |
| :-- | :-- | :-- |
| `url` | ✓ | `string` |
| `audioSource` |  | `string | MediaStreamTrack | boolean` |
| `videoSource` |  | `string | MediaStreamTrack | boolean` |
| `dailyConfig` |  | `Object` |
| `receiveSettings` |  | `Object` |
| `subscribeToTracksAutomatically` |  | `boolean` |
| `token` |  | `string` |
| `userName` |  | `string` |

For full details on all the properties above, see the [properties list](/reference/daily-js/daily-call-client/properties).

Changing any of the props in call object creation mode will destroy the current instance and create a new one with the updated props.

### Optional props

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `jotaiStore` | `Object` | `store` to be passed to Daily React's internal Jotai `<Provider>`. If you use Jotai in your app, this will store Daily React's internal state atoms in your Jotai store. |

## Sample code

JSX

```

1

import { DailyProvider, useCallObject } from '@daily-co/daily-react';

2

3

function App() {

4

  // Create an instance of the Daily call object

5

  const callObject = useCallObject();

6

7

  return <DailyProvider callObject={callObject}>{children}</DailyProvider>;

8

}

9

```

### Store Daily React's state in your own Jotai Provider

JSX

```

1

import { DailyProvider, useCallObject } from '@daily-co/daily-react';

2

import { createStore, Provider } from 'jotai';

3

4

const jotaiStore = createStore();

5

6

function App() {

7

  // Create an instance of the Daily call object

6

  const callObject = useCallObject();

7

8

  return (

9

    <Provider store={jotaiStore}>

10

      <DailyProvider callObject={callObject} jotaiStore={jotaiStore}>

11

        {children}

12

      </DailyProvider>

13

    </Provider>

14

  );

15

}

16

```

* * *

Previous

[Next](/reference/daily-react/daily-audio)

---

---
url: https://docs.daily.co/reference/daily-react/daily-audio
title: Daily Audio
---

# Daily Audio

# DailyAudio

The `DailyAudio` component manages audio for a Daily call in your React app. With default settings it will play any remote `audio` and `screenAudio` tracks, while maintaining up to 5 speaker slots. In case one of the `<audio>` tags fails to play, `DailyAudio` will call `onPlayFailed` with detailed information and a reference to the `<audio>` tag for which the `play()` failed.

`DailyAudio` is meant to be a plug-and-play solution to audio for React apps integrating Daily. If you need a custom audio composition head over to `DailyAudioTrack`.

## Props (optional)

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `autoSubscribeActiveSpeaker` | `boolean` | When enabled and the call is configured to use manual track subscriptions, `DailyAudio` automatically subscribes to any active speaker's audio track. |
| `maxSpeakers` | `number` | Defines the amount of participants that can be heard simultaneously. Defaults to `5` |
| `onPlayFailed` | `Function` | Callback when an `<audio>` tag fails to `play()` |
| `playLocalScreenAudio` | `boolean` | When set to `true` the local participant's `screenAudio` will be played. Defaults to `false` |
| `ref` | `Object` | Grants access to a set of methods to query for `<audio>` elements rendered from `DailyAudio` |

### Querying for `<audio>` elements

When passing a `ref` to `DailyAudio`, the passed ref receives access to methods to query for subsets of rendered `<audio>` elements via `useImperativeHandle`. Use these methods to query for `<audio>` elements rendered from `DailyAudio` in order to get DOM-level access. As an example, having direct access to the `HTMLAudioElement`s rendered will allow you to adjust output volume levels.

| Method | ReturnType | Description |
| :-- | :-- | :-- |
| `getAllAudio()` | `HTMLAudioElement[]` | Returns all rendered `<audio>` elements |
| `getActiveSpeakerAudio()` | `HTMLAudioElement | null` | Returns the `<audio>` element containing the audio track for the active speaker, or `null` in case there is no active speaker |
| `getScreenAudio()` | `HTMLAudioElement[]` | Returns all `<audio>` elements with a `screenAudio` track assigned |
| `getAudioBySessionId(sessionId: string)` | `HTMLAudioElement | null` | Returns the `<audio>` element for the given `sessionId` and an `audio` track assigned |
| `getScreenAudioBySessionId(sessionId: string)` | `HTMLAudioElement | null` | Returns the `<audio>` element for the given `sessionId` and an `screenAudio` track assigned |

## Sample code

JSX

```

import { DailyAudio } from '@daily-co/daily-react';

function CallComponent() {

  const handlePlayFailed = useCallback((e) => {

    console.error(

      `Failed to play ${e.type} for ${e.sessionId}. Audio tag: ${e.target}.`

    );

  }, []);

  return <DailyAudio maxSpeakers={6} onPlayFailed={handlePlayFailed} />;

}

```

*   DailyAudioTrack
*   DailyVideo
*   useAudioLevelObserver
*   useMediaTrack

* * *

[Previous](/reference/daily-react/daily-provider)

[Next](/reference/daily-react/daily-audio-track)

---

---
url: https://docs.daily.co/reference/daily-react/daily-audio-track
title: Daily Audio Track
---

# Daily Audio Track

# DailyAudioTrack

`<DailyAudioTrack sessionId={sessionId} />`

The `DailyAudioTrack` sets up an `<audio>` tag for a specific audio track, identified by a `sessionId` and `type`. Use this component to compose a custom audio arrangement in a Daily call.

## Props

| Parameter | Required | Type | Description |
| :-- | :-- | :-- | :-- |
| `sessionId` | ✓ | `string` | The participant's `session_id` for which the audio track should be played. |
| `onPlayFailed` |  | `Function` | Callback when an `<audio>` tag fails to `play()`. |
| `type` |  | `'audio' | 'screenAudio'` | The participant's track type to play. Defaults to `'audio'` |

## Data attributes

`DailyAudioTrack` renders a couple of dynamic `data` attributes:

| Attribute | Description |
| :-- | :-- |
| `data-session-id` | Contains the corresponding `sessionId` |
| `data-audio-type` | Contains the corresponding `type` |

## Sample code

JSX

```

import { DailyAudioTrack } from '@daily-co/daily-react';

function ParticipantAudio({ sessionId }) {

  const handlePlayFailed = useCallback((e) => {

    console.error(

      `Failed to play ${e.type} for ${e.sessionId}. Audio tag: ${e.target}.`

    );

  }, []);

  return (

    <DailyAudioTrack

      sessionId={sessionId}

      onPlayFailed={handlePlayFailed}

      type="audio"

    />

  );

}

```

## Related references

-   Daily Audio
-   Daily Video
-   useAudioLevelObserver
-   useMediaTrack

* * *

[Previous](/reference/daily-react/daily-audio)

[Next](/reference/daily-react/daily-video)

---

---
url: https://docs.daily.co/reference/daily-react/daily-video
title: Daily Video
---

# Daily Video

# DailyVideo

The `DailyVideo` component renders a `<video>` tag for a given participant's `sessionId` and track `type`.

## Props

| Parameter | Required | Type | Description |
| :-- | :-- | :-- | :-- |
| `sessionId` | ✓ | `string` | The participant's `session_id` for which the video track should be played |
| `automirror` |  | `boolean` | When enabled, mirrors a local participant's user-facing camera video. Defaults to `false` |
| `fit` |  | `'contain' | 'cover'` | Determines whether the video should be fully contained or cover the element. See object-fit for details. Defaults to `'contain'` |
| `mirror` |  | `boolean` | When set to `true`, video is mirrored. Defaults to `false` |
| `playableStyle` |  | `Object` | Inline styles to be applied, when the video is in a playable state. These will overwrite styles passed with the `style` prop. Use this to style the `<video>` differently when it's playing or not (e.g. when the participant's camera is muted or not). Defaults to `{}` |
| `onResize` |  | `Function` | Callback when the video element is resized. Reports the video's `height`, `width` and `aspectRatio`. |
| `style` |  | `Object` | Inline styles to be applied to the `<video>` element. Defaults to `{}` |
| `type` |  | `'video' | 'screenVideo'` | The participant's track type to play. Defaults to `'video'` |

`DailyVideo` also accepts any other `React.VideoHTMLAttributes`.

## Data attributes

`DailyVideo` renders a couple of dynamic `data` attributes:

| Attribute | Description |
| :-- | :-- |
| `data-local` | `"true"` in case the video comes from the local participant |
| `data-mirrored` | `"true"` in case the video is mirrored, due to `automirror` or `mirror` |
| `data-playable` | `"true"` in case the video is in a playable state |
| `data-session-id` | Contains the corresponding `sessionId` |
| `data-subscribed` | `"true"` or `"staged"` in case the video track is subscribed or staged |
| `data-video-type` | Contains the corresponding `type` |

## Sample code

JSX

```

import { DailyVideo } from '@daily-co/daily-react';

function Tile({ sessionId }) {

  return <DailyVideo automirror sessionId={sessionId} />;

}

```

*   [DailyAudioTrack](/reference/daily-react/daily-audio-track)
*   [DailyAudio](/reference/daily-react/daily-audio)
*   [useAudioLevelObserver](/reference/daily-react/use-audio-level-observer)
*   [useMediaTrack](/reference/daily-react/use-media-track)

* * *

[Previous](/reference/daily-react/daily-audio-track)

[Next](/reference/daily-react/use-active-participant)

---

---
url: https://docs.daily.co/reference/daily-react/use-active-participant
title: useActiveParticipant
---

# useActiveParticipant

`useActiveParticipant(params?) : Object | null`

Returns an object for the participant `id` mentioned in the most recent `active-speaker-change` event.

`useActiveParticipant` can also set up an optional callback for the active-speaker-change event.

## Params (optional)

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `ignoreLocal` |  | `boolean` | If `true`, `useActiveParticipant` will not return a participant object when the local participant is the active speaker |
| `onActiveSpeakerChange` |  | `Function` | event callback for active-speaker-change event listener |

## Return type

| Type | Description |
| --- | --- |
| `Object | null` | Contains detailed information about the participant, see participant properties. If no participant has unmuted, `useActiveParticipant` returns `null` |

## Sample code

JSX

Copy to clipboard

```

import { useActiveParticipant } from '@daily-co/daily-react';

export const CurrentSpeaker = () => {

  const activeSpeaker = useActiveParticipant();

  return (

    <div>{activeSpeaker?.user_name ?? 'Nobody'} is currently speaking.</div>

  );

};

```

## Related references

-   useActiveSpeakerId()
-   useLocalParticipant()
-   useLocalSessionId()
-   useParticipantCounts()
-   useParticipantIds()
-   useParticipantProperty()
-   useParticipant()
-   useWaitingParticipants()

* * *

[Previous](/reference/daily-react/daily-video)

[Next](/reference/daily-react/use-active-speaker-id)

---

---
url: https://docs.daily.co/reference/daily-react/use-active-speaker-id
title: useActiveSpeakerId
---

# useActiveSpeakerId

# useActiveSpeakerId

`useActiveSpeakerId(params?) : string | null`

Returns the participant's `session_id` mentioned in the most recent `'active-speaker-change'` event. Use this property to limit active speakers returned from this hook to subgroups.

Apply a `filter` to limit which participants should be considered as active speakers.

## Params (optional)

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `filter` | `Function` | Callback function to filter which participants should be considered as active speakers by this hook instance. Return `true` to allow the passed `session_id` to become the next active speaker. |
| `ignoreLocal` | `boolean` | If `true`, `useActiveSpeakerId` will ignore when the local participant is the active speaker |

## Return type

| Type | Description |
| --- | --- |
| `string | null` | The active speaker's `session_id`. If no participant has unmuted, `useActiveSpeakerId` returns `null` |

## Sample code

JSX

```

1

import { useActiveSpeakerId } from '@daily-co/daily-react';

2

3

export const CurrentSpeaker \= () \=> {

4

  const activeSpeakerId \= useActiveSpeakerId();

5

  return <div\>Current speaker id: {activeSpeakerId ?? 'none'}</div\>;

6

};

7

```

## Related references

-   [useActiveParticipant](/reference/daily-react/use-active-participant)
-   [useLocalParticipant](/reference/daily-react/use-local-participant)
-   [useLocalSessionId](/reference/daily-react/use-local-session-id)
-   [useParticipantCounts](/reference/daily-react/use-participant-counts)
-   [useParticipantIds](/reference/daily-react/use-participant-ids)
-   [useParticipantProperty](/reference/daily-react/use-participant-property)
-   [useParticipant](/reference/daily-react/use-participant)
-   [useWaitingParticipants](/reference/daily-react/use-waiting-participants)

* * *

[Previous](/reference/daily-react/use-active-participant)

[Next](/reference/daily-react/use-app-message)

---

---
url: https://docs.daily.co/reference/daily-react/use-app-message
title: useAppMessage
---

# useAppMessage

# useAppMessage

`useAppMessage({ onAppMessage?: Function}) : Object`

Convenience hook for the `daily-js` sendAppMessage method.

`useAppMessage` can also set up an optional callback for the app-message event.

## Params (optional)

An object with the following properties:

- `onAppMessage` (optional): `Function`, callback for the app-message event. When an app-message is sent, the callback will be called with two arguments:

| Name | Type | Description |
| --- | --- | --- |
| `ev` | `Object` | The original event payload sent from `daily-js` |
| `sendAppMessage` | `Function` | The function reference that was created internally inside `useAppMessage`. This avoids having to call the hook twice in order to respond to an `app-message` with an `app-message` |

## Return type

| Name | Type | Description |
| --- | --- | --- |
| `sendAppMessage` | `Function` | See sendAppMessage() instance method in `daily-js` |

## Sample code

JSX

```

1

import { useAppMessage } from '@daily-co/daily-react';

2

import { useCallback, useState } from 'react';

3

4

export const AppMessageDemo \= () \=> {

5

  const \[messages, setMessages\] \= useState(\[\]);

6

7

  const sendAppMessage \= useAppMessage({

8

    onAppMessage: useCallback((ev) \=> setMessages((m) \=> \[...m, ev\]), \[\]),

9

  });

10

11

  useEffect(() \=> {

12

    sendAppMessage({ msg: 'Hi, everyone' }, '\*');

13

  }, \[sendAppMessage\]);

14

15

  return (

16

    <ul\>

17

      {messages.map((ev) \=> (

18

        <li\>

19

          {ev.fromId}: {JSON.stringify(ev.data)}

20

        </li\>

21

      ))}

22

    </ul\>

23

  );

24

};

25

```

* * *

[Previous](/reference/daily-react/use-active-speaker-id)

[Next](/reference/daily-react/use-audio-level)

---

---
url: https://docs.daily.co/reference/daily-react/use-audio-level
title: useAudioLevel
---

# useAudioLevel

# 

useAudioLevel

Deprecated 0.20.0

`useAudioLevel(params) : void`

`useAudioLevel` is deprecated. Use [`useAudioLevelObserver`](/reference/daily-react/use-audio-level-observer) instead.

The `useAudioLevel` hook takes a `MediaStreamTrack` (for example, a call participant's audio track). The second parameter, `onVolumeChange`, is a callback function, which runs when the track's volume level changes. With this callback, you can respond to the track's volume changes in whichever way you want.

## Params

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `mediaTrack` | ✓ | `MediaStreamTrack` | The `MediaStreamTrack` to test |
| `onVolumeChange` | ✓ | `Function` | A callback reference to run when the track's volume level changes |

## Sample code

JSX

Copy to clipboard

```

1

import {

2

  useAudioLevel,

3

  useAudioTrack,

4

  useLocalSessionId,

5

} from '@daily-co/daily-react';

6

import { useCallback, useRef } from 'react';

7

8

export const MicVolumeVisualizer = () => {

9

  const localSessionId = useLocalSessionId();

10

  const audioTrack = useAudioTrack(localSessionId);

11

12

  const volRef = useRef(null);

13

14

  useAudioLevel(

15

    audioTrack?.persistentTrack,

16

    useCallback((volume) => {

17

      // this volume number will be between 0 and 1

18

      // give it a minimum scale of 0.15 to not completely disappear 👻

19

      volRef.current.style.transform = `scale(${Math.max(0.15, volume)})`;

20

    }, [])

21

  );

22

23

  // Your audio track's audio volume visualized in a small circle,

24

  // whose size changes depending on the volume level

25

  return (

26

    <div>

27

      <div className="vol" ref={volRef} />

28

      <style jsx>{`

29

        .vol {

30

          border: 1px solid black;

31

          border-radius: 100%;

32

          height: 32px;

33

          transition: transform 0.1s ease;

34

          width: 32px;

35

        }

36

      `}</style>

37

    </div>

38

  );

39

};

40

```

-   [DailyAudioTrack](/reference/daily-react/daily-audio-track)
-   [DailyAudio](/reference/daily-react/daily-audio)
-   [DailyVideo](/reference/daily-react/daily-video)
-   [useAudioLevelObserver](/reference/daily-react/use-audio-level-observer)
-   [useMediaTrack](/reference/daily-react/use-media-track)

* * *

[Previous](/reference/daily-react/use-app-message)

[Next](/reference/daily-react/use-audio-level-observer)

---

---
url: https://docs.daily.co/reference/daily-react/use-audio-level-observer
title: useAudioLevelObserver
---

# useAudioLevelObserver

`useAudioLevelObserver(params) : void`

The `useAudioLevelObserver` hook takes a `sessionId`. The second parameter, `onVolumeChange`, is a callback function, which runs when the track's volume level changes. With this callback, you can respond to the track's volume changes in whichever way you want.

## Params

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `sessionId` | ✓ | `string` | The participant's `sessionId` for which audio level should be observed |
| `onVolumeChange` | ✓ | `Function` | A callback reference to run when the track's volume level changes |
| `onError` |  | `Function` | A callback reference to run when local audio level observer is not available in the current browser. |
| `interval` |  | `number` | The interval in milliseconds at which the volume level is checked (default: 200, minimum: 100) |

## Sample code

JSX

```

import {

  useAudioLevelObserver,

  useLocalSessionId,

} from '@daily-co/daily-react';

import { useCallback, useRef } from 'react';

export const MicVolumeVisualizer = () => {

  const localSessionId = useLocalSessionId();

  const volRef = useRef(null);

  useAudioLevelObserver(

    localSessionId,

    useCallback((volume) => {

      // this volume number will be between 0 and 1

      // give it a minimum scale of 0.15 to not completely disappear 👻

      volRef.current.style.transform = `scale(${Math.max(0.15, volume)})`;

    }, [])

  );

  // Your audio track's audio volume visualized in a small circle,

  // whose size changes depending on the volume level

  return (

    <div>

      <div className="vol" ref={volRef} />

      <style jsx>{`

        .vol {

          border: 1px solid black;

          border-radius: 100%;

          height: 32px;

          transition: transform 0.1s ease;

          width: 32px;

        }

      `}</style>

    </div>

  );

};

```

* * *

Previous

Next

---

---
url: https://docs.daily.co/reference/daily-react/use-cpu-load
title: useCPULoad
---

# useCPULoad

# useCPULoad

`useCPULoad(params?): Object`

Returns current information about the CPU status.

## Params (optional)

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `onCPULoadChange` |  | `Function` | Event callback for the cpu-load-change event |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `state` | `string` | `'low' | 'high'`, an assessment of the current CPU state. See cpu-load-change for more details |
| `reason` | `string` | `'none' | 'encode' | 'decode' | 'scheduleDuration'`. See cpu-load-change for more details |

JSON

Copy to clipboard

```json
{
  "state": "low",
  "reason": "none"
}
```

## Sample code

JSX

Copy to clipboard

```jsx
import { useCPULoad } from '@daily-co/daily-react';

export const UseCPULoadDemo = () => {
  const cpu = useCPULoad();

  return <div>CPU load: {cpu.state}</div>;
};
```

* * *

[Previous](/reference/daily-react/use-audio-level-observer)

[Next](/reference/daily-react/use-call-frame)

---

---
url: https://docs.daily.co/reference/daily-react/use-call-frame
title: useCallFrame
---

# useCallFrame

# useCallFrame

`useCallFrame(): DailyCall`

This hook manages a call frame instance in order to embed Daily Prebuilt. When manually managing call frame instances in React, it's easy to run into issues, like `Error: Duplicate DailyIframe instances are not allowed`, specifically in React's Strict Mode. `useCallFrame()` helps prevent that.

## Params (optional)

`useCallFrame` accepts the same configuration options as `createFrame()`.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `parentElRef` | `MutableRefObject<HTMLElement>` | If specified, Daily's iframe will be appended to the referenced element. Otherwise it will be appended as a child of `document.body`. |
| `options` | `DailyFactoryOptions` | Contains all factory properties that are passed to `createFrame()`. Check DailyCall properties for details. |
| `shouldCreateInstance` | `Function` | Optional callback function with a boolean return to control when the call frame instance should be created. |

## Return type

| Type | Description |
| :-- | :-- |
| `DailyCall` | The `DailyCall` instance. |

## Sample code

JSX

```
import { DailyProvider, useCallFrame } from '@daily-co/daily-react';
import { useCallback, useRef } from 'react';

export const UseCallFrameDemo = () => {
  const callRef = useRef(null);
  const callFrame = useCallFrame({
    parentElRef: callRef,
    options: {
      iframeStyle: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      },
    },
  });
  return (
    /*
     * Yes, you can pass a callFrame to DailyProvider!
     * Keep in mind that Daily's iframe runs in a separate
     * secure web context, so some data is not available,
     * such as audio and video tracks.
     */
    <DailyProvider callObject={callFrame}>
      <div ref={callRef} />
    </DailyProvider>
  );
};
```

## Related references

-   DailyProvider
-   useCallObject()
-   useDaily()

[Previous](/reference/daily-react/use-cpu-load)

[Next](/reference/daily-react/use-call-object)

---

---
url: https://docs.daily.co/reference/daily-react/use-call-object
title: useCallObject
---

# useCallObject

# useCallObject

`useCallObject(): DailyCall`

This hook manages a call object instance. When manually managing call object instances in React, it's easy to run into issues, like `Error: Duplicate DailyIframe instances are not allowed`, specifically in React's Strict Mode. `useCallObject()` helps prevent that.

`useCallObject` creates and destroys a call object instance. `useDaily` provides access to the call object instance passed to or managed by `DailyProvider`.

## Params (optional)

`useCallObject` accepts the same configuration options as `createCallObject()`.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `options` | `DailyFactoryOptions` | Contains all factory properties that are passed to `createFrame()`. Check DailyCall properties for details. |
| `shouldCreateInstance` | `Function` | Optional callback function with a boolean return to control when the call frame instance should be created. |

## Return type

| Type | Description |
| :-- | :-- |
| `DailyCall` | The `DailyCall` instance. |

## Sample code

JSX

```

import { useCallback, useRef } from 'react';

import { DailyProvider, useCallObject } from '@daily-co/daily-react';

export const UseCallObjectDemo = () => {

  const callRef = useRef(null);

  const callObject = useCallObject();

  return (

    <DailyProvider callObject={callObject}>

      <div ref={callRef} />

    </DailyProvider>

  );

};

```

## Related references

-   [DailyProvider](/reference/daily-react/daily-provider)
-   [useCallFrame()](/reference/daily-react/use-call-frame)
-   [useDaily()](/reference/daily-react/use-daily)

* * *

[Previous](/reference/daily-react/use-call-frame)

[Next](/reference/daily-react/use-daily)

---

---
url: https://docs.daily.co/reference/daily-react/use-daily
title: useDaily
---

# useDaily

# useDaily

`useDaily(): DailyCall`

Returns the current call object instance. This is the same instance that was either passed to the `DailyProvider` or created by it.

## Return type

| Type | Description |
| :-- | :-- |
| `Object` | A `DailyCall`, which is the call object |

## Sample code

JSX

Copy to clipboard

```

1

import { useDaily } from '@daily-co/daily-react';

2

3

export const UseDailyDemo = () => {

  const daily = useDaily();

  const state = daily?.meetingState();

  return <div>Meeting state: {state ?? 'unknown'}</div>;

};

8

```

## Related references

-   [DailyProvider](/reference/daily-react/daily-provider)
-   [useCallFrame()](/reference/daily-react/use-call-frame)
-   [useCallObject()](/reference/daily-react/use-call-object)

* * *

[Previous](/reference/daily-react/use-call-object)

[Next](/reference/daily-react/use-daily-error)

---

---
url: https://docs.daily.co/reference/daily-react/use-daily-error
title: useDailyError
---

# useDailyError

# useDailyError

`useDailyError() : Object`

`useDailyError` returns a stateful representation of the most recent [`error`](/reference/daily-js/events/meeting-events#error) and [`nonfatal-error`](/reference/daily-js/events/meeting-events#nonfatal-error) event objects.

Keep in mind that an `error` event will cause a participant to be ejected immediately from a meeting. If you need to render UI based on the `meetingError` state, make sure that you don't destroy the `callObject` instance until you no longer need the error state. This includes updating any props for [`DailyProvider`](/reference/daily-react/daily-provider) as we'll destroy the current `callObject` instance internally in order to setup a new one with the updated props.

## Return type

An object with the following properties:

| Name | Type | Description |
| --- | --- | --- |
| `meetingError` | `Object` | The most recent event object for the [`error`](/reference/daily-js/events/meeting-events#error) event. |
| `nonFatalError` | `Object` | The most recent event object for the [`nonfatal-error`](/reference/daily-js/events/meeting-events#nonfatal-error) event. |

## Sample code

JSX

```javascript
import { useDailyError } from '@daily-co/daily-react';

export const MyMeetingState = () => {
  const { meetingError, nonFatalError } = useDailyError();

  return (
    <div>
      <p>Most recent meeting error: {meetingError?.errorMsg}</p>
      <p>Most recent nonfatal error: {nonFatalError?.errorMsg}</p>
    </div>
  );
};
```

* * *

[Previous](/reference/daily-react/use-daily)

[Next](/reference/daily-react/use-daily-event)

---

---
url: https://docs.daily.co/reference/daily-react/use-daily-event
title: useDailyEvent
---

# useDailyEvent

# useDailyEvent

`useDailyEvent(params): void`

Registers `daily-js` listeners. The listeners are automatically torn down when a component or hook calling `useDailyEvent` gets unmounted.

## Params

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `event` | ✓ | `string` | The `daily-js` event to register |
| `callback` | ✓ | `Function` | A memoized callback reference to run when the event is emittedlistener |

The `callback` param has to be a memoized reference (e.g. via `useCallback`). Otherwise a console error might be thrown indicating a potential re-render loop.

## Return type

- `void`

## Sample code

JSX

```

import { useDailyEvent } from '@daily-co/daily-react';

import { useCallback, useState } from 'react';

export const DailyEventDemo = () => {

  const [meetingState, setMeetingState] = useState('disconnected');

  useDailyEvent(

    'joined-meeting',

    useCallback((ev) => {

      setMeetingState('connected');

    }, [])

  );

  return <div>Meeting state: {meetingState}</div>;

};

```

## Related references

- useThrottledDailyEvent()

* * *

[Previous](/reference/daily-react/use-daily-error)

[Next](/reference/daily-react/use-devices)

---

---
url: https://docs.daily.co/reference/daily-react/use-devices
title: useDevices
---

# useDevices

# useDevices

`useDevices(): Object`

Returns information about a participant's media devices and their states, along with helper functions that wrap daily-js device-related methods. For more information about the different error states, check the camera-error reference.

## Return type

Returns an object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `cameraError` | `Object | null` | Stores the most recent error object that was emitted through the camera-error event |
| `cameras` | `Object[]` | An array of device objects that contains information about each camera |
| `camState` | `string` | `'idle' | 'pending' | 'not-supported' | 'granted' | 'blocked' | 'in-use' | 'not-found' | 'constraints-invalid' | 'constraints-none-specified' | 'undefined-mediadevices' | 'unknown'`, indicates the general state of camera access |
| `currentCam` | `Object | undefined` | References the selected device in the `cameras` array. |
| `currentMic` | `Object | undefined` | References the selected device in the `microphones` array. |
| `currentSpeaker` | `Object | undefined` | References the selected device in the `speakers` array. |
| `hasCamError` | `boolean` | `true` in case `camState` is one of `'blocked' | 'in-use' | 'not-found' | 'constraints-invalid' | 'constraints-none-specified' | 'undefined-mediadevices' | 'unknown'` |
| `hasMicError` | `boolean` | `true` in case `micState` is one of `'blocked' | 'in-use' | 'not-found' | 'constraints-invalid' | 'constraints-none-specified' | 'undefined-mediadevices' | 'unknown'` |
| `microphones` | `Object[]` | An array of device objects that contains information about each microphone |
| `micState` | `string` | `'idle' | 'pending' | 'not-supported' | 'granted' | 'blocked' | 'in-use' | 'not-found' | 'constraints-invalid' | 'constraints-none-specified' | 'undefined-mediadevices' | 'unknown'`, indicates the general state of microphone access |
| `refreshDevices` | `Function` | Refreshes the list of devices using enumerateDevices() |
| `setCamera` | `Function` | Switches to the camera with the specified `deviceId`. Calls setInputDevicesAsync() |
| `setMicrophone` | `Function` | Switches to the mic with the specified `deviceId`. Calls setInputDevicesAsync() |
| `setSpeaker` | `Function` | Switches to the speaker with the specified `deviceId`. Calls setOutputDeviceAsync() |
| `speakers` | `Object[]` | An array of device objects that contains information about each speaker |

### About `camState` and `micState`

With 0.7.0 `camState` and `micState` have a new default value of `"idle"` (in previous versions of Daily React, this value was `"pending"`). Both states remain `"idle"` as long as no device access has been requested, which is the case for rooms configured with `start_audio_off: true` and `start_video_off: true`. Once device access is requested, `camState` and `micState` switch to `"pending"`, as long as device access is pending. Once the user grants device access they will switch to `"granted"`. In case the user blocked device access they switch to `"blocked"` accordingly. In case of an error the most representative error state will be applied.

### Device object properties

| Name | Type | Description |
| :-- | :-- | :-- |
| `device` | `Object` | The same device information returned from enumerateDevices() |
| `selected` | `boolean` | `true` when this specific device is currently being used by getUserMedia() |
| `state` | `string` | `'granted' | 'in-use'`, `'granted'` means the device is available, `'in-use'` means the device is used by another app |

```json
{
  "cameras": [
    {
      "device": <Object>,
      "selected": true,
      "state": "granted"
    }
  ],
  "camState": "granted",
  "currentCam": <Object>,
  "currentMic": <Object>,
  "currentSpeaker": <Object>,
  "hasCamError": false,
  "hasMicError": true,
  "microphones": [
    {
      "device": <Object>,
      "selected": false,
      "state": "in-use"
    }
  ],
  "micState": "in-use",
  "refreshDevices": <Function>,
  "setCamera": <Function>,
  "setMicrophone": <Function>,
  "setSpeaker": <Function>,
  "speakers": [
    {
      "device": <Object>,
      "selected": false,
      "state": "granted"
    }
  ]
}
```

## Sample code

```jsx
import { useDevices } from '@daily-co/daily-react';

export const UseDevicesDemo = () => {
  const devices = useDevices();

  return (
    <ul>
      <li>Cam: {devices.hasCamError ? 'Error' : 'OK'}</li>
      <li>Mic: {devices.hasMicError ? 'Error' : 'OK'}</li>
    </ul>
  );
};
```

* * *

[Previous](/reference/daily-react/use-daily-event)

[Next](/reference/daily-react/use-input-settings)

---

---
url: https://docs.daily.co/reference/daily-react/use-input-settings
title: useInputSettings
---

# useInputSettings

# useInputSettings

`useInputSettings(params?) : Object`

Convenience hook around `getInputSettings()` and `updateInputSettings()`.

## Params (optional)

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `onError` |  | `Function` | Callback for the `'input-settings-error'` event |
| `onInputSettingsUpdated` |  | `Function` | Callback for the `input-settings-updated` event |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `errorMsg` | `string` | Details an input settings error. Defaults to `null`. |
| `inputSettings` | `Object` | The settings for the participant. See `daily-js` instance method `getInputSettings()` for an overview of input settings |
| `updateInputSettings` | `Function` | Updates input settings, equivalent to calling the `daily-js` `updateInputSettings()` method |

Any calls to `updateInputSettings()` before the meeting is joined will be silently ignored.

## Sample code

TSX

```

import { DailyEventObjectInputSettingsUpdated } from '@daily-co/daily-js';

import { useInputSettings } from '@daily-co/daily-react';

import React, { useCallback, useState } from 'react';

export const UseInputSettingsDemo = () => {

  const [, setErrorMessage] = useState('No error!');

  const { updateInputSettings, errorMsg } = useInputSettings({

    onError: useCallback(() => {

      setErrorMessage(errorMsg);

    }, [errorMsg]),

    onInputSettingsUpdated: useCallback(

      (event: DailyEventObjectInputSettingsUpdated) => {

        console.log(

          'Input settings updated:',

          event.inputSettings?.video?.processor

        );

      },

      []

    ),

  });

  const enableBackgroundBlur = () => {

    updateInputSettings({

      video: {

        processor: {

          type: 'background-blur',

          config: { strength: 0.5 },

        },

      },

    });

  };

  return (

    <div>

      <button type="button" onClick={enableBackgroundBlur}>

        Enable background blur

      </button>

    </div>

  );

};

```

* * *

[Previous](/reference/daily-react/use-devices)

[Next](/reference/daily-react/use-live-streaming)

---

---
url: https://docs.daily.co/reference/daily-react/use-live-streaming
title: useLiveStreaming
---

# useLiveStreaming

`useLiveStreaming(params?) : Object`

Returns information about a live stream, along with helper functions that wrap `daily-js` live streaming-related methods.

`useLiveStreaming` can also be used to set up optional callbacks for live streaming events.

## Params (optional)

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `onLiveStreamingError` |  | `Function` | Callback for the live-streaming-error event |
| `onLiveStreamingStarted` |  | `Function` | Callback for the live-streaming-started event |
| `onLiveStreamingStopped` |  | `Function` | Callback for the live-streaming-stopped event |
| `onLiveStreamingUpdated` |  | `Function` | Callback for the live-streaming-updated event |
| `onLiveStreamingWarning` |  | `Function` | Callback for the nonfatal-error event with type 'live-streaming-warning' |

## Return type

An object with the following properties:

| Name | Type | Description |
| --- | --- | --- |
| `errorMsg` | `string` | Details a live streaming error, defaults to `undefined` |
| `isLiveStreaming` | `boolean` | Indicates whether a live stream is currently happening, defaults to `false` |
| `layout` | `Object` | Describes any preset live streaming layout, and any corresponding layout-specific details. Defaults to `undefined` |
| `startLiveStreaming` | `Function` | See startLiveStreaming() |
| `stopLiveStreaming` | `Function` | See stopLiveStreaming() |
| `updateLiveStreaming` | `Function` | See updateLiveStreaming() |

```json
{
  "errorMsg": "A live streaming error occurred",
  "isLiveStreaming": false,
  "layout": <Object>,
  "startLiveStreaming": <Function>,
  "stopLiveStreaming": <Function>,
  "updateLiveStreaming": <Function>
}
```

For more on live streaming with Daily, reference our guide.

## Sample code

```javascript
import { useLiveStreaming } from '@daily-co/daily-react';

export const UseLiveStreamingDemo = () => {
  const liveStreamingState = useLiveStreaming();

  return (
    <div>
      This call is {!liveStreamingState.isLiveStreaming ? 'not' : ''} live
      streamed
    </div>
  );
};
```

* * *

[Previous](/reference/daily-react/use-input-settings)

[Next](/reference/daily-react/use-local-participant)

---

---
url: https://docs.daily.co/reference/daily-react/use-local-participant
title: useLocalParticipant
---

# useLocalParticipant

# useLocalParticipant

Deprecated 0.17.0

`useLocalParticipant() : Object`

Returns a local participant object.

## Return type

| Type     | Description                                                                        |
| :------- | :--------------------------------------------------------------------------------- |
| `Object` | An object with detailed information about the participant, see participant properties |

## Sample code

JSX

```
import { useLocalParticipant } from '@daily-co/daily-react';

export const UseLocalParticipantDemo = () => {
  const localParticipant = useLocalParticipant();

  return <div>Hello, {localParticipant?.user_name}</div>;
};
```

## Related references

-   useActiveParticipant()
-   useActiveSpeakerId()
-   useLocalSessionId()
-   useParticipantCounts()
-   useParticipantIds()
-   useParticipantProperty()
-   useParticipant()
-   useWaitingParticipants()

* * *

Previous

Next

---

---
url: https://docs.daily.co/reference/daily-react/use-local-session-id
title: useLocalSessionId
---

# useLocalSessionId

# useLocalSessionId

`useLocalSessionId(): string`

`useLocalSessionId` is a convenience hook to access the local participant's `session_id`. It is preferable over `useLocalParticipant` when only the `session_id` is needed, which can help reduce unnecessary re-renders.

## Return type

The local participant's `session_id` (a string) is returned by this hook. See the participant properties documentation for more information.

## Sample code

JSX

```
1
import { useLocalSessionId } from '@daily-co/daily-react';
2
3
export const UseLocalSessionIdDemo = () => {
4
  const localSessionId = useLocalSessionId();
5
6
  return <div>Your ID: {localSessionId}</div>;
7
};
8
```

## Related references

-   useActiveParticipant()
-   useActiveSpeakerId()
-   useLocalParticipant()
-   useParticipantCounts()
-   useParticipantIds()
-   useParticipantProperty()
-   useParticipant()
-   useWaitingParticipants()

[Previous](/reference/daily-react/use-local-participant)

[Next](/reference/daily-react/use-media-track)

---

---
url: https://docs.daily.co/reference/daily-react/use-media-track
title: useMediaTrack
---

# useMediaTrack

# useMediaTrack

`useMediaTrack(params) : Object`

Given a participant `session_id` and `type` of track, returns the corresponding track and its state.

There are also convenience hooks for each track type.

## Params

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `session_id` | ✓ | `string` | A unique identifier for the participant |
| `type` |  | `string` | `'audio' | 'screenAudio' | 'screenVideo' | 'video'`, specifies the kind of track, defaults to `'video'` |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `MediaTrackState` | `Object` | Includes detailed information about the given track. See participant tracks properties |
| `isOff` | `boolean` | Indicates whether a track is turned off or on, `true` when track state is `'blocked'` or `'off'`

## Convenience hooks for specific track types

### useAudioTrack

`useAudioTrack(session_id: string) : MediaTrackState`

Given a participant's `session_id`, returns the `MediaTrackState` of their `'audio'` track.

### useScreenAudioTrack

`useScreenAudioTrack(session_id: string) : MediaTrackState`

Given a participant's `session_id`, returns the `MediaTrackState` of their `'screenAudio'` track.

### useScreenVideoTrack

`useScreenVideoTrack(session_id: string) : MediaTrackState`

Given a participant's `session_id`, returns the `MediaTrackState` of their `'screenVideo'` track.

### useVideoTrack

`useVideoTrack(session_id: string) : MediaTrackState`

Given a participant's `session_id`, returns the `MediaTrackState` of their `'video'` track.

## Sample code

JSX

Copy to clipboard

```

1

import { useMediaTrack } from '@daily-co/daily-react';

2

3

export const UseMediaTrackDemo = (props) => {

4

  const sessionID = props.session_id;

5

  const mediaTrack = useMediaTrack(sessionID, "audio");

6

7

  return (

8

      <div>Audio {mediaTrack.isOff ? "off" : "on"}</div>

9

  )

10

};

11

```

* [DailyAudioTrack](/reference/daily-react/daily-audio-track)
* [DailyAudio](/reference/daily-react/daily-audio)
* [DailyVideo](/reference/daily-react/daily-video)
* [useAudioLevelObserver](/reference/daily-react/use-audio-level-observer)

* * *

[Previous](/reference/daily-react/use-local-session-id)

[Next](/reference/daily-react/use-meeting-session-state)

---

---
url: https://docs.daily.co/reference/daily-react/use-meeting-session-state
title: useMeetingSessionState
---

# useMeetingSessionState

# useMeetingSessionState

`useMeetingSessionState() : Object`

Returns the current meeting session state as returned by `meetingSessionState()`. This hook accepts a generic type in TypeScript to work seamlessly with custom data type definitions.

## Params (optional)

An object with the following properties:

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `onError` |  | `Function` | Callback for the `nonfatal-error` event with type `'meeting-session-data-error'` |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `data` | `Object` | The meeting session data |
| `topology` | `'none' | 'peer' | 'sfu'` | The current meeting network topology |

## Sample code

JSX

```

1

import { useMeetingSessionState } from '@daily-co/daily-react';

2

3

export const UseMeetingSessionStateDemo = (props) => {

4

  const { data } = useMeetingSessionState();

5

6

  return (

7

    <div>

8

      <strong>Current session data:</strong>

9

      <pre>{JSON.stringify(data, null, 2)}</pre>

10

    </div>

11

  );

12

};

13

```

* * *

[Previous](/reference/daily-react/use-media-track)

[Next](/reference/daily-react/use-meeting-state)

---

---
url: https://docs.daily.co/reference/daily-react/use-meeting-state
title: useMeetingState
---

# useMeetingState

# useMeetingState

`useMeetingState() : DailyMeetingState`

`useMeetingState` is a convenience hook for the Daily `meetingState()` method. It returns the current meeting state.

## Return type

| Name | Type | Description |
| --- | --- | --- |
| `meetingState` | `string` | `'new' | 'loading' | 'loaded' | 'joining-meeting' | 'joined-meeting' | 'left-meeting' | 'error'`. Defaults to `'new'`. |

## Sample code

JSX

Copy to clipboard

```

1

import { useMeetingState } from '@daily-co/daily-react';

2

3

export const MyMeetingState = () => {

4

  const meetingState = useMeetingState();

5

6

  return (

7

    <div>

8

      <h1>Current meeting state: {meetingState}</h1>

9

      <p>{meetingState === 'left-meeting' && 'Goodbye!'}</p>

10

    </div>

11

  );

12

};

13

```

* * *

[Previous](/reference/daily-react/use-meeting-session-state)

[Next](/reference/daily-react/use-network)

---

---
url: https://docs.daily.co/reference/daily-react/use-network
title: useNetwork
---

# useNetwork

# useNetwork

`useNetwork(params?): Object`

Returns current information about network quality and topology.

`useNetwork` can also be used to set up optional callbacks for daily-js network events.

## Params (optional)

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `onNetworkQualityChange` |  | `Function` | Event callback for the network-quality-change event |
| `onNetworkConnection` |  | `Function` | Event callback for the network-connection event |

## Return type

An object with the following properties:

|  | Name | Type | Description |
| :-- | :-- | :-- | :-- |
|  | `getStats` | `Function` | Details the latest network stats, equivalent to calling getNetworkStats() |
|  | `networkState` | `string` | 'good' | 'warning' | 'bad' | 'unknown', check getNetworkStats() for details |
|  | `networkStateReasons` | `Array<string>` | Possible reasons are 'sendPacketLoss' | 'recvPacketLoss' | 'roundTripTime' | 'availableOutgoingBitrate', check getNetworkStats() for details |
| Deprecated 0.23.0 | `quality` | `number` | A subjective calculation of the current network quality on a scale of 1-100, defaults to `100` |
| Deprecated 0.23.0 | `threshold` | `string` | 'good' | 'low' | 'very-low', an assessment of the current network quality. The threshold value is calculated from network stats averaged over an approximately 30-second rolling window. By default, we lower the bandwidth used for the call when the network quality drops to 'low'; defaults to 'good' |
|  | `topology` | `string` | 'none' | 'peer' | 'sfu', the network connection type of the current call, defaults to 'none' |

## Sample code

```javascript
import { useNetwork } from '@daily-co/daily-react';

export const UseNetworkDemo = () => {
  const network = useNetwork();

  return <div>Network state: {network.networkState}</div>;
};
```

* * *

[Previous](/reference/daily-react/use-meeting-state)

[Next](/reference/daily-react/use-participant)

---

---
url: https://docs.daily.co/reference/daily-react/use-participant
title: useParticipant
---

# useParticipant

# useParticipant

Deprecated 0.17.0

`useParticipant(params): Object | null`

`useParticipant` returns a participant object for a given participant `session_id`. If no participant is found for the given `session_id`, returns `null`.

`useParticipant` can also be used to set up optional callbacks for [participant-left](/reference/daily-js/events/participant-events#participant-left) and [participant-updated](/reference/daily-js/events/participant-events#participant-updated) events.

## Params

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `session_id` | ✓ | `string` | A unique identifier for the participant |
| `onParticipantLeft` |  | `Function` | Callback for the [participant-left](/reference/daily-js/events/participant-events#participant-left) event |
| `onParticipantUpdated` |  | `Function` | Callback for the [participant-updated](/reference/daily-js/events/participant-events#participant-updated) event |

## Return type

| Type | Description |
| :-- | :-- |
| `Object | null` | Contains detailed information about the participant, see [participant properties](/reference/daily-js/instance-methods/participants#participant-properties). If no participant is found for a given `session_id`, `useParticipant` returns `null` |

## Sample code

JSX

```

1

import { useParticipant } from '@daily-co/daily-react';

2

3

export const UseParticipantDemo \= (params) \=> {

4

  const sessionID \= params.session\_id;

5

  const participant \= useParticipant(sessionID);

6

7

  return <div\>Participant {participant ? 'found' : 'not found'}</div\>;

8

};

9

```

## Related references

-   [useActiveParticipant()](/reference/daily-react/use-active-participant)
-   [useActiveSpeakerId()](/reference/daily-react/use-active-speaker-id)
-   [useLocalParticipant()](/reference/daily-react/use-local-participant)
-   [useLocalSessionId()](/reference/daily-react/use-local-session-id)
-   [useParticipantCounts()](/reference/daily-react/use-participant-counts)
-   [useParticipantIds()](/reference/daily-react/use-participant-ids)
-   [useParticipantProperty()](/reference/daily-react/use-participant-property)
-   [useWaitingParticipants()](/reference/daily-react/use-waiting-participants)

* * *

[Previous](/reference/daily-react/use-network)

[Next](/reference/daily-react/use-participant-counts)

---

---
url: https://docs.daily.co/reference/daily-react/use-participant-counts
title: useParticipantCounts
---

# useParticipantCounts

# useParticipantCounts

`useParticipantCounts(): Object`

`useParticipantCounts` is a convenience hook around the `participantCounts()` method.

## Return type

Returns an object with the following properties:

| Name    | Type   | Description                               |
| :------ | :----- | :---------------------------------------- |
| `present` | `number` | Amount of participants where `hasPresence` is `true` |
| `hidden`  | `number` | Amount of participants where `hasPresence` is `false` |

## Sample code

JSX

```
import { useParticipantCounts } from '@daily-co/daily-react';

export const useParticipantCountsDemo = () => {
  const { present, hidden } = useParticipantCounts();

  return (
    <ul>
      <li>{present} participants with presence</li>
      <li>{hidden} participants without presence</li>
    </ul>
  );
};
```

## Related references

-   useActiveParticipant()
-   useActiveSpeakerId()
-   useLocalParticipant()
-   useLocalSessionId()
-   useParticipantIds()
-   useParticipantProperty()
-   useParticipant()
-   useWaitingParticipants()

Previous
Next

---

---
url: https://docs.daily.co/reference/daily-react/use-participant-ids
title: useParticipantIds
---

# useParticipantIds

# useParticipantIds

`useParticipantIds(params?): string[];`

`useParticipantIds` returns a list of participant `id`s based on optional parameters. It can be used to render groups, grids, or lists containing participant data or tracks.

If no parameters are provided, the `id`s of all participants in the call are returned.

## Params (optional)

An object with the following properties:

| Name | Required | Type | Description |
| :-- | :-- | :-- | :-- |
| `filter` |  | `string` | `'local' | 'remote' | 'screen' | 'owner' | 'record' | FilterParticipantsFunction`, filters the list of participant `id`s according to the provided criteria |
| `onActiveSpeakerChange` |  | `Function` | Callback for the active-speaker-change event |
| `onParticipantJoined` |  | `Function` | Callback for the participant-joined event |
| `onParticipantLeft` |  | `Function` | Callback for the participant-left event |
| `onParticipantUpdated` |  | `Function` | Callback for the participant-updated event |
| `sort` |  | `string` | `'joined_at' | 'session_id' | 'user_id' | 'user_name' | SortParticipantsFunction`, sorts the list of participant `id`s according to the provided criteria |

### `filter` options

| Value | Type | Description |
| :-- | :-- | --- |
| `'local'` | `string` | Returns only the `local` participant |
| `'remote'` | `string` | Returns remote participants, everybody but `local` |
| `'screen'` | `string` | Returns participants with active screen shares |
| `'owner'` | `string` | Returns participants who joined the call with a meeting token that has the `is_owner` property set to `true` |
| `FilterParticipantsFunction` | `Function` | Specifies custom filtering for the list of `id`s. The full Daily participant object can be referenced |

String-based filters can be directly calculated from our internal state store and therefore provide a better render performance than a custom filter that needs to be evaluated at runtime.

### `sort` options

| Value | Type | Description |
| :-- | :-- | --- |
| `'joined_at'` | `string` | Sorts by when participants joined the call in ascending order. |
| `'session_id'` | `string` | Sorts by participant `session_id`s |
| `'user_id'` | `string` | Sorts by participant `user_id`s |
| `'user_name'` | `string` | Sorts in alphabetical order by participant `user_name` |
| `SortParticipantsFunction` | `Function` | Specifies custom sorting for the list of `id`s. The full Daily participant object can be referenced |

String-based sorting can be directly calculated from our internal state store and therefore provide a better render performance than a custom sort function that needs to be evaluated at runtime.

```
{
  "filter": "remote",
  "onActiveSpeakerChange": <Function>,
  "onParticipantJoined": <Function>,
  "onparticipantUpdated": <Function>,
  "sort": "joined_at",
}
```

## Return type

| Type | Description |
| --- | --- |
| `string[]` | An array of `string` participant `id`s |

## Sample code

```jsx
import { useParticipant, useParticipantIds } from '@daily-co/daily-react';
import { useMemo } from 'react';

export const UseParticipantIdsDemo = () => {
  const participantIDs = useParticipantIds({ sort: 'joined_at' });
  const latestParticipantID = useMemo(
    () => participantIDs?.[participantIDs.length - 1],
    [participantIDs]
  );
  const latestParticipant = useParticipant(latestParticipantID);

  return (
    <div>Latest participant: {latestParticipant?.user_name ?? 'none'}</div>
  );
};
```

## Related references

-   useActiveParticipant()
-   useActiveSpeakerId()
-   useLocalParticipant()
-   useLocalSessionId()
-   useParticipantCounts()
-   useParticipantProperty()
-   useParticipant()
-   useWaitingParticipants()

---

---
url: https://docs.daily.co/reference/daily-react/use-participant-property
title: useParticipantProperty
---

# useParticipantProperty

# useParticipantProperty

`useParticipantProperty(sessionId: string, propertyPath: string | string[]): participant[propertyPath]`

`useParticipantProperty` returns the requested property belonging to any given `session_id`.

Use this hook instead of `useParticipant` when you only need to subscribe to a small subset of participant properties to optimize for React render cycles. `useParticipant` triggers a re-render when any property in the requested participant object changes. `useParticipantProperty` only triggers a re-render when the selected property changes.

## Params

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `session_id` | ✓ | `string` | A unique identifier for the participant |
| `propertyPath` | ✓ | `string` | `string []` | The path to a desired participant property, in relation to the parent participant object. Eg: `"tracks.audio.subscribed"` |

## Return type

| Type | Description |
| :-- | :-- |
| `typeof participant[propertyPath]` | The value of the requested property, which will be the type of the requested property |

## Sample code

JSX

```

import {

  useLocalSessionId,

  useParticipantProperty,

} from '@daily-co/daily-react';

export const ParticipantPropertyExample = () => {

  const localSessionId = useLocalSessionId();

  const userName = useParticipantProperty(localSessionId, 'user_name');

  // Accessing nested properties

  const isParticipantAudioSubscribed = useParticipantProperty(

    'participant-session-id',

    'tracks.audio.subscribed'

  );

  // Requesting multiple properties

  const [isLocalOwner, localUserName] = useParticipantProperty(localSessionId, [

    'owner',

    'user_name',

  ]);

  console.log(isLocalOwner); // true;

  console.log(localUserName); // 'my_username';

  return (

    <div>

      {userName} is {isParticipantAudioSubscribed ? '' : 'not'} subscribed

    </div>

  );

};

```

## Related references

-   useActiveParticipant()
-   useActiveSpeakerId()
-   useLocalParticipant()
-   useLocalSessionId()
-   useParticipantCounts()
-   useParticipantIds()
-   useParticipant()
-   useWaitingParticipants()

* * *

[Previous](/reference/daily-react/use-participant-ids)

[Next](/reference/daily-react/use-permissions)

---

---
url: https://docs.daily.co/reference/daily-react/use-permissions
title: usePermissions
---

# usePermissions

# usePermissions

`usePermissions(sessionId?: string): Object`

`usePermissions` is a convenience hook to access the local participant's permissions.

## Params

| Parameter | Optional | Type | Description |
| :-- | :-: | :-- | :-- |
| `sessionId` | ✓ | `string` | A unique identifier for the participant |

## Return type

Returns an object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `canSendAudio` | `boolean` | `true` in case the local participant's `permissions.canSend` is `true`, or includes `'audio'` |
| `canSendVideo` | `boolean` | `true` in case the local participant's `permissions.canSend` is `true`, or includes `'video'` |
| `canSendCustomAudio` | `boolean` | `true` in case the local participant's `permissions.canSend` is `true`, or includes `'customAudio'` |
| `canSendCustomVideo` | `boolean` | `true` in case the local participant's `permissions.canSend` is `true`, or includes `'customVideo'` |
| `canSendScreenAudio` | `boolean` | `true` in case the local participant's `permissions.canSend` is `true`, or includes `'screenAudio'` |
| `canSendScreenVideo` | `boolean` | `true` in case the local participant's `permissions.canSend` is `true`, or includes `'screenVideo'` |
| `hasPresence` | `boolean` | `true` in case the local participant's `permissions.hasPresence` is `true` |
| `canAdminParticipants` | `boolean` | `true` in case the local participant's `permissions.canAdmin` is `true`, or includes `'participants'` |
| `canAdminStreaming` | `boolean` | `true` in case the local participant's `permissions.canAdmin` is `true`, or includes `'streaming'` |
| `canAdminTranscription` | `boolean` | `true` in case the local participant's `permissions.canAdmin` is `true`, or includes `'transcription'` |
| `permissions` | `Object` | The local participant's `permissions` object, as returned from participants() |

## Sample code

JSX

```javascript
import { usePermissions } from '@daily-co/daily-react';

export const usePermissionsDemo = () => {
  const { canSendAudio, canSendVideo } = usePermissions();

  return (
    <ul>
      <li>{canSendAudio ? 'can' : 'cannot'} send audio</li>
      <li>{canSendVideo ? 'can' : 'cannot'} send video</li>
    </ul>
  );
};
```

* * *

[Previous](/reference/daily-react/use-participant-property)

[Next](/reference/daily-react/use-receive-settings)

---

---
url: https://docs.daily.co/reference/daily-react/use-receive-settings
title: useReceiveSettings
---

# useReceiveSettings

# useReceiveSettings

`useReceiveSettings(params?) : Object`

Convenience hook around `getReceiveSettings()` and `updateReceiveSettings()`.

## Params (optional)

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `id` |  | `string` | A unique identifier for the participant , defaults to `base` to return the base `receiveSettings` |
| `onReceiveSettingsUpdated` |  | `Function` | Callback for the `receive-settings-updated` event |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `receiveSettings` | `Object` | The receive settings for the participant. See `daily-js` instance method `updateReceiveSettings()` for an overview of receive settings |
| `updateReceiveSettings` | `Function` | Updates receive settings, equivalent to calling the `daily-js` `updateReceiveSettings()` method |

Any calls to `updateReceiveSettings()` before the meeting is joined will be silently ignored.

## Sample code

JSX

Copy to clipboard

```

1

import { useReceiveSettings } from '@daily-co/daily-react';

2

3

export const UseReceiveSettingsDemo = () => {

4

  const receiveSettings = useReceiveSettings();

5

6

  return (

7

    <div>Receiving video layer {receiveSettings?.video?.layer ?? 'N/A'}</div>

8

  );

9

};

10

```

* * *

[Previous](/reference/daily-react/use-permissions)

[Next](/reference/daily-react/use-recording)

---

---
url: https://docs.daily.co/reference/daily-react/use-recording
title: useRecording
---

# useRecording

`useRecording(params?): Object`

`useRecording` returns the state and information of a recording in progress, along with helper functions for `daily-js` recording methods.

Accepts optional callbacks for recording events.

## Params (optional)

An object with the following properties:

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `onRecordingData` |  | `Function` | Callback for the recording-data event |
| `onRecordingError` |  | `Function` | Callback for the recording-error event |
| `onRecordingStarted` |  | `Function` | Callback for the recording-started event |
| `onRecordingStopped` |  | `Function` | Callback for the recording-stopped event |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `error` | `boolean` | `true` in the event of a recording-error |
| `isLocalParticipantRecorded` | `boolean` | Indicates whether the `local` participant is recorded |
| `isRecording` | `boolean` | Returns `true` if the call is being recorded |
| `layout` | `Object` | Describes any preset recording layout, and any corresponding layout-specific details. Defaults to `undefined` |
| `local` | `boolean` | `true` for local recordings |
| `recordingId` | `string` | A unique `id` for the recording object |
| `recordingStartedDate` | `Date` | Timestamp for when the recording started |
| `startedBy` | `string` | Identifies the participant who started the recording |
| `startRecording` | `Function` | See `daily-js` startRecording() |
| `stopRecording` | `Function` | See `daily-js` stopRecording() |
| `type` | `string` | Details the Daily recording type used for the recording |
| `updateRecording` | `Function` | See `daily-js` updateRecording() |

```json
{
  "error": false,
  "isLocalParticipantRecorded": false,
  "isRecording": true,
  "layout": <Object>,
  "local": true,
  "recordingId": "b1873c4f-30da-4814-8d57-a17270f494c5",
  "recordingStartDate": "Wed Apr 24 2019 10:33:30 GMT+0200 (Central European Summer Time)",
  "startedBy": "0e92c476-3d2f-4ddc-b814-9447cd7e3b90",
  "startRecording": <Function>,
  "stopRecording": <Function>,
  "type": "cloud",
  "updateRecording": <Function>
}
```

## Sample code

```javascript
import { useRecording } from '@daily-co/daily-react';

export const UseRecordingDemo = () => {
  const recording = useRecording();

  return <div>{!recording.isRecording ? 'Not' : ''} recording</div>;
};
```

* * *

[Previous](/reference/daily-react/use-receive-settings)

[Next](/reference/daily-react/use-room)

---

---
url: https://docs.daily.co/reference/daily-react/use-room
title: useRoom
---

# useRoom

# useRoom

`useRoom() : Object | null`

`useRoom` is a convenience hook for the Daily `room()` method. It returns room, domain, and token configuration properties.

If a room has not yet been set for the call, `useRoom` resolves to `null`.

## Return type

One of the following objects:

-   An object detailing information about the room that has been specified, but not yet joined
-   An object detailing information about the current Daily room

## Sample code

JSX

Copy to clipboard

```

1

import { useRoom } from '@daily-co/daily-react';

2

3

export const RoomName = () => {

4

  const room = useRoom();

6

  return <div>Room name: {room?.name}</div>;

7

};

8

```

* * *

[Previous](/reference/daily-react/use-recording)

[Next](/reference/daily-react/use-room-exp)

---

---
url: https://docs.daily.co/reference/daily-react/use-room-exp
title: useRoomExp
---

# useRoomExp

# useRoomExp

`useRoomExp(params?): Object`

Returns the automatic ejection date for the local participant, based on room or token configuration properties, and. It also allows to register a countdown using the `onCountdown` parameter.

## Params (optional)

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `onCountdown` |  | `Function` | When `onCountdown` is set and the room is configured to eject the local participant at a given time, `onCountdown` will be called every second with an object parameter with keys `hours`, `minutes` and `seconds` |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `ejectDate` | `Date | null` | The date when the local participant will be automatically ejected from the meeting |

```json
{
  "ejectDate": "Wed Jul 26 2023 09:48:42 GMT+0200 (Central European Summer Time)"
}
```

## Sample code

```jsx
import { useRoomExp } from '@daily-co/daily-react';
import { useCallback, useState } from 'react';

export const UseRoomExpDemo = () => {
  const [countdown, setCountdown] = useState('');
  const { ejectDate } = useRoomExp({
    onCountdown: useCallback(({ hours, minutes, seconds }) => {
      if (hours > 0) return;

      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, []),
  });

  return (
    <div>
      Meeting ends in {countdown} (at {ejectDate.toISOString()})
    </div>
  );
};
```

* * *

[Previous](/reference/daily-react/use-room)

[Next](/reference/daily-react/use-screen-share)

---

---
url: https://docs.daily.co/reference/daily-react/use-screen-share
title: useScreenShare
---

# useScreenShare

# useScreenShare

`useScreenShare(params?): Object`

Returns a list of running screen shares and their states, along with helper methods that wrap `daily-js` screen share events.

`useScreenShare` can also be used to set up optional callbacks for the `local-screen-share-started` and `local-screen-share-stopped` events.

## Params (optional)

An object with the following properties:

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `onError` |  | `Function` | Callback for the nonfatal-error event with type 'screen-share-error' |
| `onLocalScreenShareStarted` |  | `Function` | Callback for the local-screen-share-started event |
| `onLocalScreenShareStopped` |  | `Function` | Callback for the local-screen-share-stopped event |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `isSharingScreen` | `boolean` | Indicates whether the local user is sharing a screen |
| `screens` | `Array` | Array of `screens`. See `screens` object properties |
| `startScreenShare` | `Function` | See startScreenShare() |
| `stopScreenShare` | `Function` | See stopScreenShare() |

### screens properties

| Name | Type | Description |
| :-- | :-- | :-- |
| `audio` | `Object` | Track state for associated `screenAudio`, see `tracks` properties for details |
| `local` | `boolean` | Indicates if this is a local screen share |
| `screen_id` | `string` | Unique identifier for the screen |
| `session_id` | `string` | Unique identifier for the participant screen sharing |
| `video` | `Object` | Track state for associated `screenVideo`, see `tracks` properties for details |

JSON

Copy to clipboard

```

1

{

2

  "isSharingScreen": false,

3

  "screens": \[{

4

    "audio": <Object>,

5

    "local": true,

6

    "screen\_id": "25bfe2e4-3a3d-4c6f-b877-392ce7c998e4-screen",

7

    "session\_id": "25bfe2e4-3a3d-4c6f-b877-392ce7c998e4",

8

    "video": <Object>,

9

  }\],

10

  "startScreenShare": <Function>,

11

  "stopScreenShare": <Function>,

12

}

13

```

## Sample code

JSX

Copy to clipboard

```

1

import { useScreenShare } from '@daily-co/daily-react';

2

3

export const UseScreenShareDemo = () => {

4

  const state = useScreenShare();

5

6

  return <div>Sharing Screen: {state?.isSharingScreen}</div>;

7

};

8

```

* * *

[Previous]

[Next]

---

---
url: https://docs.daily.co/reference/daily-react/use-send-settings
title: useSendSettings
---

# useSendSettings

# useSendSettings

`useSendSettings(params?): Object`

`useSendSettings` is a convenience hook around `getSendSettings()` and `updateSendSettings()`. Use this hook to configure simulcast layer encodings and to control which layers a client publishes. More information in the `updateSendSettings()` docs.

## Params (optional)

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `onSendSettingsUpdated` | `Function` | Callback for the `'send-settings-updated'` event |

## Return type

Returns an object with the following properties:

| Name | Type | Description |
| --- | --- | --- |
| `sendSettings` | `DailySendSettings | null` | The send settings for the participant. See `daily-js` instance method `getSendSettings()` for an overview |
| `updateSendSettings` | `Function` | Updates send settings, equivalent to calling the `daily-js` `updateSendSettings()` method |

## Sample code

JSX

```

1

import { useSendSettings } from '@daily-co/daily-react';

2

3

export const SendSettings = () => {

4

  const { sendSettings } = useSendSettings();

5

  return (

6

    <div>

7

      <strong>Current send settings</strong>

8

      <pre>{JSON.stringify(sendSettings, null, 2)}</pre>

9

    </div>

10

  );

11

};

12

```

* * *

[Previous](/reference/daily-react/use-screen-share)

[Next](/reference/daily-react/use-throttled-daily-event)

---

---
url: https://docs.daily.co/reference/daily-react/use-throttled-daily-event
title: useThrottledDailyEvent
---

# useThrottledDailyEvent

`useThrottledDailyEvent(params): void`

Registers `daily-js` event listeners. The listeners are automatically torn down when a component or hook calling `useThrottledDailyEvent` gets unmounted. In comparison to `useDailyEvent`, the callback passed here will be called with an array of event objects. The throttled event queue is automatically cleared when `daily-js` emits the `'call-instance-destroyed'` event.

## Params

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `event` | ✓ | `string` or `string[]` | The `daily-js` event(s) to register |
| `callback` | ✓ | `Function` | A memoized callback reference to run when the event(s) get emitted |
| `throttleTimeout` |  | `integer` | The minimum waiting time until the callback is called again. Default: `100` |

The `callback` param has to be a memoized reference (e.g. via `useCallback`). Otherwise a console error might be thrown indicating a re-render loop.

## Return type

-   `void`

## Sample code

JSX

```

import { useThrottledDailyEvent } from '@daily-co/daily-react';

import { useCallback, useState } from 'react';

export const DailyEventDemo = () => {

  const [hasEmmaJoined, setHasEmmaJoined] = useState(false);

  useThrottledDailyEvent(

    'participant-joined',

    useCallback((evts) => {

      if (evts.some(({ participant }) => participant.user_name === 'Emma')) {

        setHasEmmaJoined(true);

      }

    }, [])

  );

  return <div>Is Emma there yet? {hasEmmaJoined ? 'Yes!' : 'No.'}</div>;

};

```

## Sample code for multiple events

JSX

```

import { useThrottledDailyEvent } from '@daily-co/daily-react';

import { useCallback, useState } from 'react';

export const DailyEventDemo = () => {

  const [count, setCount] = useState(0);

  useThrottledDailyEvent(

    ['participant-joined', 'participant-left'],

    useCallback((events) => {

      setCount((c) => {

        let i = c;

        events.forEach((event) => {

          switch (event.action) {

            case 'participant-joined':

              i++;

              break;

            case 'participant-left':

              i--;

              break;

          }

        });

        return i;

      });

    }, [])

  );

  return (

    <div>

      {count === 1

        ? 'There is 1 person in the call'

        : `There are ${count} people in the call.`}

    </div>

  );

};

```

## Related references

-   [useDailyEvent()](/reference/daily-react/use-daily-event)

[Previous](/reference/daily-react/use-send-settings)

[Next](/reference/daily-react/use-transcription)

---

---
url: https://docs.daily.co/reference/daily-react/use-transcription
title: useTranscription
---

# useTranscription

# useTranscription

`useTranscription(params?) : Object`

Returns information about a meeting's current transcription state, along with helper functions that wrap `daily-js` transcription related methods.

`useTranscription` can also be used to set up optional callbacks for transcription events.

## Params (optional)

An object with the following optional properties:

|  | Parameter | Type | Description |
| :-- | :-- | :-- | :-- |
|  | `onTranscriptionError` | `Function` | Callback for the transcription error event |
|  | `onTranscriptionMessage` | `Function` | Callback for the transcription message event |
|  | `onTranscriptionStarted` | `Function` | Callback for the transcription started event |
|  | `onTranscriptionStopped` | `Function` | Callback for the transcription stopped event |
| Deprecated 0.18.0 | `onTranscriptionAppData` | `Function` | Callback for the app message event from transcription |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `error` | `boolean` | `true` in the event of a transcription error |
| `isTranscribing` | `boolean` | Returns `true` after transcription has started |
| `language` | `string` | Returns the language applied for the transcription. Please check Deepgram's language docs for details. |
| `model` | `string` | Returns the model applied for transcription. Please check Deepgram's model docs for more details. |
| `profanity_filter` | `boolean` | Returns `true` when profanity filter is enabled. Please check Deepgram's profanity filter docs for more details. |
| `redact` | `boolean` or `array` | Returns the redaction applied for transcription. Please check Deepgram's redaction docs for more details. |
| `startedBy` | `string` | Returns the `session_id` for the participant who initiated the transcription |
| `startTranscription` | `Function` | See `daily-js` startTranscription() |
| `stopTranscription` | `Function` | See `daily-js` stopTranscription() |
| `tier` | `string` | This field is deprecated, use `model` instead |
| `transcriptions` | `Transcription[]` | Array of `Transcription` object. See Transcription for more information. |
| `transcriptionStartDate` | `Date` | Timestamp for when the transcription started |
| `updatedBy` | `string` | Returns the `session_id` for the participant who updated the transcription most recently |

JSON

Copy to clipboard

```

1

{

2

  "error": false,

3

  "isTranscribing": true,

4

  "language": "en",

5

  "model": "nova-2-general",

6

  "profanity\_filter": false,

7

  "redact": "false",

8

  "startedBy": "0e92c476-3d2f-4ddc-b814-9447cd7e3b90",

9

  "startTranscription": <Function>,

10

  "stopTranscription": <Function>,

11

  "transcriptions": <Object>,

12

  "transcriptionStartDate": "Mon Sept 05 2022 10:33:30 GMT+0200 (Central European Summer Time)",

13

  "updatedBy": "0e92c476-3d2f-4ddc-b814-9447cd7e3b90"

14

}

15

```

## Sample code

JSX

Copy to clipboard

```

1

import { useTranscription } from '@daily-co/daily-react';

2

3

export const useTranscriptionDemo \= () \=> {

4

  const { isTranscribing } \= useTranscription();

5

6

  return <div\>{!isTranscribing ? 'Not' : ''} transcribing</div\>;

7

};

8

```

* * *

[Previous](/reference/daily-react/use-throttled-daily-event)

[Next](/reference/daily-react/use-waiting-participants)

---

---
url: https://docs.daily.co/reference/daily-react/use-waiting-participants
title: useWaitingParticipants
---

# useWaitingParticipants

# useWaitingParticipants

`useWaitingParticipants(params?): Object`

Returns an object containing an array of all participants waiting for access to the call, along with methods to grant or deny access.

`useWaitingParticipants` can also be used to set up optional callbacks for waiting-participant-added, waiting-participant-updated, and waiting-participant-removed events.

## Params (optional)

An object with the following properties:

| Parameter | Required | Type | Description |
| :-- | :-: | :-- | :-- |
| `onWaitingParticipantAdded` |  | `Function` | Callback for the waiting-participant-added event |
| `onWaitingParticipantUpdated` |  | `Function` | Callback for the waiting-participant-updated event |
| `onWaitingParticipantRemoved` |  | `Function` | Callback for the waiting-participant-removed event |

## Return type

An object with the following properties:

| Name | Type | Description |
| :-- | :-- | :-- |
| `waitingParticipants` | `Object[]` | Details waiting participants, see waitingParticipants() |
| `grantAccess(id: '*' | string)` | `Function` | Can be used to admit entry to waiting participants. Admits all participants if '*' is passed, or a specific participant if a string session_id is specified |
| `denyAccess(id: '*' | string)` | `Function` | Can be used to deny entry to waiting participants. Denies all participants if '*' is passed, or a specific participant if a string session_id is specified |

## Sample code

JSX

Copy to clipboard

```

1

import { useWaitingParticipants } from '@daily-co/daily-react';

2

3

export const UseWaitingParticipantsDemo = () => {

4

  const { waitingParticipants } = useWaitingParticipants();

5

6

  return <div>Waiting participants: {waitingParticipants.length}</div>;

7

};

8

```

## Related references

-   useActiveParticipant()
-   useActiveSpeakerId()
-   useLocalParticipant()
-   useLocalSessionId()
-   useParticipantCounts()
-   useParticipantIds()
-   useParticipantProperty()
-   useParticipant()

* * *

[Previous](/reference/daily-react/use-transcription)

Next