import isWebpackBundle from "is-webpack-bundle";
import webpackRequireWeak from "webpack-require-weak";
import { inspect } from "import-inspector";

function capture(fn) {
  var reported = [];
  var stopInspecting = inspect(function(metadata){reported.push(metadata)});
  var promise = fn();
  stopInspecting();
  return { promise: promise, reported: reported };
}

function mixin() {
  return {
    state: {
      loadable: {}
    },
    actions: {
      loadable: {
        loaded: function(state, actions, data) {
          var name = data.name;
          var status = data.status;
          var newLoadable = {};
          newLoadable[name] = status;
          return {
            loadable: Object.assign({}, state.loadable, newLoadable)
          };
        }
      }
    }
  };
}

function load(name, loadable, loader, loaded) {
  var status = {
    loading: true,
    loaded: null,
    error: null
  };
  var result = capture(function() {
    return loader();
  });
  var promise = result.promise;
  var reported = result.reported;

  if (reported.length > 1) {
    throw new Error(
      "hyperapp-loadable cannot handle more than one import() in each loader"
    );
  }

  var metadata = reported[0] || {};

  try {
    if (isWebpackBundle) {
      if (typeof metadata.webpackRequireWeakId === "function") {
        status.loaded = webpackRequireWeak(metadata.webpackRequireWeakId());
        if (loadable[name].loaded) status.loading = false;
      }
    } else {
      if (typeof metadata.serverSideRequirePath === "string") {
        status.loading = false;
        status.loaded = module.require(metadata.serverSideRequirePath);
      }
    }
  } catch (err) {
    status.error = err;
  }

  promise
    .then(function(component) {
      status.loading = false;
      status.loaded = component.default;
      var data = { name: name, status: status };
      loaded(data);
    })
    .catch(function(err) {
      status.loading = false;
      status.error = err;
      var data = { name: name, status: status };
      loaded(data);
    });
}

function component(props) {
  var state = props.state;
  var loadable = state.loadable;
  var actions = props.actions;
  var name = props.name;
  var loader = props.loader;
  var loaded = props.loaded || actions.loadable.loaded;
  var loading = props.loading;
  if (loadable[name] != null && !loadable[name].loading) {
    return loadable[name].loaded(state, actions);
  } else {
    load(name, loadable, loader, loaded);
    return loading(state, actions);
  }
}

export default function Loadable(props) {
  if (typeof props === "function") {
    return mixin();
  } else {
    return component(props);
  }
}
