import React, { useReducer, useState } from 'react';
import { CalculatorActionType, CalculatorState, Operation, FlirtyResponse } from './types';
import Button from './components/Button';
import Display from './components/Display';
import { getFlirtyComment, getPickUpLine } from './services/geminiService';

// --- Reducer Logic ---

const INITIAL_STATE: CalculatorState = {
  currentOperand: '',
  previousOperand: '',
  operation: null,
  overwrite: false,
};

type Action =
  | { type: CalculatorActionType.ADD_DIGIT; payload: string }
  | { type: CalculatorActionType.CHOOSE_OPERATION; payload: Operation }
  | { type: CalculatorActionType.CLEAR }
  | { type: CalculatorActionType.DELETE }
  | { type: CalculatorActionType.EVALUATE }
  | { type: CalculatorActionType.SET_FLIRTY_MESSAGE };

function evaluate({ currentOperand, previousOperand, operation }: CalculatorState): string {
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);
  if (isNaN(prev) || isNaN(current)) return '';
  
  let computation = 0;
  switch (operation) {
    case '+':
      computation = prev + current;
      break;
    case '-':
      computation = prev - current;
      break;
    case '*':
      computation = prev * current;
      break;
    case '/':
      computation = prev / current;
      break;
    case '%':
        computation = prev % current;
        break;
  }
  return computation.toString();
}

function reducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case CalculatorActionType.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: action.payload,
          overwrite: false,
        };
      }
      if (action.payload === '0' && state.currentOperand === '0') return state;
      if (action.payload === '.' && state.currentOperand.includes('.')) return state;
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${action.payload}`,
      };

    case CalculatorActionType.CHOOSE_OPERATION:
      if (state.currentOperand === '' && state.previousOperand === '') return state;
      if (state.currentOperand === '') {
        return {
          ...state,
          operation: action.payload,
        };
      }
      if (state.previousOperand === '') {
        return {
          ...state,
          operation: action.payload,
          previousOperand: state.currentOperand,
          currentOperand: '',
        };
      }
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: action.payload,
        currentOperand: '',
      };

    case CalculatorActionType.CLEAR:
      return INITIAL_STATE;

    case CalculatorActionType.DELETE:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: '',
        };
      }
      if (state.currentOperand === '') return state;
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };

    case CalculatorActionType.EVALUATE:
      if (
        state.operation === null ||
        state.currentOperand === '' ||
        state.previousOperand === ''
      ) {
        return state;
      }
      return {
        ...state,
        overwrite: true,
        previousOperand: '',
        operation: null,
        currentOperand: evaluate(state),
      };
      
    default:
      return state;
  }
}

// --- Icons ---
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM4.342 4.342a.75.75 0 01.61.217l1.414 1.414a.75.75 0 01-1.06 1.06L3.89 5.62a.75.75 0 01.452-1.278zm13.716 13.716a.75.75 0 01.61.217l1.414 1.414a.75.75 0 01-1.06 1.06l-1.414-1.414a.75.75 0 01.45-1.278z" clipRule="evenodd" />
    </svg>
);


// --- Main App Component ---

function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [flirtyData, setFlirtyData] = useState<FlirtyResponse | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const triggerFlirtyEvaluation = async (previous: string, current: string, op: string) => {
    // Perform the calculation first so the UI updates
    dispatch({ type: CalculatorActionType.EVALUATE });
    
    // Now ask Gemini for a comment
    if (previous && current && op) {
      setIsThinking(true);
      // We need to calculate the result locally to pass to Gemini context
      // Note: The dispatch above updates state for the *next* render, so we re-calc here for the API call
      // or we could wait for useEffect. Let's re-calc safely.
      const tempState = { ...state };
      const result = evaluate(tempState);
      const equation = `${previous} ${op} ${current}`;
      
      const response = await getFlirtyComment(equation, result);
      setFlirtyData(response);
      setIsThinking(false);
    }
  };

  const handlePickUpLine = async () => {
      setIsThinking(true);
      const response = await getPickUpLine();
      setFlirtyData(response);
      setIsThinking(false);
  }

  const handleEqual = () => {
    if (state.operation && state.previousOperand && state.currentOperand) {
        triggerFlirtyEvaluation(state.previousOperand, state.currentOperand, state.operation);
    } else {
        dispatch({ type: CalculatorActionType.EVALUATE });
    }
  };

  const addDigit = (digit: string) => {
    dispatch({ type: CalculatorActionType.ADD_DIGIT, payload: digit });
    // Clear old flirty messages when starting new input
    if (state.overwrite) setFlirtyData(null); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-rose-500 font-bold tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
                Crush Calc <HeartIcon />
            </h1>
            <p className="text-rose-400 font-medium mt-1 text-sm">Do the math, get the love.</p>
        </div>

        {/* Calculator Body */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(251,113,133,0.3)] rounded-[3rem] p-6 pb-8">
            
            <Display 
                current={state.currentOperand} 
                previous={state.previousOperand} 
                operation={state.operation}
                message={flirtyData?.message || null}
                emoji={flirtyData?.emoji || null}
                isThinking={isThinking}
            />

            <div className="grid grid-cols-4 gap-3">
                {/* Row 1 */}
                <Button label="AC" onClick={() => { dispatch({ type: CalculatorActionType.CLEAR }); setFlirtyData(null); }} variant="accent" />
                <Button label="DEL" onClick={() => dispatch({ type: CalculatorActionType.DELETE })} variant="accent" />
                <Button label="%" onClick={() => dispatch({ type: CalculatorActionType.CHOOSE_OPERATION, payload: '%' })} variant="accent" />
                <Button label="÷" onClick={() => dispatch({ type: CalculatorActionType.CHOOSE_OPERATION, payload: '/' })} variant="secondary" />

                {/* Row 2 */}
                <Button label="7" onClick={() => addDigit('7')} />
                <Button label="8" onClick={() => addDigit('8')} />
                <Button label="9" onClick={() => addDigit('9')} />
                <Button label="×" onClick={() => dispatch({ type: CalculatorActionType.CHOOSE_OPERATION, payload: '*' })} variant="secondary" />

                {/* Row 3 */}
                <Button label="4" onClick={() => addDigit('4')} />
                <Button label="5" onClick={() => addDigit('5')} />
                <Button label="6" onClick={() => addDigit('6')} />
                <Button label="-" onClick={() => dispatch({ type: CalculatorActionType.CHOOSE_OPERATION, payload: '-' })} variant="secondary" />

                {/* Row 4 */}
                <Button label="1" onClick={() => addDigit('1')} />
                <Button label="2" onClick={() => addDigit('2')} />
                <Button label="3" onClick={() => addDigit('3')} />
                <Button label="+" onClick={() => dispatch({ type: CalculatorActionType.CHOOSE_OPERATION, payload: '+' })} variant="secondary" />

                {/* Row 5 */}
                <Button label="0" onClick={() => addDigit('0')} isLarge />
                <Button label="." onClick={() => addDigit('.')} />
                <Button 
                    label="=" 
                    onClick={handleEqual} 
                    variant="primary" 
                />
            </div>

            {/* Extra Fun Buttons */}
            <div className="mt-6 flex gap-3">
                <button 
                    onClick={handlePickUpLine}
                    disabled={isThinking}
                    className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 text-white p-3 rounded-2xl shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all font-display font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <SparklesIcon />
                    <span>Get Flirty</span>
                </button>
            </div>
            
            <div className="mt-4 text-center">
                 <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest">Powered by Gemini AI</p>
            </div>

        </div>
      </div>
    </div>
  );
}

export default App;