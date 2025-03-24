'use client'
import React, { useEffect } from "react";

export function Stats({ pool_id }: { pool_id: string }) {
  const [stats, setStats] = React.useState<any>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/pool/${pool_id}/stat`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, [pool_id]);

  const blockCounts = Object.values(stats).map((day: any) => {
    const count = day?.block_count || 0;
    return count;
  });

  const maxBlocks = Math.max(...blockCounts, 0);

  return (
    <div className="mt-4 h-full bg-white p-4">
      <div className="text-lg font-semibold mb-2">
        Pool Performance (Last 30 Days)
      </div>
      <div className="relative flex flex-row gap-1 h-64 ml-8 items-end border-l border-b border-gray-200">
        <div className="absolute -left-8 top-0 text-gray-600 text-sm">
          {maxBlocks}
        </div>
        <div className="absolute -left-8 bottom-0 text-gray-600 text-sm">
          0
        </div>
        {Object.entries(stats).reverse().map(([date, dayStats]: [string, any], index) => {
          const blockCount = dayStats?.block_count || 0;
          const heightPercent = (blockCount / maxBlocks) * 100;
          const showLabel = index === 0 || index === Object.keys(stats).length - 1;

          return (
            <div
              key={date}
              className="flex-1 flex flex-col items-center justify-end group relative h-full"
            >
              <div
                className="w-full bg-primary-100 hover:bg-primary-110 transition-colors"
                style={{
                  height: `${heightPercent}%`,
                  minHeight: blockCount > 0 ? '2px' : '0px',
                }}
                title={`${date}: ${blockCount} blocks`}
              />
              <div className="text-xs mt-1 text-gray-600 absolute -bottom-6 whitespace-nowrap">
                {showLabel ? date.slice(-5) : ''}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="whitespace-nowrap">{date}:</div><div className="whitespace-nowrap">{blockCount} blocks</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-sm text-gray-500 mt-10">
        Blocks per day (Max: {maxBlocks})
      </div>
    </div>
  );
}
