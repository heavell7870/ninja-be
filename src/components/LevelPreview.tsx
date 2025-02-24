// src/components/LevelPreview.tsx

import React, { useEffect, useState } from "react";
import { Level } from "../types";
import { JsonEditor as Editor } from "json-edit-react";

interface LevelPreviewProps {
  levelData: Level;
}

const LevelPreview: React.FC<LevelPreviewProps> = ({ levelData }) => {
  const [editableRegion, setEditableRegion] = useState(levelData);
  console.log(levelData);
  useEffect(() => {
    setEditableRegion(levelData);
  }, [levelData]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(editableRegion, null, 2)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "levelData.json";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="mt-4 h-[500px] overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-2">Level Preview</h2>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleDownload}
        >
          Download JSON
        </button>
      </div>
      <div className="mt-3">
        <Editor
          minWidth={800}
          data={editableRegion}
          enableClipboard
          setData={(data: unknown) => setEditableRegion(data as Level)}
        />
      </div>
    </div>
  );
};

export default LevelPreview;
