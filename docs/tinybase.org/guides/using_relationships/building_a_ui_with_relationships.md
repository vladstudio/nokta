---
title: "Building A UI With Relationships | TinyBase"
url: https://tinybase.org/guides/using-relationships/building-a-ui-with-relationships
---

-   [TinyBase](/)
-   [Guides](/guides/)
-   [Using Relationships](/guides/using-relationships/)
-   [Building A UI With Relationships](/guides/using-relationships/building-a-ui-with-relationships/)

This guide covers how the [`ui-react`](/api/ui-react/) module supports the [`Relationships`](/api/relationships/interfaces/relationships/relationships/) object.

As with the React-based bindings to a [`Store`](/api/the-essentials/creating-stores/store/) object, the [`ui-react`](/api/ui-react/) module provides both hooks and components to connect your relationships to your interface.

### [`Relationships`](/api/relationships/interfaces/relationships/relationships/) Hooks

As you may have guessed by now, there are three hooks you'll commonly use here:

-   The [`useRemoteRowId`](/api/ui-react/functions/relationships-hooks/useremoterowid/) hook gets the remote [`Row`](/api/store/type-aliases/store/row/) [`Id`](/api/common/type-aliases/identity/id/) for a given local [`Row`](/api/store/type-aliases/store/row/) in a [`Relationship`](/api/relationships/type-aliases/concept/relationship/).
-   The [`useLocalRowIds`](/api/ui-react/functions/relationships-hooks/uselocalrowids/) hook gets the local [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/) for a given remote [`Row`](/api/store/type-aliases/store/row/) in a [`Relationship`](/api/relationships/type-aliases/concept/relationship/).
-   The [`useLinkedRowIds`](/api/ui-react/functions/relationships-hooks/uselinkedrowids/) hook gets the linked [`Row`](/api/store/type-aliases/store/row/) [`Ids`](/api/common/type-aliases/identity/ids/) for a given [`Row`](/api/store/type-aliases/store/row/) in a linked list [`Relationship`](/api/relationships/type-aliases/concept/relationship/).

Each hook registers a listener so that any relevant changes will cause a re-render. As an example:

```
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createRelationships, createStore} from 'tinybase';
import {useRemoteRowId} from 'tinybase/ui-react';

const store = createStore()
  .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
  .setTable('species', {wolf: {price: 10}, dog: {price: 5}});
const relationships = createRelationships(store).setRelationshipDefinition(
  'petSpecies',
  'pets',
  'species',
  'species',
);
const App = () => (
  <span>{useRemoteRowId('petSpecies', 'cujo', relationships)}</span>
);

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />);
console.log(app.innerHTML);
// -> '<span>dog</span>'

store.setCell('pets', 'cujo', 'species', 'wolf');
console.log(app.innerHTML);
// -> '<span>wolf</span>'
```

The [`useCreateRelationships`](/api/ui-react/functions/relationships-hooks/usecreaterelationships/) hook is used to create a [`Relationships`](/api/relationships/interfaces/relationships/relationships/) object within a React application with convenient memoization:

```
import {useCreateRelationships, useCreateStore} from 'tinybase/ui-react';

const App2 = () => {
  const store = useCreateStore(() =>
    createStore()
      .setTable('pets', {
        fido: {species: 'dog'},
        felix: {species: 'cat'},
        cujo: {species: 'dog'},
      })
      .setTable('species', {dog: {price: 5}, cat: {price: 4}}),
  );
  const relationships = useCreateRelationships(store, (store) =>
    createRelationships(store).setRelationshipDefinition(
      'petSpecies',
      'pets',
      'species',
      'species',
    ),
  );
  return <span>{relationships?.getRemoteRowId('petSpecies', 'fido')}</span>;
};

root.render(<App2 />);
console.log(app.innerHTML);
// -> '<span>dog</span>'
```

### [`Relationships`](/api/relationships/interfaces/relationships/relationships/) Views

The three components you'll use for rendering the contents of [`Relationships`](/api/relationships/interfaces/relationships/relationships/) are the [`RemoteRowView`](/api/ui-react/functions/relationships-components/remoterowview/) component, [`LocalRowsView`](/api/ui-react/functions/relationships-components/localrowsview/) component, and [`LinkedRowsView`](/api/ui-react/functions/relationships-components/linkedrowsview/) component, each of which matches the three types of getters as expected.

Also as expected (hopefully by now!), each registers a listener so that any changes to that result will cause a re-render.

These components can be given a custom RowView-compatible component to render their [`Row`](/api/store/type-aliases/store/row/) children:

```
import {CellView, RemoteRowView} from 'tinybase/ui-react';

const MyRowView = (props) => (
  <>
    {props.rowId}: <CellView {...props} cellId="price" />
  </>
);

const App3 = () => (
  <div>
    <RemoteRowView
      relationshipId="petSpecies"
      localRowId="cujo"
      rowComponent={MyRowView}
      relationships={relationships}
    />
  </div>
);

root.render(<App3 />);
console.log(app.innerHTML);
// -> '<div>wolf: 10</div>'
```

### [`Relationships`](/api/relationships/interfaces/relationships/relationships/) Context

In the same way that other objects can be passed into a [`Provider`](/api/the-essentials/using-react/provider/) component context and used throughout the app, a [`Relationships`](/api/relationships/interfaces/relationships/relationships/) object can also be provided to be used by default:

```
import {Provider} from 'tinybase/ui-react';

const App4 = () => {
  const store = useCreateStore(() =>
    createStore()
      .setTable('pets', {fido: {species: 'dog'}, cujo: {species: 'dog'}})
      .setTable('species', {wolf: {price: 10}, dog: {price: 5}}),
  );
  const relationships = useCreateRelationships(store, (store) =>
    createRelationships(store).setRelationshipDefinition(
      'petSpecies',
      'pets',
      'species',
      'species',
    ),
  );

  return (
    <Provider relationships={relationships}>
      <Pane />
    </Provider>
  );
};

const Pane = () => (
  <span>
    <RemoteRowView
      relationshipId="petSpecies"
      localRowId="cujo"
      debugIds={true}
    />
    /{useRemoteRowId('petSpecies', 'cujo')}
  </span>
);

root.render(<App4 />);
console.log(app.innerHTML);
// -> '<span>cujo:{dog:{price:{5}}}/dog</span>'
```

The `relationshipsById` prop can be used in the same way that the `storesById` prop is, to let you reference multiple [`Relationships`](/api/relationships/interfaces/relationships/relationships/) objects by [`Id`](/api/common/type-aliases/identity/id/).

### Summary

The support for [`Relationships`](/api/relationships/interfaces/relationships/relationships/) objects in the [`ui-react`](/api/ui-react/) module is very similar to that for the [`Store`](/api/the-essentials/creating-stores/store/) object, making it easy to attach relationships to your user interface.

We finish off this section about the [`relationships`](/api/relationships/) module with the Advanced [`Relationship`](/api/relationships/type-aliases/concept/relationship/) Definition guide.