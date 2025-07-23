'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <PaginationPrevious
        href="#"
        onClick={() => onPageChange(currentPage - 1)}
      />
      {pages.map((page) => (
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            isCurrent={currentPage === page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ))}
      <PaginationNext href="#" onClick={() => onPageChange(currentPage + 1)} />
    </div>
  );
}

export const PaginationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className="flex w-full items-center justify-between gap-2 sm:gap-4"
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

export const PaginationItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => <div ref={ref} className="" {...props} />);
PaginationItem.displayName = 'PaginationItem';

export const PaginationLink = React.forwardRef<
  HTMLAnchorElement,
  {
    isCurrent?: boolean;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, isCurrent, ...props }, ref) => (
  <a
    ref={ref}
    className={`inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[active=true]:bg-blue-500 data-[active=true]:text-white data-[active=true]:hover:bg-blue-500 ${
      isCurrent ? 'bg-blue-500 text-white' : ''
    } ${className}`}
    {...props}
    data-active={isCurrent}
  />
));
PaginationLink.displayName = 'PaginationLink';

export const PaginationEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className="h-8 w-8 text-sm font-medium" {...props}>
    &hellip;
  </span>
));
PaginationEllipsis.displayName = 'PaginationEllipsis';

export const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    <ChevronLeft className="mr-2 h-4 w-4" />
    Previous
  </a>
));
PaginationPrevious.displayName = 'PaginationPrevious';

export const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  >
    Next
    <ChevronRight className="ml-2 h-4 w-4" />
  </a>
));
PaginationNext.displayName = 'PaginationNext';
