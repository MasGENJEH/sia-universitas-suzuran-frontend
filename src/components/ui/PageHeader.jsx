import React from 'react';
import PrimaryButton from './PrimaryButton';

export default function PageHeader({ 
  icon: Icon, 
  title, 
  description, 
  onActionClick, 
  actionLabel, 
  actionIcon 
}) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-monday-border">
      <div className="flex flex-col gap-[4px]">
        <p className="flex items-center gap-[6px]">
          {Icon && <Icon className="size-6 text-monday-black" />}
          <span className="font-extrabold text-2xl text-monday-black">
            {title}
          </span>
        </p>
        {description && (
          <p className="font-semibold text-sm text-monday-gray">
            {description}
          </p>
        )}
      </div>
      {onActionClick && actionLabel && (
        <PrimaryButton onClick={onActionClick} icon={actionIcon}>
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}
