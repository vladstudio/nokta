---
title: "Using A Synchronizer | TinyBase"
url: https://tinybase.org/guides/synchronization/using-a-synchronizer
---

The synchronizer module framework lets you synchronize [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) data between different devices, systems, or subsystems.

It contains the [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) interface, describing objects which can be used to synchronize a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/).

Under the covers, a [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) is actually a very specialized type of [`Persister`](/api/the-essentials/persisting-stores/persister/) that _only_ supports [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) objects, and which has a [`startSync`](/api/synchronizers/interfaces/synchronizer/synchronizer/methods/synchronization/startsync/) method and a [`stopSync`](/api/synchronizers/interfaces/synchronizer/synchronizer/methods/synchronization/stopsync/) method.

### Types Of [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/)

In TinyBase v5.0, there are three types of [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/):

-   The [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/) uses WebSockets to communicate between different systems.
-   The [`BroadcastChannelSynchronizer`](/api/synchronizer-broadcast-channel/interfaces/synchronizer/broadcastchannelsynchronizer/) uses the browser's BroadcastChannel API to communicate between different tabs and workers.
-   The [`LocalSynchronizer`](/api/synchronizer-local/interfaces/synchronizer/localsynchronizer/) demonstrates synchronization in memory on a single local system.

Of course it is also possible to create custom [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) objects if you have a transmission medium that allows the synchronization messages to be sent reliably between clients.

### Synchronizing With WebSockets

A common pattern for synchronizing over the web is to use WebSockets. This allows multiple clients to pass lightweight messages to each other, facilitating efficient synchronization.

One thing to understand is that this set up will typically require a server. This can be a relatively 'thin server' - it does not need to store data of its own - but is needed to keep a list of clients that are being synchronized together, and route and broadcast messages between the clients.

TinyBase includes some implementations of WebSocket servers:

-   [`WsServer`](/api/synchronizer-ws-server/interfaces/server/wsserver/), created with the [`createWsServer`](/api/synchronizer-ws-server/functions/creation/createwsserver/) function in the [`synchronizer-ws-server`](/api/synchronizer-ws-server/) module. This includes the option to persist data in the server.
-   [`WsServerSimple`](/api/synchronizer-ws-server-simple/interfaces/server/wsserversimple/), created with the [`createWsServerSimple`](/api/synchronizer-ws-server-simple/functions/creation/createwsserversimple/) function in the [`synchronizer-ws-server-simple`](/api/synchronizer-ws-server-simple/) module. This does not have the complications of listeners, persistence, or statistics, and is suitable to be used as a reference implementation
-   [`WsServerDurableObject`](/api/the-essentials/synchronizing-stores/wsserverdurableobject/), implemented as Cloudflare Durable Object, created by extending the [`WsServerDurableObject`](/api/the-essentials/synchronizing-stores/wsserverdurableobject/) class, and routed with the convenient [`getWsServerDurableObjectFetch`](/api/synchronizer-ws-server-durable-object/functions/creation/getwsserverdurableobjectfetch/) function.

Here we'll use the regular [`WsServer`](/api/synchronizer-ws-server/interfaces/server/wsserver/). You simply need to create it, instantiated with a configured WebSocketServer object from the `ws` package:

```
// On a server machine:
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {WebSocketServer} from 'ws';

const server = createWsServer(new WebSocketServer({port: 8048}));
```

This sets up a [`WsServer`](/api/synchronizer-ws-server/interfaces/server/wsserver/) object, listening on port 8048.

Each client then needs to create a [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/) object, instantiated with the [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) being synchronized, and a WebSocket configured to connect to the aforementioned server:

```
// On the first client machine:
import {createMergeableStore} from 'tinybase';
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {WebSocket} from 'ws';

const clientStore1 = createMergeableStore();
const clientSynchronizer1 = await createWsSynchronizer(
  clientStore1,
  new WebSocket('ws://localhost:8048'),
);
```

This [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/) can then be started, and data manipulated as normal:

```
await clientSynchronizer1.startSync();
clientStore1.setCell('pets', 'fido', 'species', 'dog');
// ...
```

Meanwhile, on another client, an empty [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) and another [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/) can be created and started, connecting to the same server.

```
// On the second client machine:
const clientStore2 = createMergeableStore();
const clientSynchronizer2 = await createWsSynchronizer(
  clientStore2,
  new WebSocket('ws://localhost:8048'),
);
await clientSynchronizer2.startSync();
```

