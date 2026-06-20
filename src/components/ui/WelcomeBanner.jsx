import React from 'react';
import { Star } from 'lucide-react';

export default function WelcomeBanner({ title, description }) {
  return (
    <div className="blue-gradient border border-monday-blue/20 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
      <div className="flex gap-4">
        <div className="bg-white/10 p-3 rounded-2xl text-monday-lime-green border border-white/20 shrink-0">
          <Star size={24} className="text-monday-lime-green" />
        </div>
        <div>
          <h4 className="font-extrabold text-lg text-white">
            {title}
          </h4>
          <p className="text-xs text-monday-lime-green-char mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
