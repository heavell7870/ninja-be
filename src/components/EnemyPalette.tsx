// src/components/EnemyPalette.tsx

import React from "react";

interface EnemyPaletteProps {
  enemies: string[];
  selectedEnemy: string | null;
  onSelectEnemy: (enemy: string) => void;
}

const EnemyPalette: React.FC<EnemyPaletteProps> = ({
  enemies,
  selectedEnemy,
  onSelectEnemy,
}) => {
  return (
    <div className="flex space-x-2">
      {enemies.map((enemy) => (
        <button
          key={enemy}
          className={`px-4 py-2 border rounded ${
            selectedEnemy === enemy ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => onSelectEnemy(enemy)}
        >
          {enemy}
        </button>
      ))}
    </div>
  );
};

export default EnemyPalette;
