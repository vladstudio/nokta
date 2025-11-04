---
title: "An Intro To Metrics | TinyBase"
url: https://tinybase.org/guides/using-metrics/an-intro-to-metrics
---

This guide describes how the [`metrics`](/api/metrics/) module gives you the ability to create and track metrics based on the data in [`Store`](/api/the-essentials/creating-stores/store/) objects.

The main entry point to using the [`metrics`](/api/metrics/) module is the [`createMetrics`](/api/metrics/functions/creation/createmetrics/) function, which returns a new [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object. That object in turn has methods that let you create new [`Metric`](/api/metrics/type-aliases/metric/metric/) definitions, access the values of those metrics directly, and register listeners for when they change.

### [The Basics](/guides/the-basics/)

Here's a simple example to show a [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object in action. The `species` [`Table`](/api/store/type-aliases/store/table/) has three [`Row`](/api/store/type-aliases/store/row/) objects, each with a numeric `price` [`Cell`](/api/store/type-aliases/store/cell/). We create a [`Metric`](/api/metrics/type-aliases/metric/metric/) definition called `highestPrice` which is the maximum value of that [`Cell`](/api/store/type-aliases/store/cell/) across the whole [`Table`](/api/store/type-aliases/store/table/):

```
import {createMetrics, createStore} from 'tinybase';

const store = createStore().setTable('species', {
  dog: {price: 5},
  cat: {price: 4},
  worm: {price: 1},
});

const metrics = createMetrics(store);
metrics.setMetricDefinition(
  'highestPrice', // metricId
  'species', //      tableId to aggregate
  'max', //          aggregation
  'price', //        cellId to aggregate
);

console.log(metrics.getMetric('highestPrice'));
// -> 5
```

The out-of-the-box aggregations you can use in the third parameter are `sum`, `avg`, `min`, and `max`, each of which should be self-explanatory.

### [`Metric`](/api/metrics/type-aliases/metric/metric/) Reactivity

Things get interesting when the underlying data changes. The [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object takes care of tracking changes that will affect the [`Metric`](/api/metrics/type-aliases/metric/metric/). A similar paradigm to that used on the [`Store`](/api/the-essentials/creating-stores/store/) is used to let you add a listener to the [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object. The listener fires when there's a new highest price:

```
const listenerId = metrics.addMetricListener('highestPrice', () => {
  console.log(metrics.getMetric('highestPrice'));
});
store.setCell('species', 'horse', 'price', 20);
// -> 20
```

You can set multiple [`Metric`](/api/metrics/type-aliases/metric/metric/) definitions on each [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object. However, a given [`Store`](/api/the-essentials/creating-stores/store/) can only have one [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object associated with it. If you call this function twice on the same [`Store`](/api/the-essentials/creating-stores/store/), your second call will return a reference to the [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object created by the first.

Let's find out how to include metrics in a user interface in the [Building A UI With Metrics](/guides/using-metrics/building-a-ui-with-metrics/) guide.