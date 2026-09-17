import React from 'react';
import { cn } from '@/utils/cn';

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  className,
  children,
  scrollable = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-border-subtle rounded-2xl shadow-2xs overflow-hidden max-w-full w-full',
        className
      )}
      {...props}
    >
      {scrollable ? (
        <div className="overflow-x-auto max-w-full w-full">{children}</div>
      ) : (
        children
      )}
    </div>
  );
};

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  minWidth?: string;
}

export const Table: React.FC<TableProps> = ({ className, minWidth, style, ...props }) => {
  return (
    <table
      className={cn('w-full text-left border-collapse', className)}
      style={{ minWidth, ...style }}
      {...props}
    />
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => {
  return (
    <thead
      className={cn(
        'bg-surface-canvas border-b border-border-subtle text-[11px] font-bold text-text-secondary uppercase tracking-wider',
        className
      )}
      {...props}
    />
  );
};

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export const TableHead: React.FC<TableHeadProps> = ({
  className,
  align = 'left',
  ...props
}) => {
  return (
    <th
      className={cn(
        'py-3 px-4 font-bold',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      {...props}
    />
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => {
  return (
    <tbody
      className={cn('divide-y divide-border-subtle text-xs', className)}
      {...props}
    />
  );
};

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  className,
  clickable,
  onClick,
  ...props
}) => {
  const isClickable = clickable !== undefined ? clickable : Boolean(onClick);
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors group',
        isClickable && 'hover:bg-surface-canvas/80 cursor-pointer',
        className
      )}
      {...props}
    />
  );
};

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({
  className,
  align = 'left',
  ...props
}) => {
  return (
    <td
      className={cn(
        'py-3.5 px-4',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      {...props}
    />
  );
};

export interface TableEmptyRowProps {
  colSpan: number;
  message?: string;
  children?: React.ReactNode;
}

export const TableEmptyRow: React.FC<TableEmptyRowProps> = ({ colSpan, message, children }) => {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={colSpan} className="py-12 text-center text-text-muted">
        {children || message}
      </td>
    </tr>
  );
};
