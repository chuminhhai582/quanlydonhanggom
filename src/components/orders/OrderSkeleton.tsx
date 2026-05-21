import React from 'react';

export default function OrderSkeleton() {
  return (
    <div className="w-full">
      {/* Desktop Skeleton */}
      <div className="hidden xl:block">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-[var(--color-border-warm)] bg-white rounded-xl">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-48 h-3 bg-gray-100 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-8 bg-gray-100 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet Skeleton */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse border border-[var(--color-border-warm)] bg-white rounded-2xl p-4">
            <div className="flex justify-between mb-4">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
              <div className="w-48 h-3 bg-gray-100 rounded"></div>
            </div>
            <div className="w-full h-10 bg-gray-100 rounded-xl"></div>
          </div>
        ))}
      </div>

      {/* Mobile Skeleton */}
      <div className="md:hidden space-y-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse border border-[var(--color-border-warm)] bg-white rounded-2xl">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
              <div className="w-24 h-3 bg-gray-200 rounded"></div>
              <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="px-3.5 py-3 space-y-3">
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
              <div className="w-48 h-3 bg-gray-100 rounded"></div>
              <div className="flex gap-2">
                <div className="w-20 h-4 bg-gray-100 rounded"></div>
                <div className="w-20 h-4 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
