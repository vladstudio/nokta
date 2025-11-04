---
title: "Using React DOM Components | TinyBase"
url: https://tinybase.org/guides/building-uis/using-react-dom-components
---

The reactive components in the [`ui-react-dom`](/api/ui-react-dom/) module let you declaratively display parts of a [`Store`](/api/the-essentials/creating-stores/store/) in a web browser, where the ReactDOM module is available.

These are generally implementations of the components we discussed in the previous guide, but are specifically designed to render HTML content in a browser.

Styling and class names are very basic, since you are expected to style them with CSS to fit your app's overall styling.

The easiest way to understand these components is to see them all in action in the [UI Components](/demos/ui-components/) demos. There are table-based components for rendering [`Tables`](/api/store/type-aliases/store/tables/), sorted [`Tables`](/api/store/type-aliases/store/tables/), [`Values`](/api/store/type-aliases/store/values/), and so on:

There are also editable components for individual Cells and [`Values`](/api/store/type-aliases/store/values/):

We finish off this section with a best practice to avoid passing the global [`Store`](/api/the-essentials/creating-stores/store/) down into components. Please proceed to the [Using Context](/guides/building-uis/using-context/) guide!