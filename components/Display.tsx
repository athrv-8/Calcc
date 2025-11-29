import React from 'react';

interface DisplayProps {
  current: string;
  previous: string;
  operation: string | null;
  message: string | null;
  emoji: string | null;
  isThinking: boolean;
}

const Display: React.FC<DisplayProps> = ({ current, previous, operation, message, emoji, isThinking }) => {
  
  // Format numbers for better readability
  const formatOperand = (operand: string) => {
    if (operand === '') return '';
    const [integer, decimal] = operand.split('.');
    if (decimal == null) return new Intl.NumberFormat('en-US').format(parseInt(integer));
    return `${new Intl.NumberFormat('en-US').format(parseInt(integer))}.${decimal}`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] shadow-xl border-4 border-white mb-6 w-full flex flex-col justify-end min-h-[160px] relative overflow-hidden group transition-all hover:shadow-2xl hover:shadow-rose-100">
      
      {/* Decorative gradient blob in background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-100 rounded-full blur-2xl opacity-60"></div>
      <div className="absolute top-10 -left-10 w-24 h-24 bg-rose-100 rounded-full blur-2xl opacity-60"></div>

      {/* Flirty Message Overlay */}
      {(message || isThinking) && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-rose-50/90 to-transparent z-10">
            <div className={`text-xs font-bold uppercase tracking-widest text-rose-400 mb-1 flex items-center gap-1 ${isThinking ? 'animate-pulse' : ''}`}>
               {isThinking ? 'Thinking of you...' : 'Crush AI says:'}
            </div>
            {!isThinking && (
                <div className="text-sm font-medium text-rose-600 leading-snug animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="mr-1">{emoji}</span> {message}
                </div>
            )}
        </div>
      )}

      {/* Calculator Values */}
      <div className="text-right z-10 mt-auto">
        <div className="text-rose-300 text-sm font-medium h-6 flex justify-end items-center gap-2">
          {formatOperand(previous)} {operation}
        </div>
        <div className="text-rose-500 text-4xl font-display font-bold break-all transition-all">
          {formatOperand(current) || '0'}
        </div>
      </div>
    </div>
  );
};

export default Display;