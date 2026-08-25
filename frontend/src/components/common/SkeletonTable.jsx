const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex} className="skeleton-row">
          {Array.from({ length: cols }, (_, colIndex) => (
            <td key={colIndex}>
              <div
                className="skeleton-line shimmer-block"
                style={{
                  width: colIndex === 0 ? '75%' : colIndex === 1 ? '60%' : '50%',
                  height: '1rem',
                  borderRadius: '8px',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default SkeletonTable;
