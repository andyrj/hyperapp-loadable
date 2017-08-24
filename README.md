# hyperapp-loadable
This package is inspired be react-loadable.  The main difference between the two packages is that this package targets hyperapp instead of react and thus does not have stateful components.

To work around this difference we use a mixin to provide a { loadable: {} } in the state as well as add actions: { loadable: { loaded: () => any }} for triggering an update/re-render after lazy-loaded module is available.

```jsx
/* src/test.js */
import { h } from "hyperapp";

export function Test(state, actions) {
  return (
    <div>{"Testing lazy-loaded component!"}</div>
  );
}
```

```jsx
import { h, app } from "hyperapp";
import Loadable from "hyperapp-loadable";

const Loading = (state, actions) => <div>{"Loading..."}</div>;

app({
  view: (state, actions) => {
    return (<Loadable 
      state={state}
      actions={actions}
      name={"/test"}
      loader={() => import("./test")}
      loading={Loading}
      loaded={actions.loadable.loaded}
      errorHandler={(name, err) => console.error(`hyperapp-loadable error: ${err}`)}
    />);
  },
  mixins: [Loadable()]
});
```

## License

hyperapp-loadable is MIT licensed. See [LICENSE](LICENSE.md).

