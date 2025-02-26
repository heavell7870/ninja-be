import React, { useEffect, useState } from "react";
import { EnemyData, Level, SubNode } from "../types";
import { AddEnemyModal } from "../modals/add-enemy";
import { AddStartModal } from "../modals/add-start";
import { aabr } from "../constants";
import { AddTrapModal } from "../modals/add-trap-Trigger";

interface BlockProps {
  isAddingTrap: {
    type: "Turret" | "Wall";
    index: number;
  } | null;
  onAddNewPath: (blockIndex: number) => void;
  onAddEnemy: (blockIndex: number, enemyData: EnemyData) => void;
  onAddTrapObject: (blockIndex: number, direction: number) => void;
  onAddTrapTrigger: (blockIndex: number, direction: number) => void;
  onAddPath: (currBlockIndex: number) => void;
  onNormalClick: (blockIndex: number) => void;
  onStartSelect: (blockIndex: number, angle: number) => void;
  onEndSelect: (blockIndex: number) => void;
  onAddCageKey: (blockIndex: number) => void;
  onAddCageReward: (blockIndex: number) => void;
  onAddDamageNode: (blockIndex: number) => void;
  onAddNewPathIndexA: (blockIndex: number) => void;
  onAddNewPathIndexB: (blockIndex: number) => void;
  data: Level;
  blockIndex: number;
}

function DirectionBox({
  children,
  direction,
  type = "subNode",
}: {
  children?: React.ReactNode;
  direction: number;
  type?: "newPath" | "subNode";
}) {
  return (
    <div
      className={`absolute w-6 h-6 text-xs text-white ${
        type === "newPath" ? "bg-yellow-500" : "bg-red-500"
      } z-[1] ${
        direction === 0
          ? "top-[-12px]"
          : direction === 2
          ? "bottom-[-12px]"
          : direction === 3
          ? "left-[-12px]"
          : "right-[-12px]"
      }`}
    >
      {children || ""}
    </div>
  );
}

