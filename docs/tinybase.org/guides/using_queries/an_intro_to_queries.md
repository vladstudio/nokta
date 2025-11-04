---
title: "An Intro To Queries | TinyBase"
url: https://tinybase.org/guides/using-queries/an-intro-to-queries
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Using Queries](/guides/using-queries/)
-   [An Intro To Queries](/guides/using-queries/an-intro-to-queries/)

This guide describes how the [`queries`](/api/queries/) module gives you the ability to create queries against [`Tables`](/api/store/type-aliases/store/tables/) in the [`Store`](/api/the-essentials/creating-stores/store/) - such as selecting specific [`Row`](/api/store/type-aliases/store/row/) and [`Cell`](/api/store/type-aliases/store/cell/) combinations from each [`Table`](/api/store/type-aliases/store/table/), or performing powerful features like grouping and aggregation.

The main entry point to using the [`queries`](/api/queries/) module is the [`createQueries`](/api/queries/functions/creation/createqueries/) function, which returns a new [`Queries`](/api/queries/interfaces/queries/queries/) object. That object in turn has methods that let you create new query definitions, access their results directly, and register listeners for when those results change.

The [`Queries`](/api/queries/interfaces/queries/queries/) module provides a generalized query concept for [`Store`](/api/the-essentials/creating-stores/store/) data. If you just want to create and track metrics, indexes, or relationships between rows, you may prefer to use the dedicated [`Metrics`](/api/metrics/interfaces/metrics/metrics/), [`Indexes`](/api/indexes/interfaces/indexes/indexes/), and [`Relationships`](/api/relationships/interfaces/relationships/relationships/) objects, which have simpler APIs.

### [The Basics](/guides/the-basics/)

Here's a simple example to show a [`Queries`](/api/queries/interfaces/queries/queries/) object in action. The `pets` [`Table`](/api/store/type-aliases/store/table/) has three [`Row`](/api/store/type-aliases/store/row/) objects, each with two Cells. We create a query definition called `dogColors` which selects just one of those, and filters the Rows based on the value in the other:

```
import {createQueries, createStore} from 'tinybase';

const store = createStore().setTable('pets', {
  fido: {species: 'dog', color: 'brown'},
  felix: {species: 'cat', color: 'black'},
  cujo: {species: 'dog', color: 'black'},
});

const queries = createQueries(store);
queries.setQueryDefinition('dogColors', 'pets', ({select, where}) => {
  select('color');
  where('species', 'dog');
});

console.log(queries.getResultTable('dogColors'));
// -> {fido: {color: 'brown'}, cujo: {color: 'black'}}
```

The key to understanding how the [`Queries`](/api/queries/interfaces/queries/queries/) API works is in the `setQueryDefinition` line above. You provide a function which will be called with a selection of 'keyword' functions that you can use to define the query. These include `select`, `join`, `where`, `group`, and `having` and are described in the [TinyQL](/guides/using-queries/tinyql/) guide.

Note that, for getting data out, the [`Queries`](/api/queries/interfaces/queries/queries/) object has methods analogous to those in the [`Store`](/api/the-essentials/creating-stores/store/) object, prefixed with the word 'Result':

-   The [`getResultTable`](/api/queries/interfaces/queries/queries/methods/result/getresulttable/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`getTable`](/api/store/interfaces/store/store/methods/getter/gettable/) method.
-   The [`getResultRowIds`](/api/queries/interfaces/queries/queries/methods/result/getresultrowids/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`getRowIds`](/api/store/interfaces/store/store/methods/getter/getrowids/) method.
-   The [`getResultSortedRowIds`](/api/queries/interfaces/queries/queries/methods/result/getresultsortedrowids/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`getSortedRowIds`](/api/store/interfaces/store/store/methods/getter/getsortedrowids/) method.
-   The [`getResultRow`](/api/queries/interfaces/queries/queries/methods/result/getresultrow/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`getRow`](/api/the-essentials/getting-data/getrow/) method.
-   The [`getResultCellIds`](/api/queries/interfaces/queries/queries/methods/result/getresultcellids/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`getCellIds`](/api/store/interfaces/store/store/methods/getter/getcellids/) method.
-   The [`getResultCell`](/api/queries/interfaces/queries/queries/methods/result/getresultcell/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`getCell`](/api/the-essentials/getting-data/getcell/) method.

The same conventions apply for registering listeners with the [`Queries`](/api/queries/interfaces/queries/queries/) object, as described in the following section.

### [`Queries`](/api/queries/interfaces/queries/queries/) Reactivity

As with [`Metrics`](/api/metrics/interfaces/metrics/metrics/), [`Indexes`](/api/indexes/interfaces/indexes/indexes/), and [`Relationships`](/api/relationships/interfaces/relationships/relationships/), [`Queries`](/api/queries/interfaces/queries/queries/) objects take care of tracking changes that will affect the query results. The familiar paradigm is used to let you add a listener to the [`Queries`](/api/queries/interfaces/queries/queries/) object. The listener fires when there's a change to any of the resulting data:

```
const listenerId = queries.addResultTableListener('dogColors', () => {
  console.log(queries.getResultTable('dogColors'));
});
store.setCell('pets', 'cujo', 'species', 'wolf');
// -> {fido: {color: 'brown'}}
```

Hopefully the pattern of the method naming is now familiar:

-   The [`addResultTableListener`](/api/queries/interfaces/queries/queries/methods/listener/addresulttablelistener/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`addTableListener`](/api/store/interfaces/store/store/methods/listener/addtablelistener/) method.
-   The [`addResultRowIdsListener`](/api/queries/interfaces/queries/queries/methods/listener/addresultrowidslistener/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`addRowIdsListener`](/api/store/interfaces/store/store/methods/listener/addrowidslistener/) method.
-   The [`addResultSortedRowIdsListener`](/api/queries/interfaces/queries/queries/methods/listener/addresultsortedrowidslistener/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`addSortedRowIdsListener`](/api/store/interfaces/store/store/methods/listener/addsortedrowidslistener/) method.
-   The [`addResultRowListener`](/api/queries/interfaces/queries/queries/methods/listener/addresultrowlistener/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`addRowListener`](/api/the-essentials/listening-for-changes/addrowlistener/) method.
-   The [`addResultCellIdsListener`](/api/queries/interfaces/queries/queries/methods/listener/addresultcellidslistener/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`addCellIdsListener`](/api/store/interfaces/store/store/methods/listener/addcellidslistener/) method.
-   The [`addResultCellListener`](/api/queries/interfaces/queries/queries/methods/listener/addresultcelllistener/) method is the [`Queries`](/api/queries/interfaces/queries/queries/) equivalent of the [`addCellListener`](/api/the-essentials/listening-for-changes/addcelllistener/) method.

You can set multiple query definitions on each [`Queries`](/api/queries/interfaces/queries/queries/) object. However, a given [`Store`](/api/the-essentials/creating-stores/store/) can only have one [`Queries`](/api/queries/interfaces/queries/queries/) object associated with it. If you call this function twice on the same [`Store`](/api/the-essentials/creating-stores/store/), your second call will return a reference to the [`Queries`](/api/queries/interfaces/queries/queries/) object created by the first.

Let's find out how to create different types of queries in the [TinyQL](/guides/using-queries/tinyql/) guide.