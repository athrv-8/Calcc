import React from 'react';

interface ButtonProps {
  label: string | React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  className?: string;
  isLarge?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'default', 
  className = '',
  isLarge = false
}) => {
  
  const baseStyles = "relative overflow-hidden transition-all duration-200 active:scale-95 font-display rounded-full shadow-sm hover:shadow-md flex items-center justify-center select-none";
  
  const variants = {
    default: "bg-white text-rose-500 hover:bg-rose-50 border-2 border-rose-100",
    primary: "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200 shadow-lg border-2 border-rose-500", // Numbers/Equals
    secondary: "bg-pink-200 text-pink-700 hover:bg-pink-300 border-2 border-pink-200", // Operators
    accent: "bg-purple-100 text-purple-600 hover:bg-purple-200 border-2 border-purple-100", // Top row
  };

  const sizeStyles = isLarge ? "col-span-2 aspect-[2/1] rounded-[2rem]" : "aspect-square text-xl";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizeStyles} ${className}`}
    >
      <span className="relative z-10 font-bold tracking-wide">{label}</span>
    </button>
  );
};

export default Button;