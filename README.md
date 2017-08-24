# hyperapp-loadable
This package is inspired be react-loadable.  The main difference between the two packages is that this package targets hyperapp instead of react and thus does not have stateful components.

To work around this difference we use a mixin to provide a { loadable: {} } in the state as well as add actions: { loadable: { loaded: () => any }} for triggering an update/re-render after lazy-loaded module is available.

```jsx
import Loadable from "hyperapp-loadable"

app({
  view: <div>{"Testing loadable..."}</div>,
  mixins: [Loadable()]
})
```

## License

hyperapp-loadable is MIT licensed. See [LICENSE](LICENSE.md).

