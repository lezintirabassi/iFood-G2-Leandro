import React from 'react';

function Divisor({ texto }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">{texto}</span>
      </div>
    </div>
  );
}

export default Divisor;