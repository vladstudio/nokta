---
title: "Building A UI With Checkpoints | TinyBase"
url: https://tinybase.org/guides/using-checkpoints/building-a-ui-with-checkpoints
---

This guide covers how the [`ui-react`](/api/ui-react/) module supports the [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) object. After all, if you have undo functionality in your app, you probably want an undo button!

As with all the other React-based bindings we've discussed, the [`ui-react`](/api/ui-react/) module provides both hooks and components to connect your checkpoints to your interface.

### [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) Hooks

Firstly, the [`useCheckpointIds`](/api/ui-react/functions/checkpoints-hooks/usecheckpointids/) hook is the reactive version of the [`getCheckpointIds`](/api/checkpoints/interfaces/checkpoints/checkpoints/methods/getter/getcheckpointids/) method and returns the three-part [`CheckpointIds`](/api/checkpoints/type-aliases/identity/checkpointids/) array.

```
import React from 'react';
import {createRoot} from 'react-dom/client';
import {createCheckpoints, createStore} from 'tinybase';
import {useCheckpointIds} from 'tinybase/ui-react';

const store = createStore().setTable('pets', {fido: {species: 'dog'}});
const checkpoints = createCheckpoints(store);
const App = () => <span>{JSON.stringify(useCheckpointIds(checkpoints))}</span>;

const app = document.createElement('div');
const root = createRoot(app);
root.render(<App />);
console.log(app.innerHTML);
// -> '<span>[[],"0",[]]</span>'

store.setCell('pets', 'fido', 'sold', true);
console.log(app.innerHTML);
// -> '<span>[["0"],null,[]]</span>'

checkpoints.addCheckpoint('sale');
console.log(app.innerHTML);
// -> '<span>[["0"],"1",[]]</span>'
```

This is not yet extremely useful for constructing an undo and redo UI! The [`useCheckpoint`](/api/ui-react/functions/checkpoints-hooks/usecheckpoint/) hook returns the label of a checkpoint so that the user knows what they are undoing, for example:

```
import {useCheckpoint} from 'tinybase/ui-react';

const App2 = () => <span>{useCheckpoint('2', checkpoints)}</span>;

root.render(<App2 />);
console.log(app.innerHTML);
// -> '<span></span>'

store.setCell('pets', 'fido', 'color', 'brown');
checkpoints.addCheckpoint('color');
console.log(app.innerHTML);
// -> '<span>color</span>'
```

Further, hooks like the [`useGoBackwardCallback`](/api/ui-react/functions/checkpoints-hooks/usegobackwardcallback/) hook and the [`useGoForwardCallback`](/api/ui-react/functions/checkpoints-hooks/usegoforwardcallback/) hook are self-explanatory, providing a callback that can move the [`Store`](/api/the-essentials/creating-stores/store/) backwards or forwards through the checkpoints stack in response to a user event.

### [`UndoOrRedoInformation`](/api/ui-react/type-aliases/checkpoints/undoorredoinformation/)

Perhaps more useful than each of those hooks individually, the [`useUndoInformation`](/api/ui-react/functions/checkpoints-hooks/useundoinformation/) hook and [`useRedoInformation`](/api/ui-react/functions/checkpoints-hooks/useredoinformation/) hook provide a collection of information (in an array of the [`UndoOrRedoInformation`](/api/ui-react/type-aliases/checkpoints/undoorredoinformation/) type) - including information about whether the action is possible, the event handler, and the label - that is fully sufficient to be able to construct an undo/redo UI:

```
import {useUndoInformation} from 'tinybase/ui-react';

store.setTables({pets: {nemo: {species: 'fish'}}});
checkpoints.clear();
const App3 = () => {
  const [canUndo, handleUndo, id, label] = useUndoInformation(checkpoints);
  return canUndo ? (
    <span onClick={handleUndo}>Undo {label}</span>
  ) : (
    <span>Nothing to undo</span>
  );
};

root.render(<App3 />);
console.log(app.innerHTML);
// -> '<span>Nothing to undo</span>'

store.setCell('pets', 'nemo', 'color', 'orange');
checkpoints.addCheckpoint('color');
console.log(app.innerHTML);
// -> '<span>Undo color</span>'
```

### [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) Views

The [`BackwardCheckpointsView`](/api/ui-react/functions/checkpoints-components/backwardcheckpointsview/) component, [`CurrentCheckpointView`](/api/ui-react/functions/checkpoints-components/currentcheckpointview/) component, and [`ForwardCheckpointsView`](/api/ui-react/functions/checkpoints-components/forwardcheckpointsview/) component are the main three components for the [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) object, and list the checkpoints behind or ahead of the current state, so that a list of possible undo and redo actions is visible:

```
import {
  BackwardCheckpointsView,
  CurrentCheckpointView,
  ForwardCheckpointsView,
} from 'tinybase/ui-react';

const App4 = () => (
  <div>
    <BackwardCheckpointsView checkpoints={checkpoints} debugIds={true} />/
    <CurrentCheckpointView checkpoints={checkpoints} debugIds={true} />/
    <ForwardCheckpointsView checkpoints={checkpoints} debugIds={true} />
  </div>
);

root.render(<App4 />);
console.log(app.innerHTML);
// -> '<div>0:{}/1:{color}/</div>'

store.setCell('pets', 'nemo', 'stripes', true);
checkpoints.addCheckpoint('stripes');
console.log(app.innerHTML);
// -> '<div>0:{}1:{color}/2:{stripes}/</div>'
```

Each of these components takes a `checkpointComponent` prop which allows you to customize how each checkpoint is rendered. Undoubtedly you will want something nicer than the default debug example above!

### [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) Context

In the same way that a [`Store`](/api/the-essentials/creating-stores/store/) can be passed into a [`Provider`](/api/the-essentials/using-react/provider/) component context and used throughout the app, a [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) object can also be provided to be used by default:

```
import {
  Provider,
  useCreateCheckpoints,
  useCreateStore,
} from 'tinybase/ui-react';

const App5 = () => {
  const store = useCreateStore(() =>
    createStore().setTable('species', {pets: {nemo: {species: 'fish'}}}),
  );
  const checkpoints = useCreateCheckpoints(store, createCheckpoints);

  return (
    <Provider checkpoints={checkpoints}>
      <Pane />
    </Provider>
  );
};

const Pane = () => <span>{JSON.stringify(useCheckpointIds())}</span>;

root.render(<App5 />);
console.log(app.innerHTML);
// -> '<span>[[],"0",[]]</span>'
```

The `checkpointsById` prop can be used in the same way that the `storesById` prop is, to let you reference multiple [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) objects by [`Id`](/api/common/type-aliases/identity/id/).

### Summary

The support for [`Checkpoints`](/api/checkpoints/interfaces/checkpoints/checkpoints/) objects in the [`ui-react`](/api/ui-react/) module is very similar to that for all the other types of top level object, making it easy to attach checkpoints and undo/redo functionality to your user interface.

Let's move on to the ways in which we can create more advanced queries in the [Using Queries](/guides/using-queries/) guide.