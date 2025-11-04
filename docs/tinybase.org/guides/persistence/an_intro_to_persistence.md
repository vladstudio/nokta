---
title: "An Intro To Persistence | TinyBase"
url: https://tinybase.org/guides/persistence/an-intro-to-persistence
---

The persister module framework lets you save and load [`Store`](/api/the-essentials/creating-stores/store/) data to and from different locations, or underlying storage types.

Remember that TinyBase Stores are in-memory data structures, so you will generally want to use a [`Persister`](/api/the-essentials/persisting-stores/persister/) to store that data longer-term. For example, they are useful for preserving [`Store`](/api/the-essentials/creating-stores/store/) data between browser sessions or reloads, saving or loading browser state to or from a server, saving [`Store`](/api/the-essentials/creating-stores/store/) data to disk in a environment with filesystem access, or, in v4.0 and above, to SQLite, PostgreSQL, or CRDT frameworks like [Yjs](https://yjs.dev/) and [Automerge](https://automerge.org/).

### Types of Persisters

Many entry points are provided (in separately installed modules), each of which returns different types of [`Persister`](/api/the-essentials/persisting-stores/persister/) that can load and save a [`Store`](/api/the-essentials/creating-stores/store/). Between them, these allow you to store your TinyBase data locally, remotely, to databases, and across synchronization boundaries with CRDT frameworks.

#### Basic Persisters

These are reasonably simple Persisters that generally load and save a JSON-serialized version of your [`Store`](/api/the-essentials/creating-stores/store/). They are good for smaller data sets and where you need to have something saved in a basic browser or server environment.

#### Database Persisters

These are Persisters that can load and save either a JSON-serialized, or tabular version of your [`Store`](/api/the-essentials/creating-stores/store/) into a database. They are good for larger data sets, often on a server - but can also work in a browser environment when a SQLite instance is available.

[`Persister`](/api/the-essentials/persisting-stores/persister/)

Storage

[`Sqlite3Persister`](/api/persister-sqlite3/interfaces/persister/sqlite3persister/)

SQLite in Node, via [sqlite3](https://github.com/TryGhost/node-sqlite3)

[`SqliteBunPersister`](/api/persister-sqlite-bun/interfaces/persister/sqlitebunpersister/)

SQLite in Bun, via [bun:sqlite](https://bun.sh/docs/api/sqlite)

[`SqliteWasmPersister`](/api/persister-sqlite-wasm/interfaces/persister/sqlitewasmpersister/)

SQLite in a browser, via [sqlite-wasm](https://github.com/tomayac/sqlite-wasm)

[`ExpoSqlitePersister`](/api/persister-expo-sqlite/interfaces/persister/exposqlitepersister/)

SQLite in React Native, via [expo-sqlite](https://github.com/expo/expo/tree/main/packages/expo-sqlite)

[`ReactNativeSqlitePersister`](/api/persister-react-native-sqlite/interfaces/persister/reactnativesqlitepersister/)

SQLite in React Native, via [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)

[`CrSqliteWasmPersister`](/api/persister-cr-sqlite-wasm/interfaces/persister/crsqlitewasmpersister/)

SQLite CRDTs, via [cr-sqlite-wasm](https://github.com/vlcn-io/cr-sqlite)

[`ElectricSqlPersister`](/api/persister-electric-sql/interfaces/persister/electricsqlpersister/)

Electric SQL, via [electric](https://github.com/electric-sql/electric)

[`LibSqlPersister`](/api/persister-libsql/interfaces/persister/libsqlpersister/)

LibSQL for Turso, via [libsql-client](https://github.com/tursodatabase/libsql-client-ts)

[`PowerSyncPersister`](/api/persister-powersync/interfaces/persister/powersyncpersister/)

PowerSync, via [powersync-sdk](https://github.com/powersync-ja/powersync-js)

[`PostgresPersister`](/api/persister-postgres/interfaces/persister/postgrespersister/)

PostgreSQL, via [postgres](https://github.com/porsager/postgres)

[`PglitePersister`](/api/persister-pglite/interfaces/persister/pglitepersister/)

PostgreSQL, via [PGlite](https://github.com/electric-sql/pglite)

See the [Database Persistence](/guides/persistence/database-persistence/) guide for details on how to work with databases.

#### Durable Object Persisters

These Persisters are designed to work with Durable Objects, which are a specialized type of server-side storage provided by CloudFlare. In conjunction with a [`WsServerDurableObject`](/api/the-essentials/synchronizing-stores/wsserverdurableobject/), they allow you to synchronize clients and then also persist data in a Durable Object, either in its key-value, or SQlite storage form.

#### Third-Party CRDT & Socket Persisters

These Persisters can bind your [`Store`](/api/the-essentials/creating-stores/store/) into third-party CRDT frameworks, or synchronize over sockets to PartyKit.

See the [Third-Party CRDT Persistence](/guides/persistence/third-party-crdt-persistence/) guide for more complex synchronization with the CRDT frameworks.

There is also a way to develop custom Persisters of your own, which we describe in the [Custom Persistence](/guides/persistence/custom-persistence/) guide.

### [`Persister`](/api/the-essentials/persisting-stores/persister/) Operations

A [`Persister`](/api/the-essentials/persisting-stores/persister/) lets you explicitly save or load data, with the [`save`](/api/persisters/interfaces/persister/persister/methods/save/save/) method and the [`load`](/api/persisters/interfaces/persister/persister/methods/load/load/) method respectively. These methods are both asynchronous (since the underlying data storage may also be) and return promises. As a result you should use the `await` keyword to call them in a way that guarantees subsequent execution order.

In this example, a [`Persister`](/api/the-essentials/persisting-stores/persister/) saves data to, and loads it from, the browser's session storage:

```
import {createStore} from 'tinybase';
import {createSessionPersister} from 'tinybase/persisters/persister-browser';

const store = createStore()
  .setValues({employees: 3})
  .setTables({pets: {fido: {species: 'dog'}}});
const persister = createSessionPersister(store, 'petStore');

await persister.save();
console.log(sessionStorage.getItem('petStore'));
// -> '[{"pets":{"fido":{"species":"dog"}}},{"employees":3}]'

sessionStorage.setItem(
  'petStore',
  '[{"pets":{"toto":{"species":"dog"}}},{"employees":4}]',
);
await persister.load();
console.log(store.getTables());
// -> {pets: {toto: {species: 'dog'}}}
console.log(store.getValues());
// -> {employees: 4}

sessionStorage.clear();
```

### Automatic Loading and Saving

When you don't want to deal with explicit persistence operations, a [`Persister`](/api/the-essentials/persisting-stores/persister/) object also provides automatic saving and loading. Automatic saving listens for changes to the [`Store`](/api/the-essentials/creating-stores/store/) and persists the data immediately. Automatic loading listens (or polls) for changes to the persisted data and reflects those changes in the [`Store`](/api/the-essentials/creating-stores/store/).

You can start automatic saving or loading with the [`startAutoSave`](/api/persisters/interfaces/persister/persister/methods/save/startautosave/) method and [`startAutoLoad`](/api/persisters/interfaces/persister/persister/methods/load/startautoload/) method. The [`startAutoPersisting`](/api/persisters/interfaces/persister/persister/methods/lifecycle/startautopersisting/) method is a convenience wrapper to do both in one command. These methods are asynchronous since they will do an immediate save and load before starting to listen for subsequent changes. You can stop the behavior with the [`stopAutoSave`](/api/persisters/interfaces/persister/persister/methods/save/stopautosave/) method, [`stopAutoLoad`](/api/persisters/interfaces/persister/persister/methods/load/stopautoload/) method, the [`stopAutoPersisting`](/api/persisters/interfaces/persister/persister/methods/lifecycle/stopautopersisting/) method, and/or the [`destroy`](/api/metrics/interfaces/metrics/metrics/methods/lifecycle/destroy/) method.

In this example, both automatic loading and saving are configured:

```
await persister.startAutoPersisting([{pets: {fido: {species: 'dog'}}}, {}]);

store.delValues().setTables({pets: {felix: {species: 'cat'}}});
// ...
console.log(sessionStorage.getItem('petStore'));
// -> '[{"pets":{"felix":{"species":"cat"}}},{}]'

sessionStorage.setItem('petStore', '[{"pets":{"toto":{"species":"dog"}}},{}]');
// -> StorageEvent('storage', {storageArea: sessionStorage, key: 'petStore'})
// ...
console.log(store.getTables());
// -> {pets: {toto: {species: "dog"}}}

await persister.destroy();
sessionStorage.clear();
```

Note that the [`startAutoLoad`](/api/persisters/interfaces/persister/persister/methods/load/startautoload/) method also takes a default set of [`Tables`](/api/store/type-aliases/store/tables/) so that the [`Store`](/api/the-essentials/creating-stores/store/) can be instantiated with good data if the persistence layer is empty (such as when this is the first time the app has been executed).

### A Caveat

You may often want to have both automatic saving and loading of a [`Store`](/api/the-essentials/creating-stores/store/) so that changes are constantly synchronized (allowing basic state preservation between browser tabs, for example). The framework has some basic provisions to prevent race conditions - for example it will not attempt to save data if it is currently loading it and vice-versa - and will sequentially [`schedule`](/api/persisters/interfaces/persister/persister/methods/lifecycle/schedule/) methods that could cause race conditions.

That said, be aware that you should always comprehensively test your persistence strategy to understand the opportunity for data loss (in the case of trying to save data to a server under poor network conditions, for example).

To help debug such issues, since v4.0.4, the create methods for all [`Persister`](/api/the-essentials/persisting-stores/persister/) objects take an optional `onIgnoredError` argument. This is a handler for the errors that the [`Persister`](/api/the-essentials/persisting-stores/persister/) would otherwise ignore when trying to save or load data (such as when handling corrupted stored data). It's recommended you use this for debugging persistence issues, but only in a development environment. Database-based [`Persister`](/api/the-essentials/persisting-stores/persister/) objects also take an optional `onSqlCommand` argument for logging commands and queries made to the underlying database.

### Summary

Use the [`persisters`](/api/persisters/) module to load and save data from and to a variety of common persistence layers. When these don't suffice, you can also develop custom Persisters of your own.

Next we move on to look at how to fully synchronize TinyBase Stores with databases, particularly SQLite, in the [Database Persistence](/guides/persistence/database-persistence/) guide.