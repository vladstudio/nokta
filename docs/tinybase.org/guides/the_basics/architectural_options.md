---
title: "Architectural Options | TinyBase"
url: https://tinybase.org/guides/the-basics/architectural-options
---

This guide discusses some of the ways in which you can use TinyBase, and how you can architect it into the bigger picture of how your app is built.

Before we go any further, remember that TinyBase is an in-memory data store that runs within a JavaScript environment like a browser or a worker. Whilst it can theoretically stand alone in a simple app, you'll probably want to preserve, share, or sync the data between reloads and sessions.

Here are the options we'll discuss in this guide:

-   [Standalone TinyBase](#0-standalone-tinybase)
-   [Read-Only Cloud Data](#1-read-only-cloud-data)
-   [Browser Storage](#2-browser-storage)
-   [Client Database Storage](#3-client-database-storage)
-   [Client-Only Synchronization](#4-client-only-synchronization)
-   [Client-Server Synchronization](#5-client-server-synchronization)
-   [Third-Party Synchronization](#6-third-party-synchronization)

As you can see lot of what we'll be discussing is how to integrate TinyBase with different persistence and synchronization techniques - whether on the client or the server, or both. Let's go!

### 0\. Standalone TinyBase

In this option, a TinyBase [`Store`](/api/the-essentials/creating-stores/store/) is instantiated when the app runs. During its use, data is added or updated, and rendered accordingly. When the app is reloaded or closed, the data is lost.

-   **Pros**: This is very simple to set up, and good for prototyping small apps.
-   **Cons**: It's a transient experience and your users' data won't show up again if they refresh their browser, revisit the app later.

The [Todo App v1 (the basics)](/demos/todo-app/todo-app-v1-the-basics/) demo is a good example of how to get started with an app like this.

### 1\. Read-Only Cloud Data

As one way to enhance the standalone app option, you can use the TinyBase persistence framework to load data from a server when the app starts, and then store it in a [`Store`](/api/the-essentials/creating-stores/store/). This might be appropriate for an app that uses read-only structured data which is small enough to fit into memory (and fast enough to load at start up).

-   **Pros**: This is also relatively simple to set up, and good for data-centric or reference apps.
-   **Cons**: The data is not interactive (or at least, changes made locally will not be saved). At some point, the size of the data needed might start to challenge the browser's memory - or the time you are prepared to let the startup spinner run for! - after which local persistence and pagination might be preferable.

The [Movie Database](/demos/movie-database/) demo, the [Word Frequencies](/demos/word-frequencies/) demo, the [Car Analysis](/demos/car-analysis/) demo, and the [City Database](/demos/city-database/) demo are all good examples of this sort of 'read-only' app, each exercising different aspects of the TinyBase framework. The [Countries](/demos/countries/) demo also loads one of its stores from a server.

See the [`RemotePersister`](/api/persister-remote/interfaces/persister/remotepersister/) interface for more details on how to pull data down from a server. Note that it _is_ possible to configure that [`Persister`](/api/the-essentials/persisting-stores/persister/) to 'save' data back to the server, but for anything other than the simplest use-cases, you may want to consider using a [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) instead, so that multiple clients can edit data without conflict. We'll discuss that option later in this guide.

### 2\. Browser Storage

Another way to upgrade the standalone experience is to have TinyBase persist its data to the browser's storage. This way, the data or state can be preserved when the app is reloaded, or even when it is returned to in a later session. This is a basic 'local-only' approach.

-   **Pros**: This approach provides persistence of data and state between reloads and sessions.
-   **Cons**: Data is only stored in one particular browser on one particular device. The data may also get evicted (and its size limited) by the browser, depending on the storage used.

The [Todo App v1 (the basics)](/demos/todo-app/todo-app-v1-the-basics/) and the [Todo App v3 (persistence)](/demos/todo-app/todo-app-v3-persistence/) demo are good examples of how to get started with an app like this. Also see the [`SessionPersister`](/api/persister-browser/interfaces/persister/sessionpersister/) and [`LocalPersister`](/api/persister-browser/interfaces/persister/localpersister/) documentation for more details. Since v6.7, OPFS support is also available via the [`OpfsPersister`](/api/persister-browser/interfaces/persister/opfspersister/) interface.

### 3\. Client Database Storage

As well as its native storage techniques, there are now many options for running richer client-side databases, such as SQLite or PGLite, in the browser. These solutions typically rely on WASM packages to provide the database functionality and then store the underlying data in IndexedDB or OPFS. Similar database run times might also be provided natively in some client environments (like React Native or Node- or Bun-based solutions).

TinyBase can persist its own data to a relational database like this, either serialized as JSON or in a more structured relational form, where TinyBase tables map directly to database tables.

-   **Pros**: This approach provides more structured persistence of data with less likelihood of eviction. Relational data can also be queried or updated with SQL outside of TinyBase (though it will nevertheless react to those changes).
-   **Cons**: A WASM payload is required to provide the database functionality in the browser, increasing asset size, and some of these client solutions are still young and experimental.

See the [`SqliteWasmPersister`](/api/persister-sqlite-wasm/interfaces/persister/sqlitewasmpersister/) and [`PglitePersister`](/api/persister-pglite/interfaces/persister/pglitepersister/) documentation for two of the browser-based database solutions. [`ExpoSqlitePersister`](/api/persister-expo-sqlite/interfaces/persister/exposqlitepersister/) is appropriate for Expo-based React Native projects.

### 4\. Client-Only [Synchronization](/guides/synchronization/)

Regardless of the client storage solution you choose, you may want to synchronize data between clients, either because you're supporting single users with multiple devices, or multiple users sharing common data.

This relies on you instantiating your data in a TinyBase [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/), which captures metadata for deterministic synchronization. Each client then uses a [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) (such as the WebSocket-based [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/)) to negotiate changes with others. WebSockets require a lightweight server that can forward and broadcast messages between clients.

-   **Pros**: This approach lets users share data between devices or with each other. Combined with client storage, this can also support offline usage with eventual reconciliation.
-   **Cons**: There is technically no 'source of truth': each client negotiates to merge changes with each other. If all devices evict their client storage simultaneously, the data is lost.

See the [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) documentation and the [Synchronization](/guides/synchronization/) guide to understand how this works. The [Todo App v6 (collaboration)](/demos/todo-app/todo-app-v6-collaboration/) demo shows client-to-client synchronization for a simple to-do list application. The server is created, in a simple Node- or Bun-style environment with the [`createWsServer`](/api/synchronizer-ws-server/functions/creation/createwsserver/) function.

### 5\. Client-Server [Synchronization](/guides/synchronization/)

From here it is only a simple step to add server storage into the mix, removing the risk of all client devices clearing their data simultaneously and it being lost.

Here, the synchronizer server (which is coordinating messages between clients) _also_ acts as a 'client' with an instance of TinyBase itself. This is most usefully then persisted to a server storage solution, such as SQLite, PostgreSQL, the file system, or a Cloudflare Durable Object.

-   **Pros**: The server can now be considered a more permanent 'source of truth' than clients. Authentication and data integrity can now be more easily enforced.
-   **Cons**: The only minor downside of this approach is the need for the server to have a copy of the TinyBase store in memory, so the default solutions page it in and out from the persisted storage when clients connect or disconnect.

See the [`createWsServer`](/api/synchronizer-ws-server/functions/creation/createwsserver/) function for details of how to create a persister for the synchronization server, such as [`Sqlite3Persister`](/api/persister-sqlite3/interfaces/persister/sqlite3persister/) or [`PostgresPersister`](/api/persister-postgres/interfaces/persister/postgrespersister/).

A reliable all-in-one solution is to run both synchronization and storage on Cloudflare. Check out the [Cloudflare Durable Objects](/guides/integrations/cloudflare-durable-objects/) guide and the dedicated [Vite starter template](https://github.com/tinyplex/vite-tinybase-ts-react-sync-durable-object) to see how to set this up. This approach can use either the [`DurableObjectStoragePersister`](/api/persister-durable-object-storage/interfaces/persister/durableobjectstoragepersister/) (for KV-based storage) or the [`DurableObjectSqlStoragePersister`](/api/persister-durable-object-sql-storage/interfaces/persister/durableobjectsqlstoragepersister/) (for SQLite-based storage) to persist data in a Durable Object.

### 6\. Third-Party [Synchronization](/guides/synchronization/)

For completeness, it's worth mentioning that TinyBase can also integrate with other database and synchronization platforms. In these cases, you simply persist data locally and the third-party service takes care of the synchronization to a server or cloud service.

(It is also possible to persist your data via two other open-source CRDT solutions, namely Yjs and Automerge, using the [`YjsPersister`](/api/persister-yjs/interfaces/persister/yjspersister/) and [`AutomergePersister`](/api/persister-automerge/interfaces/persister/automergepersister/) interfaces respectively.)

-   **Pros**: You can add TinyBase into applications that are already using a third-party synchronization platform. Conversely you can then abstract away your choice of synchronization platform behind a consistent TinyBase API, preventing vendor lock-in.
-   **Cons**: This approach adds additional moving parts, other libraries, and possible fees for commercial services, based on usage.

For more details on these interfaces, see the [`ElectricSqlPersister`](/api/persister-electric-sql/interfaces/persister/electricsqlpersister/), [`PowerSyncPersister`](/api/persister-powersync/interfaces/persister/powersyncpersister/), and [`LibSqlPersister`](/api/persister-libsql/interfaces/persister/libsqlpersister/) (Turso) interfaces. The APIs, consistent with the other SQLite- and PostgreSQL-based persisters, are described in the [Database Persistence](/guides/persistence/database-persistence/) guide.

### Mix It Up!

It should go without saying that very few of these options are mutually exclusive! You can mix and match them as you see fit, depending on the way you want your persistence and synchronization to work. Not only that, you can of course have multiple Stores in your app, each with its own persistence and synchronization strategy.

For example, a complex app might have multiple TinyBase stores use in lots of different ways:

-   Transient state that is stored just in memory and not preserved between sessions.
-   Views, routes and settings that are stored in the browser's local storage.
-   Reference data that is read in from a server at startup, perhaps then stored in a client database for faster future loads.
-   User documents that are synchronized between clients and a server, with the server persisting them as an 'source of truth'.

[TinyHub](https://tinyhub.org/#/) uses several of these techniques throughout its client app. Its [different stores](https://github.com/tinyplex/tinyhub/tree/main/client/src/stores) are each initialized with different persister strategies.

### Summary

TinyBase provides many different architectural choices, depending on the type of app you are building, and where you want the data to reside when not in use.

Next we will show how you can quickly build user interfaces on top of a [`Store`](/api/the-essentials/creating-stores/store/), and for that, it's time to proceed to the [Building UIs](/guides/building-uis/) guide.