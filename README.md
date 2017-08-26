# hyperapp-loadable
*WIP*
This package is inspired be react-loadable.  The main difference between the two packages is that this package targets hyperapp instead of react and thus does not have stateful components.

To work around this difference we use a mixin to provide a { loadable: {} } in the state as well as add actions: { loadable: { loaded: () => any }} for triggering an update/re-render after lazy-loaded module is available.

```jsx
/* src/Test.js */
import { h } from "hyperapp";

export function Test(state, actions) {
  return (
    <div>{"Testing lazy-loaded component!"}</div>
  );
}
```

```jsx
import { h, app } from "hyperapp";
import LoadableSetup from "hyperapp-loadable";

const { LoadableMixin, Loadable } = LoadableSetup({
  defaultTime: 200, /* default time to display loading component */
  terminalTime: 3000, /* maximum timeout before throwing error for timing out */
  /* errorHandler can be provided if you wish to run state clean up or trigger a retry of the dynamic import */
  errorHandler: ({ name, result }) => console.error(`Loadable: ${name}, error: ${result}`),
  nodeHandler: () => { /* only needed if doing SSR */
    // logic to handle babel-plugin-import-inspector like react-loadable goes here...
  }
})

const Loading = (state, actions) => <div>{"Loading..."}</div>;

app({
  view: (state, actions) => {
    return (
      <Loadable 
        name={"/Test"}
        loader={() => import("./Test")}
        loading={Loading}
      />
    );
  },
  mixins: [LoadableMixin]
});
```

## License

hyperapp-loadable is MIT licensed. See [LICENSE](LICENSE.md).

