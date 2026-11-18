import { useState, useCallback } from 'react';

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function createHistoryState<T>(initialPresent: T): HistoryState<T> {
  return {
    past: [],
    present: initialPresent,
    future: [],
  };
}

export function pushHistoryState<T>(
  state: HistoryState<T>,
  nextOrUpdater: T | ((prev: T) => T),
  maxHistory = 50
): HistoryState<T> {
  const nextPresent =
    typeof nextOrUpdater === 'function'
      ? (nextOrUpdater as (prev: T) => T)(state.present)
      : nextOrUpdater;

  if (Object.is(nextPresent, state.present)) {
    return state;
  }

  const nextPast = [...state.past, state.present];
  const trimmedPast =
    nextPast.length > maxHistory ? nextPast.slice(nextPast.length - maxHistory) : nextPast;

  return {
    past: trimmedPast,
    present: nextPresent,
    future: [],
  };
}

export function undoHistoryState<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.past.length === 0) return state;

  const previous = state.past[state.past.length - 1];
  const newPast = state.past.slice(0, state.past.length - 1);

  return {
    past: newPast,
    present: previous,
    future: [state.present, ...state.future],
  };
}

export function redoHistoryState<T>(state: HistoryState<T>): HistoryState<T> {
  if (state.future.length === 0) return state;

  const next = state.future[0];
  const newFuture = state.future.slice(1);

  return {
    past: [...state.past, state.present],
    present: next,
    future: newFuture,
  };
}

export function resetHistoryState<T>(newPresent: T): HistoryState<T> {
  return createHistoryState(newPresent);
}

export function useHistory<T>(initialPresent: T, maxHistory = 50) {
  const [history, setHistory] = useState<HistoryState<T>>(() =>
    createHistoryState(initialPresent)
  );

  const set = useCallback(
    (nextOrUpdater: T | ((prev: T) => T)) => {
      setHistory((curr) => pushHistoryState(curr, nextOrUpdater, maxHistory));
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setHistory((curr) => undoHistoryState(curr));
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => redoHistoryState(curr));
  }, []);

  const reset = useCallback((newPresent: T) => {
    setHistory(resetHistoryState(newPresent));
  }, []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
