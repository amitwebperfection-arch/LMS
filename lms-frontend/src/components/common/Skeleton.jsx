export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`skeleton ${className}`}></div>
      ))}
    </>
  );
};
