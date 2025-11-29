export enum CalculatorActionType {
  ADD_DIGIT = 'ADD_DIGIT',
  CHOOSE_OPERATION = 'CHOOSE_OPERATION',
  CLEAR = 'CLEAR',
  DELETE = 'DELETE',
  EVALUATE = 'EVALUATE',
  SET_FLIRTY_MESSAGE = 'SET_FLIRTY_MESSAGE',
}

export type Operation = '+' | '-' | '*' | '/' | '%' | null;

export interface CalculatorState {
  currentOperand: string;
  previousOperand: string;
  operation: Operation;
  overwrite: boolean; // True if the next input should overwrite the current result
}

export interface FlirtyResponse {
  message: string;
  emoji: string;
}
