---
title: "Releases | TinyBase"
url: https://tinybase.org/guides/releases
---

This is a reverse chronological list of the major TinyBase releases, with highlighted features.

---

## v6.7

This release includes support for the Origin Private File System (OPFS) in a browser. The [`createOpfsPersister`](/api/persister-browser/functions/creation/createopfspersister/) function is the main entry point, and is available in the existing [`persister-browser`](/api/persister-browser/) module:

```
import {createStore} from 'tinybase';
import {createOpfsPersister} from 'tinybase/persisters/persister-browser';

const opfs = await navigator.storage.getDirectory();
const handle = await opfs.getFileHandle('tinybase.json', {create: true});

const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
const persister = createOpfsPersister(store, handle);

await persister.save();
// Store JSON will be saved to the OPFS file.

await persister.load();
// Store JSON will be loaded from the OPFS file.

await persister.destroy();
```

That's it! If you've used other TinyBase persisters, this API should be easy and familiar to use.

One caveat: observability in OPFS is not yet standardized in browsers. This means that the auto-load functionality of the persister may not work as expected, although a best effort is made using the experimental FileSystemObserverAPI, so please let us know how that works!

---

## v6.6

This release improves the Inspector tool, making it easier to debug, inspect, and mutate your TinyBase stores.

![Inspector](/inspector.webp "Inspector")

As well as a modernized UI, new in this release is the ability to create, duplicate, or delete tables, rows, values and cells directly within the Inspector. Press the 'pencil' icon to start editing items, and then hover over the new icons to see how to manipulate the data.

See the [Inspecting Data](/guides/inspecting-data/) guide for more information about how to use the Inspector in your application during development.

## v6.5

This release includes the new [`persister-react-native-mmkv`](/api/persister-react-native-mmkv/) module, which allows you to persist data in a React Native MMKV store via the [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) library.

Usage should be as simple as this:

```
import {createMMKV} from 'react-native-mmkv';
import {createReactNativeMmkvPersister} from 'tinybase/persisters/persister-react-native-mmkv';

const storage = createMMKV();
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
const persister = createReactNativeMmkvPersister(store, storage);

await persister.save();
// Store will be saved to the MMKV store.
```