const Block: React.FC<BlockProps> = ({
  isAddingTrap,
  onAddEnemy,
  onAddNewPath,
  onStartSelect,
  onEndSelect,
  onAddPath,
  onNormalClick,
  onAddCageKey,
  onAddCageReward,
  onAddDamageNode,
  onAddNewPathIndexA,
  onAddNewPathIndexB,
  onAddTrapObject,
  onAddTrapTrigger,
  data,
  blockIndex,
}) => {
  const [subNodeData, setSubNodeData] = useState<SubNode>();
  const [newPathData, setNewPathData] = useState<SubNode>();
  const [clickedIndex, setClickedIndex] = useState<number>();
  const [isAddEnemyModalOpen, setIsAddEnemyModalOpen] = useState(false);
  const [startModal, setStartModal] = useState(false);
  const [trapModal, setTrapModal] = useState<"trigger" | "trap" | null>(null);
  const [pressedKey, setPressedKey] = useState<string>("");
  const [blockTypes, setBlockTypes] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKey(event.key?.toLowerCase());
    };

    const handleKeyUp = () => {
      setPressedKey("");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default selection behavior
    setClickedIndex(blockIndex);
    if (isAddingTrap && pressedKey === "t") {
      setTrapModal("trigger");
      return;
    }
    if (isAddingTrap && pressedKey === "o") {
      setTrapModal("trap");
      return;
    }
    if (isAddingTrap) {
      alert("Complete adding trap using keys t and o");
      return;
    }
    if (pressedKey === "x") {
      onAddPath(blockIndex);
      return;
    }

    if (pressedKey === "n") {
      console.log("add new path index a", blockIndex);
      onAddNewPathIndexA(blockIndex);
      return;
    }
    if (pressedKey === "m") {
      onAddNewPathIndexB(blockIndex);
      return;
    }
    if (pressedKey === "p") {
      onAddNewPath(blockIndex);
      return;
    }

    if (!data.SubNodes.find((node) => node.Index === blockIndex)) {
      return;
    }

    if (pressedKey === "s") {
      setStartModal(true);
      return;
    }

    if (pressedKey === "e") {
      onEndSelect(blockIndex);
      return;
    }
    if (pressedKey === "k") {
      onAddCageKey(blockIndex);
      return;
    }
    if (pressedKey === "r") {
      onAddCageReward(blockIndex);
      return;
    }
    if (pressedKey === "d") {
      onAddDamageNode(blockIndex);
      return;
    }
    if (pressedKey === "a") {
      setIsAddEnemyModalOpen(true);
      return;
    }

    onNormalClick(blockIndex);
  };

  const getBlockColor = (type: string) => {
    // Single type
    switch (type) {
      case "start":
        return "bg-green-500"; // Green for start
      case "end":
        return "bg-red-500"; // Red for end
      case "enemyStatic":
        return "bg-purple-500"; // Purple for static enemies
      case "enemyRotating":
        return "bg-indigo-500"; // Indigo for rotating enemies
      case "enemyMoving":
        return "bg-yellow-500"; // Yellow for moving enemies
      case "enemyStrongMoving":
        return "bg-orange-500"; // Orange for strong moving enemies
      case "trap":
        return "bg-fuchsia-500"; // Fuchsia for traps
      case "trigger":
        return "bg-cyan-500"; // Cyan for triggers
      case "selected":
        return "bg-blue-500"; // Blue for selected
      case "key":
        return "bg-teal-500"; // Teal for key
      case "rewardCage":
        return "bg-pink-500"; // Pink for reward cage
      case "damageNode":
        return "bg-red-500"; // Red for damage node
      case "newPath":
        return "bg-green-500"; // Green for new path
      case "newPathIndexA":
        return "bg-slate-500"; // Yellow for new path index A
      case "newPathIndexB":
        return "bg-lime-500"; // Lime for new path index B
      default:
        return "bg-gray-400"; // Default gray
    }
  };

  useEffect(() => {
    const subNode = data.SubNodes.find((node) => node.Index === blockIndex);
    if (subNode) {
      setSubNodeData(subNode);
    } else {
      setSubNodeData(undefined);
    }
  }, [data, blockIndex]);

  useEffect(() => {
    const subNode = data.NewPaths[0]?.NodesToUnlock.find(
      (node) => node.Index === blockIndex
    );
    if (subNode) {
      setNewPathData(subNode);
    } else {
      setNewPathData(undefined);
    }
  }, [data, blockIndex]);

  useEffect(() => {
    const types = [];

    // Check if block is start position (first SubNode)
    const spawnNode = data.SpawnObjects.find((spawn) => spawn.Tag === "Player");
    if (spawnNode?.NodeIndex === blockIndex) {
      types.push("start");
    }

    // Check if block is end position
    const isEnd = data.EndNode === blockIndex;
    if (isEnd) {
      types.push("end");
    }

    // Check if block has an enemy
    const enemy = data.Enemies.find(
      (enemy) => enemy.Object.NodeIndex === blockIndex
    );
    if (enemy) {
      switch (enemy.Type) {
        case "Static":
          types.push("enemyStatic");
          break;
        case "Rotating":
          types.push("enemyRotating");
          break;
        case "Moving":
          types.push("enemyMoving");
          break;
        case "StrongMoving":
          types.push("enemyStrongMoving");
          break;
      }
    }

    // Check if block has a trap
    const trap = data.Traps.find(
      (trap) => trap.TrapObject?.NodeIndex === blockIndex
    );
    if (trap) {
      types.push("trap");
    }

    // Check if block has a trigger
    const trigger = data.Traps.find(
      (trap) => trap.TrapTrigger?.NodeIndex === blockIndex
    );
    if (trigger) {
      types.push("trigger");
    }

    // Check if block is a damage node
    const isDamageNode = data.SpawnObjects?.some(
      (spawn) => spawn.Tag === "DamageNode" && spawn.NodeIndex === blockIndex
    );
    if (isDamageNode) {
      types.push("damageNode");
    }

    // Check if block is a key
    const isKey = data.SpawnObjects?.some(
      (spawn) => spawn.Tag === "Key" && spawn.NodeIndex === blockIndex
    );
    if (isKey) {
      types.push("key");
    }

    // Check if block is a reward cage
    const isRewardCage = data.SpawnObjects?.some(
      (spawn) => spawn.Tag === "RewardCage" && spawn.NodeIndex === blockIndex
    );
    if (isRewardCage) {
      types.push("rewardCage");
    }

    // Check if block is a new path index A
    const isNewPathIndexA = data.NewPaths?.some(
      (path) => path.IndexA === blockIndex
    );
    if (isNewPathIndexA) {
      types.push("newPathIndexA");
    }

    // Check if block is a new path index B
    const isNewPathIndexB = data.NewPaths?.some(
      (path) => path.IndexB === blockIndex
    );
    if (isNewPathIndexB) {
      types.push("newPathIndexB");
    }

    // Check if block is a new path
    const isNewPath = data.NewPaths[0]?.NodesToUnlock?.some(
      (node) => node.Index === blockIndex
    );
    if (isNewPath) {
      types.push("newPath");
    }

    // If no special types but it's a subnode, mark as selected
    if (
      types.length === 0 &&
      data.SubNodes.some((node) => node.Index === blockIndex)
    ) {
      types.push("selected");
    }

    setBlockTypes(types);
  }, [data, blockIndex]);

  const handleAddEnemy = (enemyData: EnemyData) => {
    if (!clickedIndex) return;
    onAddEnemy(clickedIndex, enemyData);
  };

  const isDisabled = blockTypes.includes("start") || blockTypes.includes("end");

  // Create a display string for multiple block types
  const getBlockTypeDisplay = () => {
    if (blockTypes.length === 0) return "";
    if (blockTypes.length === 1)
      return aabr[blockTypes[0] as keyof typeof aabr] || "";

    // For multiple types, show the first letter of each type
    return blockTypes
      .map((type) =>
        (aabr[type as keyof typeof aabr] || type.charAt(0)).toUpperCase()
      )
      .join("/");
  };

  return (
    <>
      <div className="w-14 h-14 bg-gray-700 flex flex-col justify-center items-center relative">
        {subNodeData?.Paths.map((path) => (
          <DirectionBox key={path} direction={path} />
        ))}
        {newPathData?.Paths.map((path) => (
          <DirectionBox type="newPath" key={path} direction={path} />
        ))}
        <button
          disabled={isDisabled}
          className={`w-10 z-10 h-10 border border-gray-300 flex items-center justify-center cursor-pointer text-[10px] font-bold text-black overflow-hidden text-wrap break-all ${getBlockColor(
            blockTypes[0] || "none"
          )} ${isDisabled ? "!cursor-not-allowed" : ""}`}
          onClick={handleClick}
          title={blockTypes.join(", ") + ", " + blockIndex}
        >
          <div className="whitespace-normal break-words leading-tight">
            {getBlockTypeDisplay()}
          </div>
          {blockTypes.length > 1 && (
            <div className="absolute top-1 left-1 flex">
              {blockTypes.slice(1).map((type, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full mx-0.5 mb-0.5 ${getBlockColor(
                    type
                  )}`}
                  title={type}
                />
              ))}
            </div>
          )}
          {/* <span className="text-[5px] text-white">{blockIndex}</span> */}
        </button>
      </div>
      <AddEnemyModal
        isOpen={isAddEnemyModalOpen}
        onClose={() => setIsAddEnemyModalOpen(false)}
        onSubmit={handleAddEnemy}
      />
      <AddStartModal
        isOpen={startModal}
        onClose={() => setStartModal(false)}
        onSubmit={(direction) => onStartSelect(blockIndex, direction)}
      />
      <AddTrapModal
        isTrigger={trapModal === "trigger"}
        isOpen={trapModal !== null}
        onClose={() => setTrapModal(null)}
        onSubmit={({ direction }) => {
          if (trapModal === "trigger") {
            onAddTrapTrigger(blockIndex, direction);
          } else {
            onAddTrapObject(blockIndex, direction);
          }
        }}
      />
    </>
  );
};

export default Block;
