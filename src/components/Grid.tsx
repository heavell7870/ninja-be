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
  onLaserSelect: (blockIndex: number, angle: number) => void;
  onAddNewPath: (blockIndex: number, prevBlockIndex?: number) => void;
  data: Level;
  isAddingTrap: {
    type: "Turret" | "Wall";
    index: number;
  } | null;
  onAddTrapObject: (blockIndex: number, direction: number) => void;
  onAddTrapTrigger: (blockIndex: number, direction: number) => void;
}

const Grid: React.FC<GridProps> = ({
  isAddingTrap,
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
  onAddTrapObject,
  onAddTrapTrigger,
  onLaserSelect,
  data,
}) => {
  const [prevClickedIndex, setPrevClickedIndex] = useState<number>();
  const [prevNewPathData, setPrevNewPathData] = useState<number>();
  return (
    <div className="grid grid-cols-20">
      {NODES.map((row) =>
        row.map((item) => (
          <Block
            key={item}
            data={data}
            blockIndex={item}
            isAddingTrap={isAddingTrap}
            onAddTrapObject={(currIndex, direction) =>
              onAddTrapObject(currIndex, direction)
            }
            onAddTrapTrigger={(currIndex, direction) =>
              onAddTrapTrigger(currIndex, direction)
            }
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
            onLaserSelect={(currIndex, angle) =>
              onLaserSelect(currIndex, angle)
            }
            onAddNewPath={(currIndex) => {
              onAddNewPath(currIndex, prevNewPathData);
              setPrevNewPathData(currIndex);
            }}
          />
        ))
      )}
    </div>
  );
};

export default Grid;
