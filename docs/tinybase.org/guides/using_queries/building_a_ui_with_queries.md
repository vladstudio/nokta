---
title: "Building A UI With Queries | TinyBase"
url: https://tinybase.org/guides/using-queries/building-a-ui-with-queries
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Using Queries](/guides/using-queries/)
-   [Building A UI With Queries](/guides/using-queries/building-a-ui-with-queries/)

This guide covers how the [`ui-react`](/api/ui-react/) module supports the [`Queries`](/api/queries/interfaces/queries/queries/) object.

As with the React-based bindings to a [`Store`](/api/the-essentials/creating-stores/store/) object, the [`ui-react`](/api/ui-react/) module provides both hooks and components to connect your queries to your interface.

### [`Queries`](/api/queries/interfaces/queries/queries/) Hooks

In previous guides, we've seen how the [`Queries`](/api/queries/interfaces/queries/queries/) methods follow the same conventions as raw [`Table`](/api/store/type-aliases/store/table/) methods, such as how The [`getResultRow`](/api/queries/interfaces/queries/queries/methods/result/getresultrow/) method is the equivalent of the [`getRow`](/api/the-essentials/getting-data/getrow/) method.

So it should be no surprise that the ui-react hooks follow the same convention, and that the hooks correspond to each of the Query getter methods:

-   The [`useResultTable`](/api/ui-react/functions/queries-hooks/useresulttable/) hook is the reactive equivalent of the getResultTable method.
-   The [`useResultRowIds`](/api/ui-react/functions/queries-hooks/useresultrowids/) hook is the reactive equivalent of the getResultRowIds method.
-   The [`useResultSortedRowIds`](/api/ui-react/functions/queries-hooks/useresultsortedrowids/) hook is the reactive equivalent of the [`getResultSortedRowIds`](/api/queries/interfaces/queries/queries/methods/result/getresultsortedrowids/) method.
-   The [`useResultRow`](/api/ui-react/functions/queries-hooks/useresultrow/) hook is the reactive equivalent of the [`getResultRow`](/api/queries/interfaces/queries/queries/methods/result/getresultrow/) method.
-   The [`useResultCellIds`](/api/ui-react/functions/queries-hooks/useresultcellids/) hook is the reactive equivalent of the getResultCellIds method.
-   The [`useResultCell`](/api/ui-react/functions/queries-hooks/useresultcell/) hook is the reactive equivalent of the [`getResultCell`](/api/queries/interfaces/queries/queries/methods/result/getresultcell/) method.

Each hook registers a listener so that any relevant changes will cause a re-render. As an example:

```
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createQueries, createStore} from 'tinybase';
import {useResultRowIds} from 'tinybase/ui-react';

const store = createStore().setTable('pets', {
  fido: {species: 'dog', color: 'brown'},
  felix: {species: 'cat', color: 'black'},
  cujo: {species: 'dog', color: 'black'},
});
const queries = createQueries(store).setQueryDefinition(
  'dogColors',
  'pets',
  ({select, where}) => {
    select('color');
    where('species', 'dog');
  },
);
const App = () => (
  <span>{JSON.stringify(useResultRowIds('dogColors', queries))}</span>
);

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />);
console.log(app.innerHTML);
// -> '<span>["fido","cujo"]</span>'

store.setCell('pets', 'cujo', 'species', 'wolf');
console.log(app.innerHTML);
// -> '<span>["fido"]</span>'
```

The [`useCreateQueries`](/api/ui-react/functions/queries-hooks/usecreatequeries/) hook is used to create a [`Queries`](/api/queries/interfaces/queries/queries/) object within a React application with convenient memoization:

```
import {useCreateQueries, useCreateStore} from 'tinybase/ui-react';

const App2 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('pets', {
      fido: {species: 'dog', color: 'brown'},
      felix: {species: 'cat', color: 'black'},
      cujo: {species: 'dog', color: 'black'},
    }),
  );
  const queries = useCreateQueries(store, (store) =>
    createQueries(store).setQueryDefinition(
      'dogColors',
      'pets',
      ({select, where}) => {
        select('color');
        where('species', 'dog');
      },
    ),
  );
  return <span>{JSON.stringify(useResultRowIds('dogColors', queries))}</span>;
};

root.render(<App2 />);
console.log(app.innerHTML);
// -> '<span>["fido","cujo"]</span>'
```

### [`Queries`](/api/queries/interfaces/queries/queries/) Views

Entirely following convention, there are also components for rendering the contents of queries: the [`ResultTableView`](/api/ui-react/functions/queries-components/resulttableview/) component, the [`ResultSortedTableView`](/api/ui-react/functions/queries-components/resultsortedtableview/) component, the [`ResultRowView`](/api/ui-react/functions/queries-components/resultrowview/) component, and the [`ResultCellView`](/api/ui-react/functions/queries-components/resultcellview/) component. Again, simple prefix the component names with `Result`.

And of course, each registers a listener so that any changes to that result will cause a re-render.

Just like their [`Store`](/api/the-essentials/creating-stores/store/) equivalents, these components can be given a custom components to render their children:

```
import {ResultCellView, ResultTableView} from 'tinybase/ui-react';

const MyResultRowView = (props) => (
  <span>
    {props.rowId}: <ResultCellView {...props} cellId="color" />
  </span>
);

const App3 = () => (
  <div>
    <ResultTableView
      queryId="dogColors"
      resultRowComponent={MyResultRowView}
      queries={queries}
    />
  </div>
);

store.setTable('pets', {
  fido: {species: 'dog', color: 'brown'},
  felix: {species: 'cat', color: 'black'},
  cujo: {species: 'dog', color: 'black'},
});

root.render(<App3 />);
console.log(app.innerHTML);
// -> '<div><span>fido: brown</span><span>cujo: black</span></div>'
```

### [`Queries`](/api/queries/interfaces/queries/queries/) Context

In the same way that other objects can be passed into a [`Provider`](/api/the-essentials/using-react/provider/) component context and used throughout the app, a [`Queries`](/api/queries/interfaces/queries/queries/) object can also be provided to be used by default:

```
import {Provider, ResultRowView, useRemoteRowId} from 'tinybase/ui-react';

const App4 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('pets', {
      fido: {species: 'dog', color: 'brown'},
      felix: {species: 'cat', color: 'black'},
      cujo: {species: 'dog', color: 'black'},
    }),
  );
  const queries = useCreateQueries(store, (store) =>
    createQueries(store).setQueryDefinition(
      'dogColors',
      'pets',
      ({select, where}) => {
        select('color');
        where('species', 'dog');
      },
    ),
  );

  return (
    <Provider queries={queries}>
      <Pane />
    </Provider>
  );
};

const Pane = () => (
  <span>
    <ResultRowView queryId="dogColors" rowId="cujo" debugIds={true} />/
    {useRemoteRowId('dogColors', 'cujo')}
  </span>
);

root.render(<App4 />);
console.log(app.innerHTML);
// -> '<span>cujo:{color:{black}}/</span>'
```

The `queriesById` prop can be used in the same way that the `storesById` prop is, to let you reference multiple [`Queries`](/api/queries/interfaces/queries/queries/) objects by [`Id`](/api/common/type-aliases/identity/id/).

### Summary

The support for [`Queries`](/api/queries/interfaces/queries/queries/) objects in the [`ui-react`](/api/ui-react/) module is very similar to that for the [`Store`](/api/the-essentials/creating-stores/store/) object, making it easy to attach queries to your user interface.

We now move on to learning about the Inspector tool that TinyBase provides. Read more about that in the Inspector Data guide.