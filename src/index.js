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
  var result = null;
  var defaultTimeout = setTimeout(function() {
    defaultTimeout = null;
    loaded({ name, result });
  }, defaultTime);
  var terminalTimeout = setTimeout(function() {
    result = new Error("Loadable timed out");
    runErrorHandler({ name, result });
    loaded({ name, result });
  }, terminalTime);

  loader()
    .then(function(promised) {
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
    .catch(function(err) {
      clearTimeout(terminalTimeout);
      clearTimeout(defaultTimeout);
      result = err;
      runErrorHandler({ name, result });
      loaded({ name, result });
    });
}

function merge(a, b) {
  var obj = {};
  for (var i in a) {
    obj[i] = a[i];
  }
  for (var i in b) {
    obj[i] = b[i];
  }
  return obj;
}

export function LoadableMixin(Emit) {
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
            loadable: merge(state.loadable, newLoadable)
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
  var loadable = props.loadable;
  var name = props.name;
  var loader = props.loader;
  var loaderProps = props.loaderProps;
  var loading = props.loading;
  var loadingProps = props.loadingProps;
  var loaded = props.loaded;
  var defaultTime = props.defaultTime || DEFAULT_DELAY;
  var terminalTime = props.terminalTime || DEFAULT_TIMEOUT;
  if (name == null || loader == null || loading == null || loaded == null) {
    throw new RangeError("Invalid props for Loadable, must provide (name: string, loader: thunk, loading: thunk, loaded: actions.loadable.loaded, loadable: state.loadable)");
  }
  if (
    loadable[name] != null &&
    loadable[name].resolved != null &&
    typeof loadable[name].resolved === "function"
  ) {
    return loadable[name].resolved(loaderProps);
  } else {
    if (loadable[name] == null) {
      load({
        name,
        loader,
        loaderProps,
        loaded,
        defaultTime,
        terminalTime
      });
    }
    return loading(loadingProps);
  }
}
