import { describe, it, expect } from 'vitest';
import {
  createHistoryState,
  pushHistoryState,
  undoHistoryState,
  redoHistoryState,
  resetHistoryState,
} from './useHistory';

describe('useHistory core transitions', () => {
  it('maneja set, undo y redo de manera inmutable', () => {
    let state = createHistoryState({ count: 0 });
    expect(state.present.count).toBe(0);
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);

    state = pushHistoryState(state, { count: 1 });
    state = pushHistoryState(state, (prev) => ({ count: prev.count + 1 }));

    expect(state.present.count).toBe(2);
    expect(state.past).toHaveLength(2);

    state = undoHistoryState(state);
    expect(state.present.count).toBe(1);
    expect(state.past).toHaveLength(1);
    expect(state.future).toHaveLength(1);

    state = undoHistoryState(state);
    expect(state.present.count).toBe(0);
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(2);

    // Undo cuando no hay pasado no debe alterar estado
    const noOpUndo = undoHistoryState(state);
    expect(noOpUndo).toBe(state);

    state = redoHistoryState(state);
    expect(state.present.count).toBe(1);
    expect(state.future).toHaveLength(1);
  });

  it('limpia el futuro al realizar set después de un undo', () => {
    let state = createHistoryState('A');
    state = pushHistoryState(state, 'B');
    state = pushHistoryState(state, 'C');
    state = undoHistoryState(state);
    expect(state.present).toBe('B');
    expect(state.future).toEqual(['C']);

    state = pushHistoryState(state, 'D');
    expect(state.present).toBe('D');
    expect(state.future).toEqual([]);
  });

  it('respeta el límite máximo de historial (maxHistory) y permite reset', () => {
    let state = createHistoryState(0);
    for (let i = 1; i <= 5; i++) {
      state = pushHistoryState(state, i, 3);
    }
    expect(state.present).toBe(5);
    expect(state.past).toEqual([2, 3, 4]);

    state = resetHistoryState(99);
    expect(state.present).toBe(99);
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);
  });
});
