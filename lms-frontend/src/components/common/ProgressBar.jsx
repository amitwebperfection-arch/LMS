export const ProgressBar = ({ progress, showLabel = true, size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    primary: 'from-primary-500 to-primary-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-500 to-red-600',
  };

  return (
    <div className="w-full">
      <div className={`progress-bar ${sizes[size]}`}>
        <div
          className={`progress-fill bg-gradient-to-r ${colors[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      {showLabel && (
        <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
          {Math.round(progress)}% Complete
        </span>
      )}
    </div>
  );
};
export default ProgressBar;