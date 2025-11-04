---
title: "Building A UI With Indexes | TinyBase"
url: https://tinybase.org/guides/using-indexes/building-a-ui-with-indexes
---

This guide covers how the [`ui-react`](/api/ui-react/) module supports the [`Indexes`](/api/indexes/interfaces/indexes/indexes/) object.

As with the React-based bindings to a [`Store`](/api/the-essentials/creating-stores/store/) object, the [`ui-react`](/api/ui-react/) module provides both hooks and components to connect your indexes to your interface.

### [`Indexes`](/api/indexes/interfaces/indexes/indexes/) Hooks

The [`useSliceIds`](/api/ui-react/functions/indexes-hooks/usesliceids/) hook is as simple as it sounds. It gets the current set of [`Slice`](/api/indexes/type-aliases/concept/slice/) [`Ids`](/api/common/type-aliases/identity/ids/) in an [`Index`](/api/indexes/type-aliases/concept/index/), and registers a listener so that any changes to that result will cause a re-render:

```
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createIndexes, createStore} from 'tinybase';
import {useSliceIds} from 'tinybase/ui-react';

const store = createStore().setTable('pets', {
  fido: {species: 'dog'},
  felix: {species: 'cat'},
  cujo: {species: 'dog'},
});
const indexes = createIndexes(store);
indexes.setIndexDefinition(
  'bySpecies', // indexId
  'pets', //      tableId to index
  'species', //   cellId to index on
);
const App = () => (
  <span>{JSON.stringify(useSliceIds('bySpecies', indexes))}</span>
);

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />);
console.log(app.innerHTML);
// -> '<span>["dog","cat"]</span>'

store.setRow('pets', 'lowly', {species: 'worm'});
console.log(app.innerHTML);
// -> '<span>["dog","cat","worm"]</span>'
```

The [`useCreateIndexes`](/api/ui-react/functions/indexes-hooks/usecreateindexes/) hook is used to create an [`Indexes`](/api/indexes/interfaces/indexes/indexes/) object within a React application with convenient memoization:

```
import {useCreateIndexes, useCreateStore} from 'tinybase/ui-react';

const App2 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('pets', {
      fido: {species: 'dog'},
      felix: {species: 'cat'},
      cujo: {species: 'dog'},
    }),
  );
  const indexes = useCreateIndexes(store, (store) =>
    createIndexes(store).setIndexDefinition('bySpecies', 'pets', 'species'),
  );
  return <span>{JSON.stringify(useSliceIds('bySpecies', indexes))}</span>;
};

root.render(<App2 />);
console.log(app.innerHTML);
// -> '<span>["dog","cat"]</span>'
```

### [`Index`](/api/indexes/type-aliases/concept/index/) And [`Slice`](/api/indexes/type-aliases/concept/slice/) Views

The [`IndexView`](/api/ui-react/functions/indexes-components/indexview/) component renders the structure of an [`Index`](/api/indexes/type-aliases/concept/index/), and registers a listener so that any changes to that result will cause a re-render. The [`SliceView`](/api/ui-react/functions/indexes-components/sliceview/) component renders just a single [`Slice`](/api/indexes/type-aliases/concept/slice/) by iterating over each [`Row`](/api/store/type-aliases/store/row/) in that [`Slice`](/api/indexes/type-aliases/concept/slice/).

As with all ui-react view components, these use their corresponding hooks under the covers, which means that any changes to the [`Index`](/api/indexes/type-aliases/concept/index/) or the [`Row`](/api/store/type-aliases/store/row/) objects referenced by it will cause a re-render.

```
import {SliceView} from 'tinybase/ui-react';

const App3 = () => (
  <div>
    <SliceView
      indexId="bySpecies"
      sliceId="dog"
      indexes={indexes}
      debugIds={true}
    />
  </div>
);

root.render(<App3 />);
console.log(app.innerHTML);
// -> '<div>dog:{fido:{species:{dog}}cujo:{species:{dog}}}</div>'
```

A SliceView can be given a custom RowView-compatible component to render its children, much like a [`TableView`](/api/ui-react/functions/store-components/tableview/) component can. And an IndexView can be in turn given a custom SliceView-compatible component:

```
import {IndexView} from 'tinybase/ui-react';

const MyRowView = (props) => <>{props.rowId};</>;

const MySliceView = (props) => (
  <div>
    {props.sliceId}:<SliceView {...props} rowComponent={MyRowView} />
  </div>
);

const App4 = () => (
  <IndexView
    indexId="bySpecies"
    indexes={indexes}
    sliceComponent={MySliceView}
  />
);

root.render(<App4 />);
console.log(app.innerHTML);
// -> '<div>dog:fido;cujo;</div><div>cat:felix;</div><div>worm:lowly;</div>'
```

### [`Indexes`](/api/indexes/interfaces/indexes/indexes/) Context

In the same way that a [`Store`](/api/the-essentials/creating-stores/store/) can be passed into a [`Provider`](/api/the-essentials/using-react/provider/) component context and used throughout the app, an [`Indexes`](/api/indexes/interfaces/indexes/indexes/) object can also be provided to be used by default:

```
import {Provider, useSliceRowIds} from 'tinybase/ui-react';

const App5 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('pets', {
      fido: {species: 'dog'},
      felix: {species: 'cat'},
      cujo: {species: 'dog'},
    }),
  );
  const indexes = useCreateIndexes(store, (store) =>
    createIndexes(store).setIndexDefinition('bySpecies', 'pets', 'species'),
  );

  return (
    <Provider indexes={indexes}>
      <Pane />
    </Provider>
  );
};

const Pane = () => (
  <span>
    <SliceView indexId="bySpecies" sliceId="dog" debugIds={true} />/
    {useSliceRowIds('bySpecies', 'cat')}
  </span>
);

root.render(<App5 />);
console.log(app.innerHTML);
// -> '<span>dog:{fido:{species:{dog}}cujo:{species:{dog}}}/felix</span>'
```

The `indexesById` prop can be used in the same way that the `storesById` prop is, to let you reference multiple [`Indexes`](/api/indexes/interfaces/indexes/indexes/) objects by [`Id`](/api/common/type-aliases/identity/id/).

### Summary

The support for [`Indexes`](/api/indexes/interfaces/indexes/indexes/) objects in the [`ui-react`](/api/ui-react/) module is very similar to that for the [`Store`](/api/the-essentials/creating-stores/store/) object and [`Metrics`](/api/metrics/interfaces/metrics/metrics/) object, making it easy to attach [`Index`](/api/indexes/type-aliases/concept/index/) and [`Slice`](/api/indexes/type-aliases/concept/slice/) contents to your user interface.

We finish off this section about the [`indexes`](/api/indexes/) module with the [Advanced Index Definition](/guides/using-indexes/advanced-index-definition/) guide.