A huge shout out to [Jérémy Barbet](https://github.com/JeremyBarbet) for this new persister!

---

## v6.4

This release includes the new [`persister-react-native-sqlite`](/api/persister-react-native-sqlite/) module, which allows you to persist data in a React Native SQLite database via the [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage) library.

Usage should be as simple as this:

```
import {enablePromise, openDatabase} from 'react-native-sqlite-storage';
import {createStore} from 'tinybase';
import {createReactNativeSqlitePersister} from 'tinybase/persisters/persister-react-native-sqlite';

enablePromise(true);
const db = await openDatabase({name: 'my.db', location: 'default'});
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
const persister = createReactNativeSqlitePersister(store, db);

await persister.save();
// Store will be saved to the database.
```

Please let us know how you get on with this new [`Persister`](/api/the-essentials/persisting-stores/persister/), and if you have any feedback or suggestions.

---

## v6.3

This release includes the new [`persister-durable-object-sql-storage`](/api/persister-durable-object-sql-storage/) module, which allows you to persist data in a Cloudflare Durable Object's SQLite-based storage in conjunction with websocket-based synchronization (using the [`WsServerDurableObject`](/api/the-essentials/synchronizing-stores/wsserverdurableobject/) class).

Huge thanks to [Corey Jepperson](https://github.com/acoreyj) for implementing the entirety of this functionality!

```
import {createMergeableStore} from 'tinybase';
import {createDurableObjectSqlStoragePersister} from 'tinybase/persisters/persister-durable-object-sql-storage';
import {WsServerDurableObject} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';

const config = {
  mode: 'fragmented',
  storagePrefix: 'my_app_',
};

export class MyDurableObject extends WsServerDurableObject {
  createPersister() {
    const store = createMergeableStore();
    const persister = createDurableObjectSqlStoragePersister(
      store,
      this.ctx.storage.sql,
      config,
    );
    return persister;
  }
}
```

Prior to this release, the only way to persist data in a Durable Object was to use the [`persister-durable-object-storage`](/api/persister-durable-object-storage/) module, which uses CloudFlare's key-value storage backend behind the scenes.

However, Cloudflare's SQLite storage backend for Durable Objects offers significantly better pricing compared to the key-value storage backend. The SQLite storage backend is Cloudflare's recommended storage option for new Durable Object namespaces.

Note that, before using this persister, you must configure your Durable Object class to use SQLite storage by adding a migration to your `wrangler.toml` or `wrangler.json` configuration file. Use `new_sqlite_classes` in your migration configuration to enable SQLite storage for your Durable Object class. See the module documentation for more information.

This release also addresses a local-storage persistence issue, #[257](https://github.com/tinyplex/tinybase/issues/257).

---

## v6.2

This release contains various packaging improvements and exposes some internal HLC functions that are useful for people building their own persisters or synchronizers.

### New `omni` module

There is a new `omni` module that is an explicit superset of everything in the TinyBase ecosystem. It exports the features and functionality of every `tinybase/*` module, including every persister, every synchronizer, and every UI component. This is useful for applications that want to use multiple facets of the overall TinyBase ecosystem and also benefit from the fact they share a lot of code internally.

```
import {createStore, createSqliteBunPersister} from 'tinybase/omni';
```

However, it should go without saying that you should only use the `omni` module if you have an aggressive tree-shaking bundler that can remove all the persisters, synchronizers, and so on, that you do _not_ use. Experiment with different bundler configurations to see what works best for your usage.

### with-schema exports

This release changes the `package.json` exports slightly so that imports of both `/with-schema` and non-schema'd versions of the modules resolve to the same JavaScript file. This reduces bundle size for apps that use both schema and non-schema imports.

### HLC & hash functions

The [`common`](/api/common/) module (and hence tinybase module) now export the [`getHlcFunctions`](/api/common/functions/stamps/gethlcfunctions/) function. This returns set of seven functions that can be used to create and manipulate HLC (Hybrid Logical Clock) timestamps.

```
import {getHlcFunctions} from 'tinybase';
const [getNextHlc, seenHlc, encodeHlc] = getHlcFunctions();
```

There are also several functions to help hash tabular and key-value data in a way that is compatible with the internal [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) implementation. These include the [`getHash`](/api/common/functions/hash/gethash/) function and the [`getCellHash`](/api/common/functions/hash/getcellhash/) function, for example.

These are for pretty advanced use-cases! But you can use these in your own systems to ensure the timestamps and hashes are compatible with the ones generated in TinyBase [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) objects.

### Moved types

The rarely-used [`GetNow`](/api/common/type-aliases/stamps/getnow/) and [`Hash`](/api/common/type-aliases/stamps/hash/) types have been moved from the [`mergeable-store`](/api/mergeable-store/) module into the [`common`](/api/common/) module.

---

## v6.1

### In Summary

-   [A new Persister for Bun](#bun-sqlite)'s embedded SQLite database.
-   [Subset persistence](#subset-persistence) to load subsets of tables into a [`Store`](/api/the-essentials/creating-stores/store/).
-   [Destructured object arguments](#destructured-object-arguments-for-sorted-row-ids) for sorted [`Row`](/api/store/type-aliases/store/row/) [`Id`](/api/common/type-aliases/identity/id/) methods and hooks.
-   [A new startAutoPersisting method](#new-startautopersisting-method).

And more!

### Bun SQLite

This release includes a new [`Persister`](/api/the-essentials/persisting-stores/persister/) for the [embedded SQLite database](https://bun.sh/docs/api/sqlite) available in the Bun runtime.

You use it by passing a reference to a Bun Database object into the [`createSqliteBunPersister`](/api/persister-sqlite-bun/functions/creation/createsqlitebunpersister/) function:

```
import {Database} from 'bun:sqlite';
import {createStore} from 'tinybase';
import {createSqliteBunPersister} from 'tinybase/persisters/persister-sqlite-bun';

const db = new Database(':memory:');
const store = createStore().setTables({pets: {fido: {species: 'dog'}}});
const persister = createSqliteBunPersister(store, db, 'my_tinybase');

await persister.save();
// Store will be saved to the database.

console.log(db.query('SELECT * FROM my_tinybase;').all());
// -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]

db.query(
  'UPDATE my_tinybase SET store = ' +
    `'[{"pets":{"felix":{"species":"cat"}}},{}]' WHERE _id = '_';`,
).run();
await persister.load();
console.log(store.getTables());
// -> {pets: {felix: {species: 'cat'}}}

await persister.destroy();
```

There's more information the documentation for the new [`persister-sqlite-bun`](/api/persister-sqlite-bun/) module.

### Subset persistence

Persisters that load and save data to an underlying database can now be configured to only load a _subset_ of the rows in a table into a [`Store`](/api/the-essentials/creating-stores/store/).

This is useful for reducing the amount of data that is loaded into memory, or for working with a subset of data that is relevant to the current user, for example.

Do this by specifying a `condition` in the [`Persister`](/api/the-essentials/persisting-stores/persister/) configuration. This is a single string argument which is used as a SQL `WHERE` clause when reading and observing data in the table.

For example, the following code will only load rows from the `pets` database table where the `sold` column is set to `0`:

```
const subsetPersister = createSqliteWasmPersister(store, sqlite3, db, {
  mode: 'tabular',
  tables: {
    load: {pets: {tableId: 'pets', condition: '$tableName.sold = 0'}},
    save: {pets: {tableName: 'pets', condition: '$tableName.sold = 0'}},
  },
});
```

See the '[Loading subsets of database tables](about:/guides/persistence/database-persistence/#loading-subsets-of-database-tables)' section of the [Database Persistence](/guides/persistence/database-persistence/) guide for more details. And a huge thank you to Jakub Riedl ([@jakubriedl](https://github.com/jakubriedl)) for landing this functionality!

### Destructured object arguments for sorted [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/)

The [`getSortedRowIds`](/api/store/interfaces/store/store/methods/getter/getsortedrowids/) method on the [`Store`](/api/the-essentials/creating-stores/store/) interface has a number of optional parameters and it can be tiresome to fill in the defaults if you only want to change the last one, for example. So this release introduces an override such that you can pass an object with the parameters as properties.

So instead of:

```
store.getSortedRowIds('pets', undefined, undefined, undefined, 10);
```

You can now do:

```
store.getSortedRowIds({tableId: 'pets', limit: 10});
```

This pattern is also made available to the [`addSortedRowIdsListener`](/api/store/interfaces/store/store/methods/listener/addsortedrowidslistener/) method, the [`useSortedRowIds`](/api/ui-react/functions/store-hooks/usesortedrowids/) hook, and the [`useSortedRowIdsListener`](/api/ui-react/functions/store-hooks/usesortedrowidslistener/) hook.

### New [`startAutoPersisting`](/api/persisters/interfaces/persister/persister/methods/lifecycle/startautopersisting/) method

The new [`startAutoPersisting`](/api/persisters/interfaces/persister/persister/methods/lifecycle/startautopersisting/) method and [`stopAutoPersisting`](/api/persisters/interfaces/persister/persister/methods/lifecycle/stopautopersisting/) method on the [`Persister`](/api/the-essentials/persisting-stores/persister/) interface act as convenience methods for starting (and stopping) both the automatic loading and saving of data.

### New createMergeableStore getNow parameter

The [`createMergeableStore`](/api/the-essentials/creating-stores/createmergeablestore/) function now takes an optional `getNow` argument that lets you override the clock used to generate HLC timestamps.

### Asynchronous [`Persister`](/api/the-essentials/persisting-stores/persister/) & [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) methods

Please note that some methods in the [`Persister`](/api/the-essentials/persisting-stores/persister/) and [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) APIs are now asynchronous. Although most implementations of these methods are synchronous, some (particularly for Postgres-based databases) are no longer so and you are recommended to await them all.

The [`stopAutoLoad`](/api/persisters/interfaces/persister/persister/methods/load/stopautoload/) method, the [`stopAutoSave`](/api/persisters/interfaces/persister/persister/methods/save/stopautosave/) method, and the [`destroy`](/api/metrics/interfaces/metrics/metrics/methods/lifecycle/destroy/) method in the base [`Persister`](/api/the-essentials/persisting-stores/persister/) interface have been marked asynchronous and return Promises. The [`stopSync`](/api/synchronizers/interfaces/synchronizer/synchronizer/methods/synchronization/stopsync/) method in the [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) interface and the [`destroy`](/api/metrics/interfaces/metrics/metrics/methods/lifecycle/destroy/) method in the [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) server interfaces should also be considered asynchronous.

---

## v6.0

This major release is about updating dependencies and infrastructure rather than adding new features.

The most notable changes for users are:

-   The package distribution only includes modern ESM packages (both minified and non-minified).
-   React 19 is now compatible as an optional peer dependency.
-   The tools module and TinyBase CLI have been removed.

If you have been using CJS or UMD packages, you will need to update your bundling strategy for TinyBase (in the same way that you will have had to have done for React 19, for example) but this change should be compatible with most packaging tools. If you had been using the library directly a browser, you should consider the [esm.sh](https://esm.sh/) CDN, as we have for our demos.

As a result of these changes, there have been some additional knock-on effects to the project and developer infrastructure as a whole. For example:

-   The test suite has been updated to use `react-testing-library` instead of `react-test-renderer`.
-   The React `jsx-runtime` is used for JSX transformations.
-   [Demos](/demos/) (and CodePen examples) have been updated to use an `importmap` mapping the modules to the [esm.sh](https://esm.sh/) CDN.
-   ESLint has finally been upgraded to v9.

Note that TinyBase v6.0 adds no new functionality, so you can afford to stay on v5.4.x for a while if these changes are somehow incompatible for you. However, all future functionality changes and bug fixes _will_ take effect as v6.x releases (and probably won't be back-ported to v5.4.x), so you should endeavor to upgrade as soon as you can.

Please let us know how these changes find you, and please file an issue on GitHub if you need help adapting to any of them.

---

## v5.4

### Durable Objects synchronization

This release contains a new WebSocket synchronization server that runs on Cloudflare as a Durable Object.

It's in the new [`synchronizer-ws-server-durable-object`](/api/synchronizer-ws-server-durable-object/) module, and you use it by extending the [`WsServerDurableObject`](/api/the-essentials/synchronizing-stores/wsserverdurableobject/) class. Use the [`getWsServerDurableObjectFetch`](/api/synchronizer-ws-server-durable-object/functions/creation/getwsserverdurableobjectfetch/) function for conveniently binding your Cloudflare Worker to your Durable Object:

```
import {
  WsServerDurableObject,
  getWsServerDurableObjectFetch,
} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';

export class MyDurableObject extends WsServerDurableObject {}

export default {fetch: getWsServerDurableObjectFetch('MyDurableObjects')};
```

For the above code to work, you'll need to have a Wrangler configuration that connects the `MyDurableObject` class to the `MyDurableObjects` namespace. In other words, you'll have something like this in your `wrangler.toml` file:

```
[[durable_objects.bindings]]
name = "MyDurableObjects"
class_name = "MyDurableObject"
```

With this you can now easily connect and synchronize clients that are using the [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/) synchronizer.

### Durable Objects [Persistence](/guides/persistence/)

But wait! There's more. Durable Objects also provide a storage mechanism, and sometimes you want TinyBase data to also be stored on the server (in case all the current clients disconnect and a new one joins, for example). So this release of TinyBase also includes a dedicated persister, the [`DurableObjectStoragePersister`](/api/persister-durable-object-storage/interfaces/persister/durableobjectstoragepersister/), that also synchronizes the data to the Durable Object storage layer.

You create it with the [`createDurableObjectStoragePersister`](/api/persister-durable-object-storage/functions/creation/createdurableobjectstoragepersister/) function, and hook it into the Durable Object by returning it from the [`createPersister`](/api/synchronizer-ws-server-durable-object/classes/creation/wsserverdurableobject/methods/creation/createpersister/) method of your [`WsServerDurableObject`](/api/the-essentials/synchronizing-stores/wsserverdurableobject/):

```
export class MyDurableObject extends WsServerDurableObject {
  createPersister() {
    return createDurableObjectStoragePersister(
      createMergeableStore(),
      this.ctx.storage,
    );
  }
}
```

You can get started quickly with this architecture using the [new Vite template](https://github.com/tinyplex/vite-tinybase-ts-react-sync-durable-object) that accompanies this release.

### Server Reference Implementation

Unrelated to Durable Objects, this release also includes the new [`synchronizer-ws-server-simple`](/api/synchronizer-ws-server-simple/) module that contains a simple server implementation called [`WsServerSimple`](/api/synchronizer-ws-server-simple/interfaces/server/wsserversimple/). Without the complications of listeners, persistence, or statistics, this is more suitable to be used as a reference implementation for other server environments.

### Architectural Guide

To go with this release, we have added new documentation on ways in which you can use TinyBase in an app architecture. Check it out in the new [Architectural Options](/guides/the-basics/architectural-options/) guide.

We've also started a new section of documentation for describing integrations, of which the [Cloudflare Durable Objects](/guides/integrations/cloudflare-durable-objects/) guide, of course, is the first new entry!

---

## v5.3

This release is focussed on a few API improvements and quality-of-life changes. These include:

### React SSR support

Thanks to contributor [Muhammad Muhajir](https://github.com/muhajirdev) for ensuring that TinyBase runs in server-side rendering environments!

### In the [`persisters`](/api/persisters/) module...

All [`Persister`](/api/the-essentials/persisting-stores/persister/) objects now expose information about whether they are loading or saving. To access this [`Status`](/api/persisters/enumerations/lifecycle/status/), use:

-   The [`getStatus`](/api/persisters/interfaces/persister/persister/methods/lifecycle/getstatus/) method, which will return 0 when it is idle, 1 when it is loading, and 2 when it is saving.
-   The [`addStatusListener`](/api/persisters/interfaces/persister/persister/methods/listener/addstatuslistener/) method, which lets you add a [`StatusListener`](/api/persisters/type-aliases/listener/statuslistener/) function and which is called whenever the status changes.

These make it possible to track background load and save activities, so that, for example, you can show a status-bar spinner of asynchronous persistence activity.

### In the [`synchronizers`](/api/synchronizers/) module...

Synchronizers are a sub-class of [`Persister`](/api/the-essentials/persisting-stores/persister/), so all [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) objects now also have:

-   The [`getStatus`](/api/persisters/interfaces/persister/persister/methods/lifecycle/getstatus/) method, which will return 0 when it is idle, 1 when it is 'loading' (ie inbound syncing), and 2 when it is 'saving' (ie outbound syncing).
-   The [`addStatusListener`](/api/persisters/interfaces/persister/persister/methods/listener/addstatuslistener/) method, which lets you add a [`StatusListener`](/api/persisters/type-aliases/listener/statuslistener/) function and which is called whenever the status changes.

### In the [`ui-react`](/api/ui-react/) module...

There are corresponding hooks so that you can build these status changes into a React UI easily:

-   The [`usePersisterStatus`](/api/ui-react/functions/persister-hooks/usepersisterstatus/) hook, which will return the status for an explicitly provided, or context-derived [`Persister`](/api/the-essentials/persisting-stores/persister/).
-   The [`usePersisterStatusListener`](/api/ui-react/functions/persister-hooks/usepersisterstatuslistener/) hook, which lets you add your own [`StatusListener`](/api/persisters/type-aliases/listener/statuslistener/) function to a [`Persister`](/api/the-essentials/persisting-stores/persister/).
-   The [`usePersister`](/api/ui-react/functions/persister-hooks/usepersister/) hook, which lets you get direct access to a [`Persister`](/api/the-essentials/persisting-stores/persister/) from within your UI.

And correspondingly for Synchronizers:

-   The [`useSynchronizerStatus`](/api/ui-react/functions/synchronizer-hooks/usesynchronizerstatus/) hook, which will return the status for an explicitly provided, or context-derived [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/).
-   The [`useSynchronizerStatusListener`](/api/ui-react/functions/synchronizer-hooks/usesynchronizerstatuslistener/) hook, which lets you add your own [`StatusListener`](/api/persisters/type-aliases/listener/statuslistener/) function to a [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/).
-   The [`useSynchronizer`](/api/ui-react/functions/synchronizer-hooks/usesynchronizer/) hook, which lets you get direct access to a [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) from within your UI.

In addition, this module also now includes hooks for injecting objects into the Provider context scope imperatively, much like the existing [`useProvideStore`](/api/ui-react/functions/store-hooks/useprovidestore/) hook:

-   The [`useProvideMetrics`](/api/ui-react/functions/metrics-hooks/useprovidemetrics/) hook, which lets you imperatively register [`Metrics`](/api/metrics/interfaces/metrics/metrics/) objects.
-   The [`useProvideIndexes`](/api/ui-react/functions/indexes-hooks/useprovideindexes/) hook, which lets you register [`Indexes`](/api/indexes/interfaces/indexes/indexes/) objects.
-   The [`useProvideRelationships`](/api/ui-react/functions/relationships-hooks/useproviderelationships/) hook, which lets you register [`Relationships`](/api/relationships/interfaces/relationships/relationships/) objects.
-   The [`useProvideQueries`](/api/ui-react/functions/queries-hooks/useprovidequeries/) hook, which lets you register [`Queries`](/api/queries/interfaces/queries/queries/) objects.
-   The [`useProvideCheckpoints`](/api/ui-react/functions/checkpoints-hooks/useprovidecheckpoints/) hook, which lets you register [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) objects.
-   The [`useProvidePersister`](/api/ui-react/functions/persister-hooks/useprovidepersister/) hook, which lets you register [`Persister`](/api/the-essentials/persisting-stores/persister/) objects.
-   The [`useProvideSynchronizer`](/api/ui-react/functions/synchronizer-hooks/useprovidesynchronizer/) hook, which lets you register [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) objects.

All of these new methods have extensive documentation, each with examples to show how to use them.

Please provide feedback on this new release on GitHub!

---

## v5.2

This release introduces new Persisters for... PostgreSQL! TinyBase now has two new [`Persister`](/api/the-essentials/persisting-stores/persister/) modules:

-   The [`persister-postgres`](/api/persister-postgres/) module provides the [`PostgresPersister`](/api/persister-postgres/interfaces/persister/postgrespersister/), which uses the excellent [`postgres`](https://github.com/porsager/postgres) module to bind to regular PostgreSQL databases, generally on a server.
-   The [`persister-pglite`](/api/persister-pglite/) module provides the [`PglitePersister`](/api/persister-pglite/interfaces/persister/pglitepersister/), which uses the new and exciting [`pglite`](https://github.com/electric-sql/pglite) module for running PostgreSQL... in a browser!

Conceptually, things behave in the same way as they do for the various SQLite persisters. Simply use the [`createPostgresPersister`](/api/persister-postgres/functions/creation/createpostgrespersister/) function (or the similar [`createPglitePersister`](/api/the-essentials/persisting-stores/createpglitepersister/) function) to persist your TinyBase data:

```
import postgres from 'postgres';
import {createPostgresPersister} from 'tinybase/persisters/persister-postgres';

// Create a TinyBase Store.
store.setTables({pets: {fido: {species: 'dog'}}});

// Create a postgres connection and Persister.
const sql = postgres('postgres://localhost:5432/tinybase');
const pgPersister = await createPostgresPersister(store, sql, 'my_tinybase');

// Save Store to the database.
await pgPersister.save();

console.log(await sql`SELECT * FROM my_tinybase;`);
// -> [{_id: '_', store: '[{"pets":{"fido":{"species":"dog"}}},{}]'}]
```

And, as per usual, you can update the database and have TinyBase automatically reflect those changes:

```
// If separately the database gets updated...
const json = '[{"pets":{"felix":{"species":"cat"}}},{}]';
await sql`UPDATE my_tinybase SET store = ${json} WHERE _id = '_';`;

// ... then changes are loaded back. Reactive auto-load is also supported!
await pgPersister.load();
console.log(store.getTables());
// -> {pets: {felix: {species: 'cat'}}}

// As always, don't forget to tidy up.
await pgPersister.destroy();
await sql.end();
```

Note that these two [`Persister`](/api/the-essentials/persisting-stores/persister/) objects support both the `json` and `tabular` modes for saving TinyBase data into the database. See the [`DatabasePersisterConfig`](/api/persisters/type-aliases/configuration/databasepersisterconfig/) type for more details. (Note however that, like the SQLite Persisters, only the `json` mode is supported for [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) instances, due to their additional CRDT metadata.)

This release also exposes the new [`createCustomSqlitePersister`](/api/persisters/functions/creation/createcustomsqlitepersister/) function and [`createCustomPostgreSqlPersister`](/api/persisters/functions/creation/createcustompostgresqlpersister/) function at the top level of the persister module. These can be used to build [`Persister`](/api/the-essentials/persisting-stores/persister/) objects against SQLite and PostgreSQL SDKs (or forks) that are not already included with TinyBase.

### Minor breaking change

It's very unlikely to affect most apps, but also be aware that the [`persisters`](/api/persisters/) module and [`synchronizers`](/api/synchronizers/) module are no longer bundled in the 'master' tinybase module. If you are using them (most likely because you have built a custom [`Persister`](/api/the-essentials/persisting-stores/persister/) or [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/)), you will need to update your imports accordingly to the standalone `tinybase/persisters` and `tinybase/synchronizers` versions of them. Apologies.

---

## v5.1

This release lets you persist data on a server using the [`createWsServer`](/api/synchronizer-ws-server/functions/creation/createwsserver/) function. This makes it possible for all clients to disconnect from a path, but, when they reconnect, for the data to still be present for them to sync with.

This is done by passing in a second argument to the [`createWsServer`](/api/synchronizer-ws-server/functions/creation/createwsserver/) function that creates a [`Persister`](/api/the-essentials/persisting-stores/persister/) instance (for which also need to create or provide a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/)) for a given path:

```
import {createMergeableStore} from 'tinybase';
import {createFilePersister} from 'tinybase/persisters/persister-file';
import {createWsServer} from 'tinybase/synchronizers/synchronizer-ws-server';
import {WebSocketServer} from 'ws';

const persistingServer = createWsServer(
  new WebSocketServer({port: 8051}),
  (pathId) =>
    createFilePersister(
      createMergeableStore(),
      pathId.replace(/[^a-zA-Z0-9]/g, '-') + '.json',
    ),
);

await persistingServer.destroy();
```

This is a very crude (and not production-safe!) example, but demonstrates a server that will create a file, based on any path that clients connect to, and persist data to it. See the [`createWsServer`](/api/synchronizer-ws-server/functions/creation/createwsserver/) function documentation for more details.

This implementation is still experimental so please kick the tires!

There is one small breaking change in this release: the functions for creating [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) objects can now take optional onSend and onReceive callbacks that will fire whenever messages pass through the [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/). See, for example, the [`createWsSynchronizer`](/api/the-essentials/synchronizing-stores/createwssynchronizer/) function. These are suitable for debugging synchronization issues in a development environment.

---

## v5.0

We're excited to announce this major release for TinyBase! It includes important data synchronization functionality and a range of other improvements.

## In Summary

-   [The new MergeableStore type](#the-new-mergeableStore-type) wraps your data as a Conflict-Free Replicated Data Type (CRDT).
-   [The new Synchronizer framework](#the-new-synchronizer-framework) keeps multiple instances of data in sync across different media.
-   An [improved module folder structure](#improved-module-folder-structure) removes common packaging and bundling issues.
-   The TinyBase Inspector is now in its own standalone [`ui-react-inspector`](/api/ui-react-inspector/) module.
-   TinyBase now supports only Expo SQLite v14 ([SDK 51](https://expo.dev/changelog/2024/05-07-sdk-51)) and above.

There are also some small [breaking changes](#breaking-changes-in-v50) that may affect you (but which should easy to fix if they do).

Let's look at the major functionality in more detail!

### The New [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) Type

A key part of TinyBase v5.0 is the new [`mergeable-store`](/api/mergeable-store/) module, which contains a subtype of [`Store`](/api/the-essentials/creating-stores/store/) - called [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) - that can be merged with another with deterministic results. The implementation uses an encoded hybrid logical clock (HLC) to timestamp the changes made so that they can be cleanly merged.

The [`getMergeableContent`](/api/mergeable-store/interfaces/mergeable/mergeablestore/methods/getter/getmergeablecontent/) method on a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) is used to get the state of a store that can be merged into another. The [`applyMergeableChanges`](/api/mergeable-store/interfaces/mergeable/mergeablestore/methods/setter/applymergeablechanges/) method will let you apply that to (another) store. The [`merge`](/api/mergeable-store/interfaces/mergeable/mergeablestore/methods/setter/merge/) method is a convenience function to bidirectionally merge two stores together:

```
const localStore1 = createMergeableStore();
const localStore2 = createMergeableStore();

localStore1.setCell('pets', 'fido', 'species', 'dog');
localStore2.setCell('pets', 'felix', 'species', 'cat');

localStore1.merge(localStore2);

console.log(localStore1.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]

console.log(localStore2.getContent());
// -> [{pets: {felix: {species: 'cat'}, fido: {species: 'dog'}}}, {}]
```

Please read the new [Using A MergeableStore](/guides/synchronization/using-a-mergeablestore/) guide for more details of how to use this important new API.

A [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) can be persisted locally, just like a regular [`Store`](/api/the-essentials/creating-stores/store/) into file, local and session storage, and simple SQLite environments such as Expo and SQLite3. These allow you to save the state of a [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) locally before it has had the chance to be synchronized online, for example.

Which leads us onto the next important feature in v5.0, allowing you to synchronize stores between systems...

### The New [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) Framework

The v5.0 release also introduces the new concept of synchronization. [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/) objects implement a negotiation protocol that allows multiple [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) objects to be merged together. This can be across a network, using WebSockets, for example:

```
import {createWsSynchronizer} from 'tinybase/synchronizers/synchronizer-ws-client';
import {WebSocket} from 'ws';

// On a server machine:
const server = createWsServer(new WebSocketServer({port: 8043}));

// On the first client machine:
const store1 = createMergeableStore();
const synchronizer1 = await createWsSynchronizer(
  store1,
  new WebSocket('ws://localhost:8043'),
);
await synchronizer1.startSync();
store1.setCell('pets', 'fido', 'legs', 4);

// On the second client machine:
const store2 = createMergeableStore();
const synchronizer2 = await createWsSynchronizer(
  store2,
  new WebSocket('ws://localhost:8043'),
);
await synchronizer2.startSync();
store2.setCell('pets', 'felix', 'price', 5);
// ...

console.log(store1.getTables());
// -> {pets: {felix: {price: 5}, fido: {legs: 4}}}
console.log(store2.getTables());
// -> {pets: {felix: {price: 5}, fido: {legs: 4}}}

await synchronizer1.destroy();
await synchronizer2.destroy();
await server.destroy();
```

This release includes three types of [`Synchronizer`](/api/the-essentials/synchronizing-stores/synchronizer/):

-   The [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/) uses WebSockets to communicate between different systems as shown above.
-   The [`BroadcastChannelSynchronizer`](/api/synchronizer-broadcast-channel/interfaces/synchronizer/broadcastchannelsynchronizer/) uses the browser's BroadcastChannel API to communicate between different tabs and workers.
-   The [`LocalSynchronizer`](/api/synchronizer-local/interfaces/synchronizer/localsynchronizer/) demonstrates synchronization in memory on a single local system.

Notice that the [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/) assumes that there exists a server that can forward requests to other [`WsSynchronizer`](/api/synchronizer-ws-client/interfaces/synchronizer/wssynchronizer/) systems. This can be created using the [`createWsServer`](/api/synchronizer-ws-server/functions/creation/createwsserver/) function that takes a WebSocketServer as also shown above.

Please read the new [Using A Synchronizer](/guides/synchronization/using-a-synchronizer/) guide for more details of how to synchronize your data.

### Improved Module Folder Structure

We have previously found issues with legacy bundlers and other tools that didn't fully support the new `exports` field in the module's package.

To mitigate that, the TinyBase distribution now has a top-level folder structure that fully echoes the import paths, including signifiers for JavaScript versions, schema support, minification and so on.

Please read the comprehensive [Importing TinyBase](/guides/the-basics/importing-tinybase/) guide for more details of how to construct the correct import paths in v5.0.

### Breaking [`Changes`](/api/store/type-aliases/transaction/changes/) in v5.0

#### Module File Structure

If you previously had `/lib/` in your import paths, you should remove it. You also do not have to explicitly specify whether you need the `cjs` version of TinyBase - if you are using a `require` rather than an `import`, you will get it automatically.

The non-minified version of the code is now default and you need to be explicit when you _want_ minified code. Previously you would add `/debug` to the import path to get non-minified code, but now you add `/min` to the import path to get _minified_ code.

#### Expo SQLite [`Persister`](/api/the-essentials/persisting-stores/persister/)

Previously the [`persister-expo-sqlite`](/api/persister-expo-sqlite/) module supported expo-sqlite v13 and the persister-expo-sqlite-next module supported their modern 'next' package. In v5.0, the [`persister-expo-sqlite`](/api/persister-expo-sqlite/) module only supports v14 and later, and the persister-expo-sqlite-next module has been removed.

#### The TinyBase Inspector

Previously, the React-based inspector (then known as `StoreInspector`) resided in the debug version of the [`ui-react-dom`](/api/ui-react-dom/) module. It now lives in its own [`ui-react-inspector`](/api/ui-react-inspector/) module (so that it can be used against non-debug code) and has been renamed to Inspector.

Please update your imports and rename the component when used, accordingly. See the API documentation for details, or the [<Inspector />](/demos/ui-components/inspector/) demo, for example.

#### API [`Changes`](/api/store/type-aliases/transaction/changes/)

The following changes have been made to the existing TinyBase API for consistency. These are less common parts of the API but should straightforward to correct if you are using them.

In the type definitions:

-   The GetTransactionChanges and GetTransactionLog types have been removed.
-   The TransactionChanges type has been renamed as the [`Changes`](/api/store/type-aliases/transaction/changes/) type.
-   The [`Changes`](/api/store/type-aliases/transaction/changes/) type now uses `undefined` instead of `null` to indicate a [`Cell`](/api/store/type-aliases/store/cell/) or [`Value`](/api/store/type-aliases/store/value/) that has been deleted or that was not present.
-   The [`TransactionLog`](/api/store/type-aliases/transaction/transactionlog/) type is now an array instead of a JavaScript object.

In the [`Store`](/api/the-essentials/creating-stores/store/) interface:

-   There is a new [`getTransactionChanges`](/api/store/interfaces/store/store/methods/transaction/gettransactionchanges/) method and a new getTransactionLog method.
-   The setTransactionChanges method is renamed as the [`applyChanges`](/api/store/interfaces/store/store/methods/setter/applychanges/) method.
-   A [`DoRollback`](/api/store/type-aliases/callback/dorollback/) function no longer gets passed arguments. You can use the [`getTransactionChanges`](/api/store/interfaces/store/store/methods/transaction/gettransactionchanges/) method and [`getTransactionLog`](/api/store/interfaces/store/store/methods/transaction/gettransactionlog/) method directly instead.
-   Similarly, a [`TransactionListener`](/api/store/type-aliases/listener/transactionlistener/) function no longer gets passed arguments.

In the [`persisters`](/api/persisters/) module:

-   The [`createCustomPersister`](/api/persisters/functions/creation/createcustompersister/) function now takes a final optional boolean (`supportsMergeableStore`) to indicate that the [`Persister`](/api/the-essentials/persisting-stores/persister/) can support [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) as well as [`Store`](/api/the-essentials/creating-stores/store/) objects.
-   A [`Persister`](/api/the-essentials/persisting-stores/persister/)'s [`load`](/api/persisters/interfaces/persister/persister/methods/load/load/) method and [`startAutoLoad`](/api/persisters/interfaces/persister/persister/methods/load/startautoload/) method now take a [`Content`](/api/store/type-aliases/store/content/) object as one parameter, rather than [`Tables`](/api/store/type-aliases/store/tables/) and [`Values`](/api/store/type-aliases/store/values/) as two.
-   If you create a custom [`Persister`](/api/the-essentials/persisting-stores/persister/), the setPersisted method now receives changes made to a [`Store`](/api/the-essentials/creating-stores/store/) directly by reference, rather than via a callback. Similarly, the [`PersisterListener`](/api/persisters/type-aliases/creation/persisterlistener/) you register in your addPersisterListener implementation now takes [`Content`](/api/store/type-aliases/store/content/) and [`Changes`](/api/store/type-aliases/transaction/changes/) objects directly rather than via a callback.
-   The broadcastTransactionChanges method in the [`persister-partykit-server`](/api/persister-partykit-server/) module has been renamed to the broadcastChanges method.

---

## v4.8

This release includes the new [`persister-powersync`](/api/persister-powersync/) module, which provides a [`Persister`](/api/the-essentials/persisting-stores/persister/) for [PowerSync's SQLite](https://www.powersync.com/) database.

Much like the other SQLite persisters, use it by passing in a PowerSync instance to the [`createPowerSyncPersister`](/api/persister-powersync/functions/creation/createpowersyncpersister/) function; something like:

```
const powerSync = usePowerSync();

const persister = createPowerSyncPersister(store, powerSync, {
  mode: 'tabular',
  tables: {
    load: {items: {tableId: 'items', rowIdColumnName: 'value'}},
    save: {items: {tableName: 'items', rowIdColumnName: 'value'}},
  },
});
```

A huge thank you to [Benedikt Mueller](https://bndkt.com/) ([@bndkt](https://github.com/bndkt)) for building out this functionality! And please provide feedback on how this new [`Persister`](/api/the-essentials/persisting-stores/persister/) works for you.

---

## v4.7

This release includes the new [`persister-libsql`](/api/persister-libsql/) module, which provides a [`Persister`](/api/the-essentials/persisting-stores/persister/) for [Turso's LibSQL](https://turso.tech/libsql) database.

Use the [`Persister`](/api/the-essentials/persisting-stores/persister/) by passing in a reference to the LibSQL client to the createLibSQLPersister function; something like:

```
const client = createClient({url: 'file:my.db'});

const persister = createLibSqlPersister(store, client, {
  mode: 'tabular',
  tables: {
    load: {items: {tableId: 'items', rowIdColumnName: 'value'}},
    save: {items: {tableName: 'items', rowIdColumnName: 'value'}},
  },
});
```

This is the first version of this functionality, so please provide feedback on how it works for you!

---

## v4.6

This release includes the new [`persister-electric-sql`](/api/persister-electric-sql/) module, which provides a [`Persister`](/api/the-essentials/persisting-stores/persister/) for [ElectricSQL](https://electric-sql.com/) client databases.

Use the [`Persister`](/api/the-essentials/persisting-stores/persister/) by passing in a reference to the Electric client to the [`createElectricSqlPersister`](/api/persister-electric-sql/functions/creation/createelectricsqlpersister/) function; something like:

```
const electric = await electrify(connection, schema, config);

const persister = createElectricSqlPersister(store, electric, {
  mode: 'tabular',
  tables: {
    load: {items: {tableId: 'items', rowIdColumnName: 'value'}},
    save: {items: {tableName: 'items', rowIdColumnName: 'value'}},
  },
});
```

This release is accompanied by a [template project](https://github.com/tinyplex/tinybase-ts-react-electricsql) to get started quickly with this integration. Enjoy!

---

## v4.5

This release includes the new persister-expo-sqlite-next module, which provides a [`Persister`](/api/the-essentials/persisting-stores/persister/) for the modern version of Expo's [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite) library, designated 'next' as of November 2023. This API should be used if you are installing the `expo-sqlite/next` module.

Note that TinyBase support for the legacy version of Expo-SQLite (`expo-sqlite`) is still available in the [`persister-expo-sqlite`](/api/persister-expo-sqlite/) module.

NB as of TinyBase v5.0, this is now the default and legacy support has been removed.

Thank you to Expo for providing this functionality!

---

## v4.4

This relatively straightforward release adds a selection of new listeners to the [`Store`](/api/the-essentials/creating-stores/store/) object, and their respective hooks. These are for listening to changes in the 'existence' of entities rather than to their value. For example, the [`addHasTableListener`](/api/store/interfaces/store/store/methods/listener/addhastablelistener/) method will let you listen for the presence (or not) of a specific table.

The full set of new existence-listening methods and hooks to work with this is as follows:

These methods may become particularly important in future versions of TinyBase that support `null` as valid Cells and [`Values`](/api/store/type-aliases/store/values/).

---

## v4.3

We're excited to announce TinyBase 4.3, which provides an integration with [PartyKit](https://www.partykit.io/), a cloud-based collaboration provider.

This allows you to enjoy the benefits of both a "local-first" architecture and a "sharing-first" platform. You can have structured data on the client with fast, reactive user experiences, but also benefit from cloud-based persistence and room-based collaboration.

![PartyKit](/partykit.gif "PartyKit")

This release includes two new modules:

-   The [`persister-partykit-server`](/api/persister-partykit-server/) module provides a server class for coordinating clients and persisting [`Store`](/api/the-essentials/creating-stores/store/) data to the PartyKit cloud.
-   The [`persister-partykit-client`](/api/persister-partykit-client/) module provides the API to create connections to the server and a binding to your [`Store`](/api/the-essentials/creating-stores/store/).

A TinyBase server implementation on PartyKit can be as simple as this:

```
import {TinyBasePartyKitServer} from 'tinybase/persisters/persister-partykit-server';

export default class extends TinyBasePartyKitServer {}
```

On the client, use the familiar [`Persister`](/api/the-essentials/persisting-stores/persister/) API, passing in a reference to a PartyKit socket object that's been configured to connect to your server deployment and named room:

```
import {createPartyKitPersister} from 'tinybase/persisters/persister-partykit-client';

const persister = createPartyKitPersister(
  store,
  new PartySocket({
    host: 'project-name.my-account.partykit.dev',
    room: 'my-partykit-room',
  }),
);
await persister.startAutoSave();
await persister.startAutoLoad();
```

The [`load`](/api/persisters/interfaces/persister/persister/methods/load/load/) method and (gracefully failing) [`save`](/api/persisters/interfaces/persister/persister/methods/save/save/) method on this [`Persister`](/api/the-essentials/persisting-stores/persister/) use HTTPS to get or set full copies of the [`Store`](/api/the-essentials/creating-stores/store/) to the cloud. However, the auto-save and auto-load modes use a websocket to transmit subsequent incremental changes in either direction, making for performant sharing of state between clients.

See and try out this new collaboration functionality in the [Todo App v6 (collaboration)](/demos/todo-app/todo-app-v6-collaboration/) demo. This also emphasizes the few changes that need to be made to an existing app to make it instantly collaborative.

Also try out the [tinybase-ts-react-partykit](https://github.com/tinyplex/tinybase-ts-react-partykit) template that gets you up and running with a PartyKit-enabled TinyBase app extremely quickly.

PartyKit supports retries for clients that go offline, and so the disconnected user experience is solid, out of the box. Learn more about configuring this behavior [here](https://docs.partykit.io/reference/partysocket-api/#options).

Note, however, that this release is not yet a full CRDT implementation: there is no clock synchronization and it is more 'every write wins' than 'last write wins'. However, since the transmitted updates are at single cell (or value) granularity, conflicts are minimized. More resilient replication is planned as this integration matures.

---

## v4.2

This release adds support for persisting TinyBase to a browser's IndexedDB storage. You'll need to import the new [`persister-indexed-db`](/api/persister-indexed-db/) module, and call the [`createIndexedDbPersister`](/api/persister-indexed-db/functions/creation/createindexeddbpersister/) function to create the IndexedDB [`Persister`](/api/the-essentials/persisting-stores/persister/).

The API is the same as for all the other [`Persister`](/api/the-essentials/persisting-stores/persister/) APIs:

```
import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';

store
  .setTable('pets', {fido: {species: 'dog'}})
  .setTable('species', {dog: {price: 5}})
  .setValues({open: true});
const indexedDbPersister = createIndexedDbPersister(store, 'petStore');

await indexedDbPersister.save();
// IndexedDB ->
//   database petStore:
//     objectStore t:
//       object 0:
//         k: "pets"
//         v: {fido: {species: dog}}
//       object 1:
//         k: "species"
//         v: {dog: {price: 5}}
//     objectStore v:
//       object 0:
//         k: "open"
//         v: true

await indexedDbPersister.destroy();
```

Note that it is not possible to reactively detect changes to a browser's IndexedDB storage. A polling technique is used to load underlying changes if you choose to 'autoLoad' your data into TinyBase.

This release also upgrades Prettier to v3.0 which has a peer-dependency impact on the tools module. Please report any issues!

---

## v4.1

This release introduces the new [`ui-react-dom`](/api/ui-react-dom/) module. This provides pre-built components for tabular display of your data in a web application.

![A TinyBase DOM Component](/ui-react-dom.webp "A TinyBase DOM Component")

### New DOM Components

The following is the list of all the components released in v4.1:

These pre-built components are showcased in the [UI Components](/demos/ui-components/) demos. Using them should be very familiar if you have used the more abstract [`ui-react`](/api/ui-react/) module:

```
import React from 'react';
import {createRoot} from 'react-dom/client';
import {SortedTableInHtmlTable} from 'tinybase/ui-react-dom';

const App = ({store}) => (
  <SortedTableInHtmlTable tableId="pets" cellId="species" store={store} />
);

store.setTables({
  pets: {
    fido: {species: 'dog'},
    felix: {species: 'cat'},
  },
});
const app = document.createElement('div');
const root = createRoot(app);
root.render(<App store={store} />);

console.log(app.innerHTML);
// ->
`
<table>
 <thead>
   <tr><th>Id</th><th class="sorted ascending">↑ species</th></tr>
 </thead>
 <tbody>
   <tr><th title="felix">felix</th><td>cat</td></tr>
   <tr><th title="fido">fido</th><td>dog</td></tr>
 </tbody>
</table>
`;

root.unmount();
```

The [`EditableCellView`](/api/ui-react-dom/functions/store-components/editablecellview/) component and [`EditableValueView`](/api/ui-react-dom/functions/store-components/editablevalueview/) component are interactive input controls for updating [`Cell`](/api/store/type-aliases/store/cell/) and [`Value`](/api/store/type-aliases/store/value/) content respectively. You can generally use them across your table views by adding the `editable` prop to your table component.

### The new Inspector

![Inspector](/store-inspector.webp "Inspector")

The new [`Inspector`](/api/the-essentials/using-react/inspector/) component allows you to view, understand, and edit the content of a [`Store`](/api/the-essentials/creating-stores/store/) in a debug web environment. Try it out in most of the demos on the site, including the [Movie Database](/demos/movie-database/) demo, pictured. This requires a debug build of the new [`ui-react-dom`](/api/ui-react-dom/) module, which is now also included in the UMD distribution.

Also in this release, the [`getResultTableCellIds`](/api/queries/interfaces/queries/queries/methods/result/getresulttablecellids/) method and [`addResultTableCellIdsListener`](/api/queries/interfaces/queries/queries/methods/listener/addresulttablecellidslistener/) method have been added to the [`Queries`](/api/queries/interfaces/queries/queries/) object. The equivalent [`useResultTableCellIds`](/api/ui-react/functions/queries-hooks/useresulttablecellids/) hook and [`useResultTableCellIdsListener`](/api/ui-react/functions/queries-hooks/useresulttablecellidslistener/) hook have also been added to [`ui-react`](/api/ui-react/) module. A number of other minor React hooks have been added to support the components above.

[Demos](/demos/) have been updated to demonstrate the [`ui-react-dom`](/api/ui-react-dom/) module and the [`Inspector`](/api/the-essentials/using-react/inspector/) component where appropriate.

(NB: Previous to v5.0, this component was called `StoreInspector`.)

---

## v4.0

This major release provides [`Persister`](/api/the-essentials/persisting-stores/persister/) modules that connect TinyBase to SQLite databases (in both browser and server contexts), and CRDT frameworks that can provide synchronization and local-first reconciliation:

See the [Database Persistence](/guides/persistence/database-persistence/) guide for details on how to work with SQLite databases, and the [Synchronizing Data](/guides/schemas-and-persistence/synchronizing-data/) guide for more complex synchronization with the CRDT frameworks.

### SQLite databases

You can persist [`Store`](/api/the-essentials/creating-stores/store/) data to a database with either a JSON serialization or tabular mapping. (See the [`DatabasePersisterConfig`](/api/persisters/type-aliases/configuration/databasepersisterconfig/) documentation for more details).

For example, this creates a [`Persister`](/api/the-essentials/persisting-stores/persister/) object and saves and loads the [`Store`](/api/the-essentials/creating-stores/store/) to and from a local SQLite database. It uses an explicit tabular one-to-one mapping for the 'pets' table:

```
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import {createSqliteWasmPersister} from 'tinybase/persisters/persister-sqlite-wasm';

const sqlite3 = await sqlite3InitModule();
const db = new sqlite3.oo1.DB(':memory:', 'c');
store.setTables({pets: {fido: {species: 'dog'}}});
const sqlitePersister = createSqliteWasmPersister(store, sqlite3, db, {
  mode: 'tabular',
  tables: {load: {pets: 'pets'}, save: {pets: 'pets'}},
});

await sqlitePersister.save();
console.log(db.exec('SELECT * FROM pets;', {rowMode: 'object'}));
// -> [{_id: 'fido', species: 'dog'}]

db.exec(`INSERT INTO pets (_id, species) VALUES ('felix', 'cat')`);
await sqlitePersister.load();
console.log(store.getTables());
// -> {pets: {fido: {species: 'dog'}, felix: {species: 'cat'}}}

await sqlitePersister.destroy();
```

### CRDT Frameworks

CRDTs allow complex reconciliation and synchronization between clients. Yjs and Automerge are two popular examples. The API should be familiar! The following will persist a TinyBase [`Store`](/api/the-essentials/creating-stores/store/) to a Yjs document:

```
import {createYjsPersister} from 'tinybase/persisters/persister-yjs';
import {Doc} from 'yjs';

store.setTables({pets: {fido: {species: 'dog'}}});

const doc = new Doc();
const yJsPersister = createYjsPersister(store, doc);

await yJsPersister.save();
// Store will be saved to the document.
console.log(doc.toJSON());
// -> {tinybase: {t: {pets: {fido: {species: 'dog'}}}, v: {}}}
await yJsPersister.destroy();
```

The following is the equivalent for an Automerge document that will sync over the broadcast channel:

```
import {Repo} from '@automerge/automerge-repo';
import {BroadcastChannelNetworkAdapter} from '@automerge/automerge-repo-network-broadcastchannel';
import {createAutomergePersister} from 'tinybase/persisters/persister-automerge';

const docHandler = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
}).create();
const automergePersister = createAutomergePersister(store, docHandler);

await automergePersister.save();
// Store will be saved to the document.
console.log(await docHandler.doc());
// -> {tinybase: {t: {pets: {fido: {species: 'dog'}}}, v: {}}}
await automergePersister.destroy();

store.delTables();
```

### New methods

There are three new methods on the [`Store`](/api/the-essentials/creating-stores/store/) object. The [`getContent`](/api/store/interfaces/store/store/methods/getter/getcontent/) method lets you get the [`Store`](/api/the-essentials/creating-stores/store/)'s [`Tables`](/api/store/type-aliases/store/tables/) and [`Values`](/api/store/type-aliases/store/values/) in one call. The corresponding [`setContent`](/api/store/interfaces/store/store/methods/setter/setcontent/) method lets you set them simultaneously.

The new setTransactionChanges method lets you replay TransactionChanges (received at the end of a transaction via listeners) into a [`Store`](/api/the-essentials/creating-stores/store/), allowing you to take changes from one [`Store`](/api/the-essentials/creating-stores/store/) and apply them to another.

Persisters now provide a [`schedule`](/api/persisters/interfaces/persister/persister/methods/lifecycle/schedule/) method that lets you queue up asynchronous tasks, such as when persisting data that requires complex sequences of actions.

### Breaking changes

The way that data is provided to the [`DoRollback`](/api/store/type-aliases/callback/dorollback/) and [`TransactionListener`](/api/store/type-aliases/listener/transactionlistener/) callbacks at the end of a transaction has changed. Although previously they directly received content about changed [`Cell`](/api/store/type-aliases/store/cell/) and [`Value`](/api/store/type-aliases/store/value/) content, they now receive functions that they can choose to call to receive that same data. This has a performance improvement, and your callback or listener can choose between concise TransactionChanges or more verbose [`TransactionLog`](/api/store/type-aliases/transaction/transactionlog/) structures for that data.

If you have build a custom persister, you will need to update your implementation. Most notably, the `setPersisted` function parameter is provided with a `getContent` function to get the content from the [`Store`](/api/the-essentials/creating-stores/store/) itself, rather than being passed pre-serialized JSON. It also receives information about the changes made during a transaction. The `getPersisted` function must return the content (or nothing) rather than JSON. `startListeningToPersisted` has been renamed `addPersisterListener`, and `stopListeningToPersisted` has been renamed `delPersisterListener`.

---

## v3.3

This release allows you to track the [`Cell`](/api/store/type-aliases/store/cell/) [`Ids`](/api/common/type-aliases/identity/ids/) used across a whole [`Table`](/api/store/type-aliases/store/table/), regardless of which [`Row`](/api/store/type-aliases/store/row/) they are in.

In a [`Table`](/api/store/type-aliases/store/table/) (particularly in a [`Store`](/api/the-essentials/creating-stores/store/) without a [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/)), different Rows can use different Cells. Consider this [`Store`](/api/the-essentials/creating-stores/store/), where each pet has a different set of [`Cell`](/api/store/type-aliases/store/cell/) [`Ids`](/api/common/type-aliases/identity/ids/):

```
store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat', friendly: true},
  cujo: {legs: 4},
});
```

Prior to v3.3, you could only get the [`Cell`](/api/store/type-aliases/store/cell/) [`Ids`](/api/common/type-aliases/identity/ids/) used in each [`Row`](/api/store/type-aliases/store/row/) at a time (with the [`getCellIds`](/api/store/interfaces/store/store/methods/getter/getcellids/) method). But you can now use the [`getTableCellIds`](/api/store/interfaces/store/store/methods/getter/gettablecellids/) method to get the union of all the [`Cell`](/api/store/type-aliases/store/cell/) [`Ids`](/api/common/type-aliases/identity/ids/) used across the [`Table`](/api/store/type-aliases/store/table/):

```
console.log(store.getCellIds('pets', 'fido')); // previously available
// -> ['species']

console.log(store.getTableCellIds('pets')); //    new in v3.3
// -> ['species', 'friendly', 'legs']
```

You can register a listener to track the [`Cell`](/api/store/type-aliases/store/cell/) [`Ids`](/api/common/type-aliases/identity/ids/) used across a [`Table`](/api/store/type-aliases/store/table/) with the new [`addTableCellIdsListener`](/api/store/interfaces/store/store/methods/listener/addtablecellidslistener/) method. Use cases for this might include knowing which headers to render when displaying a sparse [`Table`](/api/store/type-aliases/store/table/) in a user interface, or synchronizing data with relational or column-oriented database system.

There is also a corresponding [`useTableCellIds`](/api/ui-react/functions/store-hooks/usetablecellids/) hook in the optional [`ui-react`](/api/ui-react/) module for accessing these [`Ids`](/api/common/type-aliases/identity/ids/) reactively, and a [`useTableCellIdsListener`](/api/ui-react/functions/store-hooks/usetablecellidslistener/) hook for more advanced purposes.

Note that the bookkeeping behind these new accessors and listeners is efficient and should not be slowed by the number of Rows in the [`Table`](/api/store/type-aliases/store/table/).

This release also passes a getIdChanges function to every [`Id`](/api/common/type-aliases/identity/id/)\-related listener that, when called, returns information about the [`Id`](/api/common/type-aliases/identity/id/) changes, both additions and removals, during a transaction. See the [`TableIdsListener`](/api/store/type-aliases/listener/tableidslistener/) type, for example.

```
let listenerId = store.addRowIdsListener(
  'pets',
  (store, tableId, getIdChanges) => {
    console.log(getIdChanges());
  },
);

store.setRow('pets', 'lowly', {species: 'worm'});
// -> {lowly: 1}

store.delRow('pets', 'felix');
// -> {felix: -1}

store.delListener(listenerId).delTables();
```

---

## v3.2

This release lets you add a listener to the start of a transaction, and detect that a set of changes are about to be made to a [`Store`](/api/the-essentials/creating-stores/store/).

To use this, call the [`addStartTransactionListener`](/api/store/interfaces/store/store/methods/listener/addstarttransactionlistener/) method on your [`Store`](/api/the-essentials/creating-stores/store/). The listener you add can itself mutate the data in the [`Store`](/api/the-essentials/creating-stores/store/).

From this release onwards, listeners added with the existing [`addWillFinishTransactionListener`](/api/store/interfaces/store/store/methods/listener/addwillfinishtransactionlistener/) method are also able to mutate data. [Transactions](/guides/the-basics/transactions/) added with the existing [`addDidFinishTransactionListener`](/api/store/interfaces/store/store/methods/listener/adddidfinishtransactionlistener/) method _cannot_ mutate data.

```
const startListenerId = store.addStartTransactionListener(() => {
  console.log('Start transaction');
  console.log(store.getTables());
  // Can mutate data
});

const willFinishListenerId = store.addWillFinishTransactionListener(() => {
  console.log('Will finish transaction');
  console.log(store.getTables());
  // Can mutate data
});

const didFinishListenerId = store.addDidFinishTransactionListener(() => {
  console.log('Did finish transaction');
  console.log(store.getTables());
  // Cannot mutate data
});

store.setTable('pets', {fido: {species: 'dog'}});
// -> 'Start transaction'
// -> {}
// -> 'Will finish transaction'
// -> {pets: {fido: {species: 'dog'}}}
// -> 'Did finish transaction'
// -> {pets: {fido: {species: 'dog'}}}

store
  .delListener(startListenerId)
  .delListener(willFinishListenerId)
  .delListener(didFinishListenerId);

store.delTables();
```

This release also fixes a bug where using the explicit [`startTransaction`](/api/store/interfaces/store/store/methods/transaction/starttransaction/) method _inside_ another listener could create infinite recursion.

---

## v3.1

This new release adds a powerful schema-based type system to TinyBase.

If you define the shape and structure of your data with a [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/) or [`ValuesSchema`](/api/store/type-aliases/schema/valuesschema/), you can benefit from an enhanced developer experience when operating on it. For example:

```
// Import the 'with-schemas' definition:
import {createStore} from 'tinybase/with-schemas';

// Set a schema for a new Store:
const store = createStore().setValuesSchema({
  employees: {type: 'number'},
  open: {type: 'boolean', default: false},
});

// Benefit from inline TypeScript errors.
store.setValues({employees: 3}); //                      OK
store.setValues({employees: true}); //                   TypeScript error
store.setValues({employees: 3, website: 'pets.com'}); // TypeScript error
```

The schema-based typing is used comprehensively throughout every module - from the core [`Store`](/api/the-essentials/creating-stores/store/) interface all the way through to the [`ui-react`](/api/ui-react/) module. See the new [Schema-Based Typing](/guides/schemas/schema-based-typing/) guide for instructions on how to use it.

This now means that there are _three_ progressive ways to use TypeScript with TinyBase:

-   Basic Type Support (since v1.0)
-   Schema-based Typing (since v3.1)
-   ORM-like type definitions (since v2.2)

These are each described in the new [TinyBase And TypeScript](/guides/the-basics/tinybase-and-typescript/) guide.

Also in v3.1, the ORM-like type definition generation in the tools module has been extended to emit [`ui-react`](/api/ui-react/) module definitions.

Finally, v3.1.1 adds a `reuseRowIds` parameter to the [`addRow`](/api/the-essentials/setting-data/addrow/) method and the [`useAddRowCallback`](/api/ui-react/functions/store-hooks/useaddrowcallback/) hook. It defaults to `true`, for backwards compatibility, but if set to `false`, new [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/) will not be reused unless the whole [`Table`](/api/store/type-aliases/store/table/) is deleted.

---

## v3.0

This major new release adds key/value store functionality to TinyBase. Alongside existing tabular data, it allows you to get, set, and listen to, individual [`Value`](/api/store/type-aliases/store/value/) items, each with a unique [`Id`](/api/common/type-aliases/identity/id/).

```
store.setValues({employees: 3, open: true});
console.log(store.getValues());
// -> {employees: 3, open: true}

listenerId = store.addValueListener(
  null,
  (store, valueId, newValue, oldValue) => {
    console.log(`Value '${valueId}' changed from ${oldValue} to ${newValue}`);
  },
);

store.setValue('employees', 4);
// -> "Value 'employees' changed from 3 to 4"

store.delListener(listenerId).delValues();
```

[Guides](/guides/) and documentation have been fully updated, and certain demos - such as the [Todo App v2 (indexes)](/demos/todo-app/todo-app-v2-indexes/) demo, and the [Countries](/demos/countries/) demo - have been updated to use this new functionality.

If you use the optional [`ui-react`](/api/ui-react/) module with TinyBase, v3.0 now uses and expects React v18.

In terms of core API changes in v3.0, there are some minor breaking changes (see below), but the majority of the alterations are additions.

The [`Store`](/api/the-essentials/creating-stores/store/) object gains the following:

-   The [`setValues`](/api/store/interfaces/store/store/methods/setter/setvalues/) method, [`setPartialValues`](/api/store/interfaces/store/store/methods/setter/setpartialvalues/) method, and [`setValue`](/api/the-essentials/setting-data/setvalue/) method, to set keyed value data into the [`Store`](/api/the-essentials/creating-stores/store/).
-   The [`getValues`](/api/store/interfaces/store/store/methods/getter/getvalues/) method, [`getValueIds`](/api/store/interfaces/store/store/methods/getter/getvalueids/) method, and [`getValue`](/api/the-essentials/getting-data/getvalue/) method, to get keyed value data out of the [`Store`](/api/the-essentials/creating-stores/store/).
-   The [`delValues`](/api/store/interfaces/store/store/methods/deleter/delvalues/) method and [`delValue`](/api/store/interfaces/store/store/methods/deleter/delvalue/) method for removing keyed value data.
-   The [`addValuesListener`](/api/store/interfaces/store/store/methods/listener/addvalueslistener/) method, [`addValueIdsListener`](/api/store/interfaces/store/store/methods/listener/addvalueidslistener/) method, addValueListener method, and [`addInvalidValueListener`](/api/store/interfaces/store/store/methods/listener/addinvalidvaluelistener/) method, for listening to changes to keyed value data.
-   The [`hasValues`](/api/store/interfaces/store/store/methods/getter/hasvalues/) method, [`hasValue`](/api/store/interfaces/store/store/methods/getter/hasvalue/) method, and [`forEachValue`](/api/store/interfaces/store/store/methods/iterator/foreachvalue/) method, for existence and enumeration purposes.
-   The [`getTablesJson`](/api/store/interfaces/store/store/methods/getter/gettablesjson/) method, [`getValuesJson`](/api/store/interfaces/store/store/methods/getter/getvaluesjson/) method, [`setTablesJson`](/api/store/interfaces/store/store/methods/setter/settablesjson/) method, and [`setValuesJson`](/api/store/interfaces/store/store/methods/setter/setvaluesjson/) method, for reading and writing tabular and keyed value data to and from a JSON string. Also see below.
-   The [`getTablesSchemaJson`](/api/store/interfaces/store/store/methods/getter/gettablesschemajson/) method, [`getValuesSchemaJson`](/api/store/interfaces/store/store/methods/getter/getvaluesschemajson/) method, setTablesSchema method, [`setValuesSchema`](/api/store/interfaces/store/store/methods/setter/setvaluesschema/) method, [`delTablesSchema`](/api/store/interfaces/store/store/methods/deleter/deltablesschema/) method, and delValuesSchema method, for reading and writing tabular and keyed value schemas for the [`Store`](/api/the-essentials/creating-stores/store/). Also see below.

The following types have been added to the [`store`](/api/store/) module:

-   [`Values`](/api/store/type-aliases/store/values/), [`Value`](/api/store/type-aliases/store/value/), and [`ValueOrUndefined`](/api/store/type-aliases/store/valueorundefined/), representing keyed value data in a [`Store`](/api/the-essentials/creating-stores/store/).
-   [`ValueListener`](/api/store/type-aliases/listener/valuelistener/) and [`InvalidValueListener`](/api/store/type-aliases/listener/invalidvaluelistener/), to describe functions used to listen to (valid or invalid) changes to a [`Value`](/api/store/type-aliases/store/value/).
-   [`ValuesSchema`](/api/store/type-aliases/schema/valuesschema/) and [`ValueSchema`](/api/store/type-aliases/schema/valueschema/), to describe the keyed [`Values`](/api/store/type-aliases/store/values/) that can be set in a [`Store`](/api/the-essentials/creating-stores/store/) and their types.
-   [`ValueCallback`](/api/store/type-aliases/callback/valuecallback/), [`MapValue`](/api/store/type-aliases/callback/mapvalue/), [`ChangedValues`](/api/store/type-aliases/transaction/changedvalues/), and [`InvalidValues`](/api/store/type-aliases/transaction/invalidvalues/), which also correspond to their '[`Cell`](/api/store/type-aliases/store/cell/)' equivalents.

Additionally:

-   The persisters' [`load`](/api/persisters/interfaces/persister/persister/methods/load/load/) method and [`startAutoLoad`](/api/persisters/interfaces/persister/persister/methods/load/startautoload/) method take an optional `initialValues` parameter for setting [`Values`](/api/store/type-aliases/store/values/) when a persisted [`Store`](/api/the-essentials/creating-stores/store/) is bootstrapped.
-   The [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) module will undo and redo changes to keyed values in the same way they do for tabular data.
-   The tools module provides a getStoreValuesSchema method for inferring value-based schemas. The getStoreApi method and getPrettyStoreApi method now also provides an ORM-like code-generated API for schematized key values.

All attempts have been made to provide backwards compatibility and/or easy upgrade paths.

In previous versions, [`getJson`](/api/store/interfaces/store/store/methods/getter/getjson/) method would get a JSON serialization of the [`Store`](/api/the-essentials/creating-stores/store/)'s tabular data. That functionality is now provided by the [`getTablesJson`](/api/store/interfaces/store/store/methods/getter/gettablesjson/) method, and the [`getJson`](/api/store/interfaces/store/store/methods/getter/getjson/) method instead now returns a two-part array containing the tabular data and the keyed value data.

Similarly, the [`getSchemaJson`](/api/store/interfaces/store/store/methods/getter/getschemajson/) method used to return the tabular schema, now provided by the [`getTablesSchemaJson`](/api/store/interfaces/store/store/methods/getter/gettablesschemajson/) method. The [`getSchemaJson`](/api/store/interfaces/store/store/methods/getter/getschemajson/) method instead now returns a two-part array of tabular schema and the keyed value schema.

The [`setJson`](/api/store/interfaces/store/store/methods/setter/setjson/) method used to take a serialization of just the tabular data object. That's now provided by the [`setTablesJson`](/api/store/interfaces/store/store/methods/setter/settablesjson/) method, and the [`setJson`](/api/store/interfaces/store/store/methods/setter/setjson/) method instead expects a two-part array containing the tabular data and the keyed value data (as emitted by the [`getJson`](/api/store/interfaces/store/store/methods/getter/getjson/) method). However, for backwards compatibility, if the [`setJson`](/api/store/interfaces/store/store/methods/setter/setjson/) method is passed an object, it _will_ set the tabular data, as it did prior to v3.0.

Along similar lines, the [`setSchema`](/api/store/interfaces/store/store/methods/setter/setschema/) method's previous behavior is now provided by the [`setTablesSchema`](/api/store/interfaces/store/store/methods/setter/settablesschema/) method. The [`setSchema`](/api/store/interfaces/store/store/methods/setter/setschema/) method now takes two arguments, the second of which is optional, also aiding backward compatibility. The [`delSchema`](/api/store/interfaces/store/store/methods/deleter/delschema/) method removes both types of schema.

---

## v2.2

Note: The tools module has been removed in TinyBase v6.0.

This release includes a new tools module. These tools are not intended for production use, but are instead to be used as part of your engineering workflow to perform tasks like generating APIs from schemas, or schemas from data. For example:

```
import {createTools} from 'tinybase/tools';

store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  cujo: {species: 'dog'},
});

const tools = createTools(store);
const [dTs, ts] = tools.getStoreApi('shop');
```

This will generate two files:

```
// -- shop.d.ts --
/* Represents the 'pets' Table. */
export type PetsTable = {[rowId: Id]: PetsRow};
/* Represents a Row when getting the content of the 'pets' Table. */
export type PetsRow = {species: string};
//...

// -- shop.ts --
export const createShop: typeof createShopDecl = () => {
  //...
};
```

This release includes a new `tinybase` CLI tool which allows you to generate Typescript definition and implementation files direct from a schema file:

```
npx tinybase getStoreApi schema.json shop api

    Definition: [...]/api/shop.d.ts
Implementation: [...]/api/shop.ts
```

Finally, the tools module also provides ways to track the overall size and structure of a [`Store`](/api/the-essentials/creating-stores/store/) for use while debugging.

---

## v2.1

This release allows you to create indexes where a single [`Row`](/api/store/type-aliases/store/row/) [`Id`](/api/common/type-aliases/identity/id/) can exist in multiple slices. You can utilize this to build simple keyword searches, for example.

Simply provide a custom getSliceIdOrIds function in the [`setIndexDefinition`](/api/indexes/interfaces/indexes/indexes/methods/configuration/setindexdefinition/) method that returns an array of [`Slice`](/api/indexes/type-aliases/concept/slice/) [`Ids`](/api/common/type-aliases/identity/ids/), rather than a single [`Id`](/api/common/type-aliases/identity/id/):

```
import {createIndexes} from 'tinybase';

store.setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  rex: {species: 'dog'},
});

const indexes = createIndexes(store);
indexes.setIndexDefinition('containsLetter', 'pets', (_, rowId) =>
  rowId.split(''),
);

console.log(indexes.getSliceIds('containsLetter'));
// -> ['f', 'i', 'd', 'o', 'e', 'l', 'x', 'r']
console.log(indexes.getSliceRowIds('containsLetter', 'i'));
// -> ['fido', 'felix']
console.log(indexes.getSliceRowIds('containsLetter', 'x'));
// -> ['felix', 'rex']
```

This functionality is showcased in the [Word Frequencies](/demos/word-frequencies/) demo if you would like to see it in action.

---

## v2.0

**Announcing the next major version of TinyBase 2.0!** This is an exciting release that evolves TinyBase towards becoming a reactive, relational data store, complete with querying, sorting, and pagination. Here are a few of the highlights...

### Query Engine

The [flagship feature](/guides/making-queries/using-queries/) of this release is the new [`queries`](/api/queries/) module. This allows you to build expressive queries against your data with a SQL-adjacent API that we've cheekily called [TinyQL](/guides/making-queries/tinyql/). The query engine lets you select, join, filter, group, sort and paginate data. And of course, it's all reactive!

The best way to see the power of this new engine is with the two new demos we've included this release:

![Thumbnail of demo](/car-analysis.webp "Thumbnail of demo") The [Car Analysis](/demos/car-analysis/) demo showcases the analytical query capabilities of TinyBase v2.0, grouping and sorting dimensional data for lightweight analytical usage, graphing, and tabular display. _[Try this demo here](/demos/car-analysis/)._

![Thumbnail of demo](/movie-database.webp "Thumbnail of demo") The [Movie Database](/demos/movie-database/) demo showcases the relational query capabilities of TinyBase v2.0, joining together information about movies, directors, and actors from across multiple source tables. _[Try this demo here](/demos/movie-database/)._

### Sorting and Pagination

To complement the query engine, you can now sort and paginate [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/). This makes it very easy to build grid-like user interfaces (also shown in the demos above). To achieve this, the [`Store`](/api/the-essentials/creating-stores/store/) now includes the [`getSortedRowIds`](/api/store/interfaces/store/store/methods/getter/getsortedrowids/) method (and the [`addSortedRowIdsListener`](/api/store/interfaces/store/store/methods/listener/addsortedrowidslistener/) method for reactivity), and the [`Queries`](/api/queries/interfaces/queries/queries/) object includes the equivalent [`getResultSortedRowIds`](/api/queries/interfaces/queries/queries/methods/result/getresultsortedrowids/) method and [`addResultSortedRowIdsListener`](/api/queries/interfaces/queries/queries/methods/listener/addresultsortedrowidslistener/) method.

These are also exposed in the optional [`ui-react`](/api/ui-react/) module via the [`useSortedRowIds`](/api/ui-react/functions/store-hooks/usesortedrowids/) hook, the [`useResultSortedRowIds`](/api/ui-react/functions/queries-hooks/useresultsortedrowids/) hook, the [`SortedTableView`](/api/ui-react/functions/store-components/sortedtableview/) component and the [`ResultSortedTableView`](/api/ui-react/functions/queries-components/resultsortedtableview/) component, and so on.

### [`Queries`](/api/queries/interfaces/queries/queries/) in the [`ui-react`](/api/ui-react/) module

The v2.0 query functionality is fully supported by the [`ui-react`](/api/ui-react/) module (to match support for [`Store`](/api/the-essentials/creating-stores/store/), [`Metrics`](/api/metrics/interfaces/metrics/metrics/), [`Indexes`](/api/indexes/interfaces/indexes/indexes/), and [`Relationship`](/api/relationships/type-aliases/concept/relationship/) objects). The [`useCreateQueries`](/api/ui-react/functions/queries-hooks/usecreatequeries/) hook memoizes the creation of app- or component-wide Query objects; and the [`useResultTable`](/api/ui-react/functions/queries-hooks/useresulttable/) hook, [`useResultRow`](/api/ui-react/functions/queries-hooks/useresultrow/) hook, [`useResultCell`](/api/ui-react/functions/queries-hooks/useresultcell/) hook (and so on) let you bind you component to the results of a query.

This is, of course, supplemented with higher-level components: the [`ResultTableView`](/api/ui-react/functions/queries-components/resulttableview/) component, the [`ResultRowView`](/api/ui-react/functions/queries-components/resultrowview/) component, the [`ResultCellView`](/api/ui-react/functions/queries-components/resultcellview/) component, and so on. See the [Building A UI With Queries](/guides/using-queries/building-a-ui-with-queries/) guide for more details.

### It's a big release!

Thank you for all your support as we brought this important new release to life, and we hope you enjoy using it as much as we did building it. Please provide feedback via [GitHub](https://github.com/tinyplex/tinybase), [Bluesky](https://bsky.app/profile/tinybase.bsky.social), and [X](https://x.com/tinybasejs)!

---

## v1.3

Adds support for explicit transaction start and finish methods, as well as listeners for transactions finishing.

The [`startTransaction`](/api/store/interfaces/store/store/methods/transaction/starttransaction/) method and [`finishTransaction`](/api/store/interfaces/store/store/methods/transaction/finishtransaction/) method allow you to explicitly enclose a transaction that will make multiple mutations to the [`Store`](/api/the-essentials/creating-stores/store/), buffering all calls to the relevant listeners until it completes when you call the [`finishTransaction`](/api/store/interfaces/store/store/methods/transaction/finishtransaction/) method.

Unlike the [`transaction`](/api/the-essentials/setting-data/transaction/) method, this approach is useful when you have a more 'open-ended' transaction, such as one containing mutations triggered from other events that are asynchronous or not occurring inline to your code. You must remember to also call the [`finishTransaction`](/api/store/interfaces/store/store/methods/transaction/finishtransaction/) method explicitly when the transaction is started with the [`startTransaction`](/api/store/interfaces/store/store/methods/transaction/starttransaction/) method, of course.

```
store.setTables({pets: {fido: {species: 'dog'}}});
store.addRowListener('pets', 'fido', () => console.log('Fido changed'));

store.startTransaction();
store.setCell('pets', 'fido', 'color', 'brown');
store.setCell('pets', 'fido', 'sold', true);
store.finishTransaction();
// -> 'Fido changed'
```

In addition, see the [`addWillFinishTransactionListener`](/api/store/interfaces/store/store/methods/listener/addwillfinishtransactionlistener/) method and the [`addDidFinishTransactionListener`](/api/store/interfaces/store/store/methods/listener/adddidfinishtransactionlistener/) method for details around listening to transactions completing.

Together, this release allows stores to couple their transaction life-cycles together, which we need for the query engine.

Note: this API was updated to be more comprehensive in v4.0.

---

## v1.2

This adds a way to revert transactions if they have not met certain conditions.

When using the [`transaction`](/api/the-essentials/setting-data/transaction/) method, you can provide an optional `doRollback` callback which should return true if you want to revert the whole transaction at its conclusion.

The callback is provided with two objects, `changedCells` and `invalidCells`, which list all the net changes and invalid attempts at changes that were made during the transaction. You will most likely use the contents of those objects to decide whether the transaction should be rolled back.

Note: this API was updated to be more comprehensive in v4.0.

---

## v1.1

This release allows you to listen to invalid data being added to a [`Store`](/api/the-essentials/creating-stores/store/), allowing you to gracefully handle errors, rather than them failing silently.

There is a new listener type [`InvalidCellListener`](/api/store/type-aliases/listener/invalidcelllistener/) and a [`addInvalidCellListener`](/api/store/interfaces/store/store/methods/listener/addinvalidcelllistener/) method in the [`Store`](/api/the-essentials/creating-stores/store/) interface.

These allow you to keep track of failed attempts to update the [`Store`](/api/the-essentials/creating-stores/store/) with invalid [`Cell`](/api/store/type-aliases/store/cell/) data. These listeners can also be mutators, allowing you to address any failed writes programmatically.

For more information, please see the [`addInvalidCellListener`](/api/store/interfaces/store/store/methods/listener/addinvalidcelllistener/) method documentation. In particular, this explains how this listener behaves for a [`Store`](/api/the-essentials/creating-stores/store/) with a [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/).