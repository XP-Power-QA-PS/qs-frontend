import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CodeCellProps {
  code: string;
  subCode?: string;
  className?: string;
}

export const CodeCell: React.FC<CodeCellProps> = ({ code, subCode, className }) => {
  return (
    <div className={cn('font-mono font-bold text-primary', className)}>
      <span className="hover:underline flex items-center gap-1">{code}</span>
      {subCode && (
        <div className="flex flex-wrap items-center gap-1 mt-1">
          <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
            {subCode}
          </span>
        </div>
      )}
    </div>
  );
};

export interface TableActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const TableActionButton: React.FC<TableActionButtonProps> = ({
  label,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border-subtle text-xs font-semibold text-text-secondary group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5 transition-all shadow-2xs cursor-pointer',
        className
      )}
      {...props}
    >
      <span>{label}</span>
      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
};

export interface StatusPillProps {
  label: string;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'gray';
  dot?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  variant = 'gray',
  dot = true,
  className,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dot:bg-emerald-500',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dot:bg-amber-500',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dot:bg-blue-500',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dot:bg-purple-500',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dot:bg-rose-500',
    gray: 'bg-surface-canvas text-text-muted border-border-subtle dot:bg-text-muted',
  };

  const dotColors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    rose: 'bg-rose-500',
    gray: 'bg-text-muted',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        variantStyles[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {label}
    </span>
  );
};
