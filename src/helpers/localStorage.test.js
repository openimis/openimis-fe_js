import { beforeEach, describe, expect, it, vi } from "vitest";

const getLocalStorage = vi.fn();
const setLocalStorage = vi.fn();

vi.mock("@openimis/fe-core", () => ({
  getLocalStorage: (...args) => getLocalStorage(...args),
  setLocalStorage: (...args) => setLocalStorage(...args),
  removeLocalStorage: vi.fn(),
  clearLocalStorage: vi.fn(),
  useLocalStorage: vi.fn(),
}));

const { loadState, saveState } = await import("./localStorage.jsx");

beforeEach(() => {
  getLocalStorage.mockReset();
  setLocalStorage.mockReset();
});

describe("loadState", () => {
  it("returns the persisted state", () => {
    const state = { core: { user: { id: 1 } } };
    getLocalStorage.mockReturnValue(state);

    expect(loadState()).toBe(state);
    expect(getLocalStorage).toHaveBeenCalledWith("state", undefined);
  });

  it("returns undefined when nothing is persisted", () => {
    getLocalStorage.mockReturnValue(undefined);

    expect(loadState()).toBeUndefined();
  });

  it("normalises a null entry to undefined", () => {
    // Redux treats undefined as "no preloaded state"; null would reach the reducers.
    getLocalStorage.mockReturnValue(null);

    expect(loadState()).toBeUndefined();
  });

  it("returns undefined instead of propagating a storage failure", () => {
    getLocalStorage.mockImplementation(() => {
      throw new Error("SecurityError: localStorage is not available");
    });

    expect(() => loadState()).not.toThrow();
    expect(loadState()).toBeUndefined();
  });

  it("preserves falsy-but-real persisted values", () => {
    getLocalStorage.mockReturnValue(0);
    expect(loadState()).toBe(0);

    getLocalStorage.mockReturnValue("");
    expect(loadState()).toBe("");

    getLocalStorage.mockReturnValue(false);
    expect(loadState()).toBe(false);
  });
});

describe("saveState", () => {
  it("persists under the 'state' key", () => {
    const state = { core: { user: { id: 1 } } };

    saveState(state);

    expect(setLocalStorage).toHaveBeenCalledWith("state", state);
  });

  it("delegates undefined straight through, letting the util clear the entry", () => {
    saveState(undefined);

    expect(setLocalStorage).toHaveBeenCalledWith("state", undefined);
  });

  it("warns but does not throw when persisting fails", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    setLocalStorage.mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => saveState({ big: "payload" })).not.toThrow();
    expect(warn).toHaveBeenCalledWith("Could not save state to localStorage", expect.any(Error));
  });
});
