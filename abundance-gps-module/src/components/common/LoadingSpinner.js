import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      {/* Simple spinning circle */}
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}

export default LoadingSpinner; 