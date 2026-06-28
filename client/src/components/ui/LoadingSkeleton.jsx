// Reusable skeleton loading components

export const SkeletonBox = ({ className = "" }) => (
  <div className={`skeleton rounded ${className}`} />
);

export const SkeletonLine = ({ className = "" }) => (
  <div className={`skeleton h-4 rounded ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
    <div className="flex justify-between items-start mb-4">
      <SkeletonLine className="w-24" />
      <SkeletonBox className="w-12 h-12 rounded-xl" />
    </div>
    <SkeletonLine className="w-32 h-8 mt-3" />
    <SkeletonLine className="w-20 mt-3" />
  </div>
);

export const SkeletonTableRow = ({ cols = 5 }) => (
  <tr className="border-t border-gray-100 dark:border-slate-700">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-4">
        <SkeletonLine className={i === 0 ? "w-8" : i === cols - 1 ? "w-16" : "w-full"} />
      </td>
    ))}
  </tr>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonTableRow key={i} cols={cols} />
    ))}
  </>
);
