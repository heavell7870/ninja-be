// src/components/StartEndSelector.tsx

import React from "react";

interface StartEndSelectorProps {
  start: [number, number] | null;
  end: [number, number] | null;
  onSetStart: (x: number, y: number) => void;
  onSetEnd: (x: number, y: number) => void;
}

const StartEndSelector: React.FC<StartEndSelectorProps> = ({
  start,
  end,
  onSetStart,
  onSetEnd,
}) => {
  return (
    <div className="flex space-x-4">
      <button
        className="px-4 py-2 bg-yellow-500 text-white rounded"
        onClick={() => {
          // Logic to set start position
          // Could toggle a mode or something similar
          alert("Click on a block to set Start Position");
        }}
      >
        Set Start
      </button>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded"
        onClick={() => {
          // Logic to set end position
          alert("Click on a block to set End Position");
        }}
      >
        Set End
      </button>
      <div>
        <p>Start: {start ? `(${start[0]}, ${start[1]})` : "None"}</p>
        <p>End: {end ? `(${end[0]}, ${end[1]})` : "None"}</p>
      </div>
    </div>
  );
};

export default StartEndSelector;
