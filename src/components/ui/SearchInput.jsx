import React from 'react';
import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = "Cari..." }) {
  return (
    <div className="relative w-72">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-monday-gray" size={16} />
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2.5 bg-monday-background border border-monday-border rounded-2xl text-sm focus:outline-none focus:border-monday-black font-semibold text-monday-black transition-300"
      />
    </div>
  );
}
