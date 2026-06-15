// Re-exports the enhanced useLocalStorage hook and utilities from @openimis/fe-core
// (the central implementation with useSyncExternalStore for reactivity, same-tab
// updates via custom 'localStorageChange' events, null/undefined handling, and
// non-React utilities). This de-duplicates code while the Redux-specific
// loadState/saveState (for persisted app state) are kept here for the main
// frontend assembly. The core helper was created to make the advanced hook
// available to all modules via the fe-core package without circular dependencies
// or duplication across frontend-packages.

// Direct import (no alias needed as there is no local useLocalStorage definition anymore)
import {
  useLocalStorage,
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
} from '@openimis/fe-core';

export const loadState = () => {
  try {
    const serializedState = getLocalStorage("state", undefined);
    if (serializedState === null || serializedState === undefined) {
      return undefined;
    }
    return serializedState;
  } catch (e) {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    setLocalStorage("state", state);  // util handles undefined/null by removing item
  } catch (e) {
    console.warn("Could not save state to localStorage", e);
  }
};

// Re-export the enhanced hook + utilities from core (now the single source of truth)
export {
  useLocalStorage,
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
};
