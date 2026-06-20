import React from 'react';

export default function PrimaryButton({ 
  onClick, 
  children, 
  icon: Icon, 
  className = "" 
}) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 lg:px-5 py-2.5 bg-monday-blue text-white rounded-full font-bold text-sm hover:bg-opacity-90 transition-300 flex items-center justify-center gap-2 ${className}`}
    >
      <span className={Icon ? "hidden lg:inline" : ""}>{children}</span>
      {Icon && <Icon size={20} className="shrink-0" />}
    </button>
  );
}
