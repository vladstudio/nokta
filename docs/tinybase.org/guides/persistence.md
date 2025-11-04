---
title: "Persistence | TinyBase"
url: https://tinybase.org/guides/persistence
---

These guides discuss how to load and save data to a [`Store`](/api/the-essentials/creating-stores/store/) from a persistence layer.

See also the [Countries](/demos/countries/) demo, the [Todo App](/demos/todo-app/) demos, and the [Drawing](/demos/drawing/) demo.

## An Intro To Persistence

The persister module framework lets you save and load [`Store`](/api/the-essentials/creating-stores/store/) data to and from different locations, or underlying storage types. [Read more](/guides/persistence/an-intro-to-persistence/).

## Database Persistence

Since v4.0, there are various options for persisting [`Store`](/api/the-essentials/creating-stores/store/) data to and from SQLite databases, via a range of third-party modules. [Read more](/guides/persistence/database-persistence/).

## Third-Party CRDT Persistence

Some persister modules let you save and load [`Store`](/api/the-essentials/creating-stores/store/) data to underlying storage types that can provide synchronization, local-first reconciliation, and CRDTs. [Read more](/guides/persistence/third-party-crdt-persistence/).

## Custom Persistence

When you want to load and save [`Store`](/api/the-essentials/creating-stores/store/) data in unusual or custom ways, you can used the [`createCustomPersister`](/api/persisters/functions/creation/createcustompersister/) function to do so in any way you wish. [Read more](/guides/persistence/custom-persistence/).