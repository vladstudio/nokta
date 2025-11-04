---
title: "Building A UI With Metrics | TinyBase"
url: https://tinybase.org/guides/using-metrics/building-a-ui-with-metrics
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Using Metrics](/guides/using-metrics/)
-   [Building A UI With Metrics](/guides/using-metrics/building-a-ui-with-metrics/)

This guide covers how the [`ui-react`](/api/ui-react/) module supports the [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object.

As with the React-based bindings to a [`Store`](/api/the-essentials/creating-stores/store/) object, the [`ui-react`](/api/ui-react/) module provides both hooks and components to connect your metrics to your interface.

### [`Metrics`](/api/metrics/interfaces/metrics/metrics/) Hooks

The [`useMetric`](/api/ui-react/functions/metrics-hooks/usemetric/) hook is very simple. It gets the current value of a [`Metric`](/api/metrics/type-aliases/metric/metric/), and registers a listener so that any changes to that result will cause a re-render:

```
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createMetrics, createStore} from 'tinybase';
import {useMetric} from 'tinybase/ui-react';

const store = createStore().setTable('species', {
  dog: {price: 5},
  cat: {price: 4},
  worm: {price: 1},
});
const metrics = createMetrics(store);
metrics.setMetricDefinition('highestPrice', 'species', 'max', 'price');
const App = () => <span>{useMetric('highestPrice', metrics)}</span>;

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />);
console.log(app.innerHTML);
// -> '<span>5</span>'

store.setCell('species', 'horse', 'price', 20);
console.log(app.innerHTML);
// -> '<span>20</span>'
```

The [`useCreateMetrics`](/api/ui-react/functions/metrics-hooks/usecreatemetrics/) hook is used to create a [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object within a React application with convenient memoization:

```
import {useCreateMetrics, useCreateStore} from 'tinybase/ui-react';

const App2 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('species', {
      dog: {price: 5},
      cat: {price: 4},
      worm: {price: 1},
    }),
  );
  const metrics = useCreateMetrics(store, (store) =>
    createMetrics(store).setMetricDefinition(
      'highestPrice',
      'species',
      'max',
      'price',
    ),
  );
  return <span>{metrics?.getMetric('highestPrice')}</span>;
};

root.render(<App2 />);
console.log(app.innerHTML);
// -> '<span>5</span>'
```

### [`Metrics`](/api/metrics/interfaces/metrics/metrics/) View

The [`MetricView`](/api/ui-react/functions/metrics-components/metricview/) component renders the current value of a [`Metric`](/api/metrics/type-aliases/metric/metric/), and registers a listener so that any changes to that result will cause a re-render.

```
import {MetricView} from 'tinybase/ui-react';

const App3 = () => (
  <div>
    <MetricView metricId="highestPrice" metrics={metrics} />
  </div>
);

root.render(<App3 />);
console.log(app.innerHTML);
// -> '<div>20</div>'
```

### [`Metrics`](/api/metrics/interfaces/metrics/metrics/) Context

In the same way that a [`Store`](/api/the-essentials/creating-stores/store/) can be passed into a [`Provider`](/api/the-essentials/using-react/provider/) component context and used throughout the app, a [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object can also be provided to be used by default:

```
import {Provider} from 'tinybase/ui-react';

const App4 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('species', {
      dog: {price: 5},
      cat: {price: 4},
      worm: {price: 1},
    }),
  );
  const metrics = useCreateMetrics(store, (store) =>
    createMetrics(store).setMetricDefinition(
      'highestPrice',
      'species',
      'max',
      'price',
    ),
  );

  return (
    <Provider metrics={metrics}>
      <Pane />
    </Provider>
  );
};

const Pane = () => (
  <span>
    <MetricView metricId="highestPrice" />,{useMetric('highestPrice')}
  </span>
);

root.render(<App4 />);
console.log(app.innerHTML);
// -> '<span>5,5</span>'
```

The `metricsById` prop can be used in the same way that the `storesById` prop is, to let you reference multiple [`Metrics`](/api/metrics/interfaces/metrics/metrics/) objects by [`Id`](/api/common/type-aliases/identity/id/).

### Summary

The support for [`Metrics`](/api/metrics/interfaces/metrics/metrics/) objects in the [`ui-react`](/api/ui-react/) module is very similar to that for the [`Store`](/api/the-essentials/creating-stores/store/) object, making it easy to attach [`Metric`](/api/metrics/type-aliases/metric/metric/) results to your user interface.

We finish off this section about the [`metrics`](/api/metrics/) module with the [Advanced Metric Definition](/guides/using-metrics/advanced-metric-definition/) guide.