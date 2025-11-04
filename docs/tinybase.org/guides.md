---
title: "Guides | TinyBase"
url: https://tinybase.org/guides
---

This series of guides helps explain the concepts behind TinyBase and is designed to complement the more comprehensive API documentation.

## The Basics

These guides cover the very basics of TinyBase. [Read more](/guides/the-basics/).

-   [Getting Started](/guides/the-basics/getting-started/)
-   [Creating A Store](/guides/the-basics/creating-a-store/)
-   [Writing To Stores](/guides/the-basics/writing-to-stores/)
-   [Reading From Stores](/guides/the-basics/reading-from-stores/)
-   [Listening To Stores](/guides/the-basics/listening-to-stores/)
-   [Transactions](/guides/the-basics/transactions/)
-   [Importing TinyBase](/guides/the-basics/importing-tinybase/)
-   [TinyBase And TypeScript](/guides/the-basics/tinybase-and-typescript/)
-   [Architectural Options](/guides/the-basics/architectural-options/)

## Building UIs

These guides cover how to use the [`ui-react`](/api/ui-react/) module and use React hooks and components to easily build reactive user interfaces with TinyBase. [Read more](/guides/building-uis/).

-   [Getting Started With ui-react](/guides/building-uis/getting-started-with-ui-react/)
-   [Using React Hooks](/guides/building-uis/using-react-hooks/)
-   [Using React Components](/guides/building-uis/using-react-components/)
-   [Using React DOM Components](/guides/building-uis/using-react-dom-components/)
-   [Using Context](/guides/building-uis/using-context/)

## Schemas

These guides discuss how to set up a [`ValuesSchema`](/api/store/type-aliases/schema/valuesschema/) or [`TablesSchema`](/api/store/type-aliases/schema/tablesschema/) on a [`Store`](/api/the-essentials/creating-stores/store/) so that certain structures of data are assured. [Read more](/guides/schemas/).

-   [Using Schemas](/guides/schemas/using-schemas/)
-   [Schema-Based Typing](/guides/schemas/schema-based-typing/)
-   [Mutating Data With Listeners](/guides/schemas/mutating-data-with-listeners/)

## Persistence

These guides discuss how to load and save data to a [`Store`](/api/the-essentials/creating-stores/store/) from a persistence layer. [Read more](/guides/persistence/).

-   [An Intro To Persistence](/guides/persistence/an-intro-to-persistence/)
-   [Database Persistence](/guides/persistence/database-persistence/)
-   [Third-Party CRDT Persistence](/guides/persistence/third-party-crdt-persistence/)
-   [Custom Persistence](/guides/persistence/custom-persistence/)

## Synchronization

These guides discuss how to merge and synchronize data in [`MergeableStore`](/api/mergeable-store/interfaces/mergeable/mergeablestore/) instances using synchronization techniques. [Read more](/guides/synchronization/).

-   [Using A MergeableStore](/guides/synchronization/using-a-mergeablestore/)
-   [Using A Synchronizer](/guides/synchronization/using-a-synchronizer/)

## Integrations

There are plenty of other projects, products, and platforms that TinyBase can work with and alongside. [Read more](/guides/integrations/).

-   [Cloudflare Durable Objects](/guides/integrations/cloudflare-durable-objects/)

## Using Metrics

These guides discuss how to define [`Metrics`](/api/metrics/interfaces/metrics/metrics/) that aggregate values together. [Read more](/guides/using-metrics/).

-   [An Intro To Metrics](/guides/using-metrics/an-intro-to-metrics/)
-   [Building A UI With Metrics](/guides/using-metrics/building-a-ui-with-metrics/)
-   [Advanced Metric Definition](/guides/using-metrics/advanced-metric-definition/)

## Using Indexes

These guides discuss how to define [`Indexes`](/api/indexes/interfaces/indexes/indexes/) that allow fast access to matching [`Row`](/api/store/type-aliases/store/row/) objects. [Read more](/guides/using-indexes/).

-   [An Intro To Indexes](/guides/using-indexes/an-intro-to-indexes/)
-   [Building A UI With Indexes](/guides/using-indexes/building-a-ui-with-indexes/)
-   [Advanced Index Definition](/guides/using-indexes/advanced-index-definition/)

## Using Relationships

These guides discuss how to define [`Relationships`](/api/relationships/interfaces/relationships/relationships/) that connect Rows together between [`Table`](/api/store/type-aliases/store/table/) objects. [Read more](/guides/using-relationships/).

-   [An Intro To Relationships](/guides/using-relationships/an-intro-to-relationships/)
-   [Building A UI With Relationships](/guides/using-relationships/building-a-ui-with-relationships/)
-   [Advanced Relationship Definitions](/guides/using-relationships/advanced-relationship-definitions/)

## Using Checkpoints

These guides discuss how to use [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) that allow you to build undo and redo functionality. [Read more](/guides/using-checkpoints/).

-   [An Intro To Checkpoints](/guides/using-checkpoints/an-intro-to-checkpoints/)
-   [Building A UI With Checkpoints](/guides/using-checkpoints/building-a-ui-with-checkpoints/)

## Using Queries

These guides discuss how to define queries that let you select specific [`Row`](/api/store/type-aliases/store/row/) and [`Cell`](/api/store/type-aliases/store/cell/) combinations from each [`Table`](/api/store/type-aliases/store/table/), and benefit from powerful features like grouping and aggregation. [Read more](/guides/using-queries/).

-   [An Intro To Queries](/guides/using-queries/an-intro-to-queries/)
-   [TinyQL](/guides/using-queries/tinyql/)
-   [Building A UI With Queries](/guides/using-queries/building-a-ui-with-queries/)

## Inspecting Data

If you are using TinyBase with React, you can use its web-based inspector, the [`Inspector`](/api/the-essentials/using-react/inspector/) component, that allows you to reason about the data during development. [Read more](/guides/inspecting-data/).

## How TinyBase Is Built

These guides discuss how TinyBase is structured and some of the interesting ways in which it is architected, tested, and built. [Read more](/guides/how-tinybase-is-built/).

-   [Developing TinyBase](/guides/how-tinybase-is-built/developing-tinybase/)
-   [Architecture](/guides/how-tinybase-is-built/architecture/)
-   [Testing](/guides/how-tinybase-is-built/testing/)
-   [Documentation](/guides/how-tinybase-is-built/documentation/)
-   [How The Demos Work](/guides/how-tinybase-is-built/how-the-demos-work/)
-   [Credits](/guides/how-tinybase-is-built/credits/)

## FAQ

These are some of the frequently asked questions about TinyBase. [Read more](/guides/faq/).

## Releases

This is a reverse chronological list of the major TinyBase releases, with highlighted features. [Read more](/guides/releases/).