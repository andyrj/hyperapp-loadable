const DEFAULT_DELAY = 200;
const DEFAULT_TIMEOUT = 3000;

function runErrorHandler(status) {
  if (errorHandler != null && typeof errorHandler === "function") {
    errorHandler(status);
  }
}

export function load({
  name,
  loadable,
  loader,
  loaded,
  defaultTime,
  terminalTime
}) {
  let result;
  let defaultTimeout = setTimeout(() => {
    defaultTimeout = null;
    loaded({ name, result });
  }, defaultTime);
  const terminalTimeout = setTimeout(() => {
    result = new Error("Loadable timed out");
    runErrorHandler({ name, result });
    loaded({ name, result });
  }, terminalTime);

  loader()
    .then(promised => {
      if (result == null) {
        if (typeof promised === "function") {
          result = promised;
        } else if (
          promised.default != null &&
          typeof promised.default === "function"
        ) {
          result = promised.default;
        }
        clearTimeout(terminalTimeout);
        if (typeof result === "function" && defaultTimeout == null) {
          loaded({ name, result });
        }
      } else {
        loaded({ name, result });
      }
    })
    .catch(err => {
      clearTimeout(terminalTimeout);
      clearTimeout(defaultTimeout);
      result = err;
      runErrorHandler({ name, result });
      loaded({ name, result });
    });
}

// not great for multiple apps using hyperapp-loadable on 1 page...  but closure is fugly in use...
let emit;
export function LoadableMixin(Emit) {
  emit = Emit;
  return {
    state: {
      loadable: {}
    },
    actions: {
      loadable: {
        loaded: function(state, actions, { name, result }) {
          let newLoadable = {};
          newLoadable[name] = result;
          return {
            loadable: Object.assign({}, state.loadable, newLoadable)
          };
        }
      }
    },
    events: {
      getStateAndActions(state, actions) {
        return { state, actions };
      }
    }
  };
}

export function Loadable(props) {
  const { state, actions } = emit("getStateAndActions");
  const loadable = state.loadable;
  const { name, loader, loading } = props;
  const loaded = props.loaded || actions.loadable.loaded;
  const defaultTime = props.defaultTime || DEFAULT_DELAY;
  const terminalTime = props.terminalTime || DEFAULT_TIMEOUT;
  if (loadable[name] != null && typeof loadable[name] === "function") {
    return loadable[name](state, actions);
  } else {
    if (loadable[name] == null) {
      load({
        name,
        loadable,
        loader,
        loaded,
        defaultTime,
        terminalTime
      });
    }
    return loading(state, actions);
  }
}
