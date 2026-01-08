export const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const spinner = (
    <div className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 dark:border-dark-700 border-t-primary-600`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center p-4">{spinner}</div>;
};
export default Loader;