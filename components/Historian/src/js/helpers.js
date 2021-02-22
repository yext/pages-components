import URI from 'urijs';

// This function tests whether a history state is the same as the current state.
// It is used to prevent duplicate states being pushed to the history.
function stateChanged(state, url, historyState) {
  const currentUrl = window.location.href;
  const newUrl = URI(url).absoluteTo(window.location.href).toString();
  // Compare URLs
  if (newUrl != currentUrl) {
    return true;
  }

  let currentStateString;
  let newStateString;
  try {
    currentStateString = JSON.stringify(historyState);
  } catch (err) {}
  try {
    newStateString = JSON.stringify(state);
  } catch (err) {}
  // Compare stringified objects
  // If strings are different, or if one is a string and the other is undefined,
  // the state objects are different.
  if (newStateString !== currentStateString) {
    return true;
  }

  // If neither object could be parsed by JSON.stringify, assume the states are different.
  // Not necessarily true, but a deep comparison is complex and slow.
  if (newStateString === currentStateString && typeof newStateString == 'undefined') {
    return true;
  }

  // The titles, URLs, and state objects are the same.
  return false;
}

export {
  stateChanged
};
