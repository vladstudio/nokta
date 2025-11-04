---
title: "Synchronization | TinyBase"
url: https://tinybase.org/guides/synchronization
---

These guides discuss how to merge and synchronize data in [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) instances using synchronization techniques.

The basic building block of TinyBase's synchronization system is the [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) interface. This is a sub-type of the regular [`Store`](/api/the-essentials/creating-stores/store/) - so all your existing calls to the [`Store`](/api/the-essentials/creating-stores/store/) methods will be unchanged - but it records additional metadata as the data is changed so that potential conflicts can be reconciled. See the [Using A MergeableStore](/guides/synchronization/using-a-mergeablestore/) guide for more details.

On top of this, the synchronizer module framework uses this metadata to let you synchronize [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) data between different devices, systems, or subsystems. Synchronization can take place over WebSockets, the browser's BroadcastChannel API, or other custom media. See the [Using A Synchronizer](/guides/synchronization/using-a-synchronizer/) guide for more details.

It's possible - and in fact recommended! - to use both persistence and synchronization at the same time. You will often want to persist changes to your TinyBase data between browser reloads even when offline, for example, and then synchronize to other devices or a server once the device comes back online.

See also the [Todo App v6 (collaboration)](/demos/todo-app/todo-app-v6-collaboration/) demo for a simple example of adding synchronization between clients to an app.

## Using A MergeableStore

The basic building block of TinyBase's synchronization system is the [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) interface. [Read more](/guides/synchronization/using-a-mergeablestore/).

## Using A Synchronizer

The synchronizer module framework lets you synchronize [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) data between different devices, systems, or subsystems. [Read more](/guides/synchronization/using-a-synchronizer/).