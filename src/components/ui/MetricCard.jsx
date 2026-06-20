import React from 'react';

export default function MetricCard({ title, count, icon: Icon, colorClass }) {
  return (
    <div className="bg-white border border-monday-border p-6 rounded-3xl flex items-center justify-between shadow-sm hover:-translate-y-0.5 transition-300">
      <div className="space-y-1">
        <p className="text-xs font-bold text-monday-gray uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-extrabold text-monday-black">{count}</h3>
      </div>
      <div className={`flex size-14 rounded-full ${colorClass} items-center justify-center shrink-0`}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
}