Once the synchronization is started, the server will broker the messages being passed back and forward between the two clients, and the data will be synchronized. The empty second [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) will be populated with the data from the first:

```
// ...
console.log(clientStore2.getTables());
// -> {pets: {fido: {species: 'dog'}}}
```

And of course the synchronization is bi-directional:

```
clientStore2.setCell('pets', 'felix', 'species', 'cat');
console.log(clientStore2.getTables());
// -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
```

```
// ...
console.log(clientStore1.getTables());
// -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}
```

When done, it's important to destroy a [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/) to close and tidy up the client WebSockets:

```
await clientSynchronizer1.destroy();
```

```
await clientSynchronizer2.destroy();
```

And, if shut down, the [`WsServer`](/api/synchronizer-ws-server/interfaces/server/wsserver/) should also be explicitly destroyed to close its listeners:

```
await server.destroy();
```

#### [Persisting Data](/guides/schemas-and-persistence/persisting-data/) On The Server

New in TinyBase v5.1, the [`createWsServer`](/api/synchronizer-ws-server/functions/creation/createwsserver/) function lets you specify a way to persist data to the server. This makes it possible for all clients to disconnect from a path, but, when they reconnect, for the data to still be present for them to sync with.

This is done by passing in a second argument to the function that creates a [`Persister`](/api/the-essentials/persisting-stores/persister/) instance (for which also need to create or provide a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/)) for a given path:

```
import {createFilePersister} from 'tinybase/persisters/persister-file';

const persistingServer = createWsServer(
  new WebSocketServer({port: 8050}),
  (pathId) =>
    createFilePersister(
      createMergeableStore(),
      pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
    ),
);

await persistingServer.destroy();
```

This is a very crude example, but demonstrates a server that will create a file, based on any path that clients connect to, and persist data to it. In production, you will certainly want to sanitize the file name! And more likely you will want to explore using a database-oriented [`Persister`](/api/the-essentials/persisting-stores/persister/) instead of simply using raw files.

See the [`createWsServer`](/api/synchronizer-ws-server/functions/creation/createwsserver/) function documentation for more details.

Also note that there is a [`synchronizer-ws-server-simple`](/api/synchronizer-ws-server-simple/) module that contains a simple server implementation called [`WsServerSimple`](/api/synchronizer-ws-server-simple/interfaces/server/wsserversimple/). Without the complications of listeners, persistence, or statistics, this is more suitable to be used as a reference implementation for other server environments.

### Synchronizing Over The Browser BroadcastChannel

There may be situations where you need to synchronize data between different parts of a browser. For example, you might have a transient in-memory [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) driving your UI, but then another instance in a Service Worker that can be persisted to (say) IndexedDB or another medium.

To facilitate keeping these in sync, the [`BroadcastChannelSynchronizer`](/api/synchronizer-broadcast-channel/interfaces/synchronizer/broadcastchannelsynchronizer/) lets you synchronize over the browser's BroadcastChannel API, common to each browser sub-system. You simply need to provide a distinguishing channel name that can be used to identify what the two parts should be using to send and receive messages.

For example, in the UI part of your app:

```
import {createBroadcastChannelSynchronizer} from 'tinybase/synchronizers/synchronizer-broadcast-channel';

const frontStore = createMergeableStore();
const frontSynchronizer = createBroadcastChannelSynchronizer(
  frontStore,
  'syncChannel',
);
await frontSynchronizer.startSync();
```

And then in the service worker:

```
const backStore = createMergeableStore();
const backSynchronizer = createBroadcastChannelSynchronizer(
  backStore,
  'syncChannel',
);
await backSynchronizer.startSync();
```

Since they both share the `syncChannel` channel name, the data of the two is now synchronized:

```
frontStore.setCell('pets', 'fido', 'species', 'dog');
```

```
// ...
console.log(backStore.getTables());
// -> {pets: {fido: {species: 'dog'}}}
```

And so on!

When finished, these synchronizers should also be explicitly destroyed to ensure the channel listeners are cleaned up:

```
await frontSynchronizer.destroy();
```

```
await backSynchronizer.destroy();
```

### Wrapping Up

The [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) interface provides an easy way to keep multiple TinyBase MergeableStores in sync. The WebSocket and BroadcastChannel options above allow for numerous interesting and powerful app architectures - and they are not sufficient, consider exploring the [`createCustomSynchronizer`](/api/synchronizers/functions/creation/createcustomsynchronizer/) function to develop your own!