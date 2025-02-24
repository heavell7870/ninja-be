import { NODES } from "../constants";
import Block from "./Block";
import { Level, EnemyData } from "../types";
import { useState } from "react";

interface GridProps {
  onAddEnemy: (blockIndex: number, enemyData: EnemyData) => void;
  onAddPath: (blockIndex: number, prevBlockIndex?: number) => void;
  onNormalClick: (blockIndex: number) => void;
  onStartSelect: (blockIndex: number, angle: number) => void;
  onEndSelect: (blockIndex: number) => void;
  onAddCageKey: (blockIndex: number) => void;
  onAddCageReward: (blockIndex: number) => void;
  onAddDamageNode: (blockIndex: number) => void;
  onAddNewPathIndexA: (blockIndex: number) => void;
  onAddNewPathIndexB: (blockIndex: number) => void;
  onAddNewPath: (blockIndex: number) => void;
  data: Level;
}

const Grid: React.FC<GridProps> = ({
  onAddEnemy,
  onAddPath,
  onNormalClick,
  onStartSelect,
  onEndSelect,
  onAddCageKey,
  onAddCageReward,
  onAddDamageNode,
  onAddNewPathIndexA,
  onAddNewPathIndexB,
  onAddNewPath,
  data,
}) => {
  const [prevClickedIndex, setPrevClickedIndex] = useState<number>();
  return (
    <div className="grid grid-cols-20">
      {NODES.map((row) =>
        row.map((item) => (
          <Block
            key={item}
            data={data}
            blockIndex={item}
            onAddEnemy={(currIndex, enemyData) =>
              onAddEnemy(currIndex, enemyData)
            }
            onAddPath={(currIndex) => {
              onAddPath(currIndex, prevClickedIndex);
              setPrevClickedIndex(currIndex);
            }}
            onNormalClick={() => onNormalClick(item)}
            onStartSelect={(currIndex, angle) =>
              onStartSelect(currIndex, angle)
            }
            onEndSelect={(currIndex) => onEndSelect(currIndex)}
            onAddCageKey={(currIndex) => onAddCageKey(currIndex)}
            onAddCageReward={(currIndex) => onAddCageReward(currIndex)}
            onAddDamageNode={(currIndex) => onAddDamageNode(currIndex)}
            onAddNewPathIndexA={(currIndex) => onAddNewPathIndexA(currIndex)}
            onAddNewPathIndexB={(currIndex) => onAddNewPathIndexB(currIndex)}
            onAddNewPath={(currIndex) => onAddNewPath(currIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Grid;
