'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, ChevronUp, Loader2 } from 'lucide-react';
import { useSubComments } from '@/hooks/usePosts';
import { SubCommentItem } from './SubCommentItem';

interface SubCommentsProps {
  parentCommentId: string;
  totalCount: number;
}

function SubCommentSkeleton() {
  return (
    <div className="flex space-x-2 animate-pulse">
      <div className="h-6 w-6 bg-gray-200 rounded-full mt-1"></div>
      <div className="flex-1">
        <div className="bg-gray-100 rounded-lg p-2 space-y-1">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

export function SubComments({ parentCommentId, totalCount }: SubCommentsProps) {
  const [visible, setVisible] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    error,
    isError,
  } = useSubComments({
    parentCommentId,
    page: 1,
    enabled: visible,
    limit: 5,
  });

  // Safely extract subComments, defaulting to empty array if data or pages are undefined
  const subComments = data?.pages.flatMap((page) => page.data) || [];

  const handleToggle = () => {
    setVisible((prev) => !prev);
  };

  // Show loading only for initial fetch with no data
  const isInitialLoading = visible && isLoading && subComments.length === 0;

  return (
    <div className="ml-11 mt-2 space-y-2">
      {totalCount > 0 && (
        <button
          onClick={handleToggle}
          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          {visible ? (
            <>
              <ChevronUp className="h-3 w-3" />
              <span>Hide replies</span>
            </>
          ) : (
            <>
              <MessageCircle className="h-3 w-3" />
              <span>
                View {totalCount} {totalCount === 1 ? 'reply' : 'replies'}
              </span>
            </>
          )}
        </button>
      )}

      {visible && (
        <div className="space-y-3">
          {isInitialLoading ? (
            <div className="space-y-2">
              {Array.from({ length: Math.min(totalCount, 3) }).map(
                (_, index) => (
                  <SubCommentSkeleton key={index} />
                ),
              )}
            </div>
          ) : isError ? (
            <div className="text-xs text-red-500 ml-2">
              Failed to load replies: {error?.message || 'Please try again.'}
            </div>
          ) : subComments.length > 0 ? (
            subComments.map((value: any) => (
              <SubCommentItem
                key={value?.id || `temp-${Math.random()}`}
                subComment={value}
              />
            ))
          ) : (
            <div className="text-xs text-muted-foreground ml-2">
              No replies yet.
            </div>
          )}

          {hasNextPage && (
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetching}
                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 h-auto"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  'Show more replies'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
