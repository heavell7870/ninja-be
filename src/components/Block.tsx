import React, { useEffect, useState } from "react";
import { EnemyData, Level, SubNode } from "../types";
import { AddEnemyModal } from "../modals/add-enemy";
import { AddStartModal } from "../modals/add-start";
import { aabr } from "../constants";
import { AddTrapModal } from "../modals/add-trap-Trigger";

interface BlockProps {
  isAddingTrap: boolean;
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
}: {
  children?: React.ReactNode;
  direction: number;
}) {
  return (
    <div
      className={`absolute w-6 h-6 text-xs text-white bg-gray-900 z-[1] ${
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
  const [clickedIndex, setClickedIndex] = useState<number>();
  const [isAddEnemyModalOpen, setIsAddEnemyModalOpen] = useState(false);
  const [startModal, setStartModal] = useState(false);
  const [trapModal, setTrapModal] = useState<"trigger" | "trap" | null>(null);
  const [pressedKey, setPressedKey] = useState<string>("");
  const [blockType, setBlockType] = useState<
    | "start"
    | "end"
    | "enemyStatic"
    | "enemyRotating"
    | "enemyMoving"
    | "enemyStrongMoving"
    | "key"
    | "rewardCage"
    | "damageNode"
    | "newPath"
    | "newPathIndexA"
    | "newPathIndexB"
    | "trap"
    | "trigger"
    | "selected"
    | "none"
  >("none");

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
      alert("Complete adding trap using keys t and r");
      return;
    }
    if (pressedKey === "x") {
      onAddPath(blockIndex);
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
    if (pressedKey === "n") {
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
    onNormalClick(blockIndex);
  };

  const getBlockColor = () => {
    switch (blockType) {
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
    // Check if block is start position (first SubNode)
    const spawnNode = data.SpawnObjects.find((spawn) => spawn.Tag === "Player");
    if (spawnNode?.NodeIndex === blockIndex) {
      setBlockType("start");
      return;
    }

    // Check if block is end position
    const isEnd = data.EndNode === blockIndex;
    if (isEnd) {
      setBlockType("end");
      return;
    }

    // Check if block has an enemy
    const enemy = data.Enemies.find(
      (enemy) => enemy.Object.NodeIndex === blockIndex
    );
    if (enemy) {
      switch (enemy.Type) {
        case "Static":
          setBlockType("enemyStatic");
          break;
        case "Rotating":
          setBlockType("enemyRotating");
          break;
        case "Moving":
          setBlockType("enemyMoving");
          break;
        case "StrongMoving":
          setBlockType("enemyStrongMoving");
          break;
      }
      return;
    }

    // Check if block has a trap
    const trap = data.Traps.find(
      (trap) => trap.TrapObject.NodeIndex === blockIndex
    );
    if (trap) {
      setBlockType("trap");
      return;
    }

    // Check if block has a trigger
    const trigger = data.Traps.find(
      (trap) => trap.TrapTrigger.NodeIndex === blockIndex
    );
    if (trigger) {
      setBlockType("trigger");
      return;
    }

    const selected = data.SubNodes.find((node) => node.Index === blockIndex);
    if (selected) {
      setBlockType("selected");
      return;
    }
    setBlockType("none");
  }, [data, blockIndex]);

  const handleAddEnemy = (enemyData: EnemyData) => {
    if (!clickedIndex) return;
    onAddEnemy(clickedIndex, enemyData);
  };

  const isDisabled = blockType === "start" || blockType === "end";

  return (
    <>
      <div className="w-9 h-9 bg-gray-700 flex flex-col justify-center items-center relative">
        {subNodeData?.Paths.map((path) => (
          <DirectionBox key={path} direction={path} />
        ))}
        <button
          disabled={isDisabled}
          className={`w-6 z-10 h-6 border border-gray-300 flex items-center justify-center cursor-pointer text-[9px] font-bold text-black ${getBlockColor()} ${
            isDisabled ? "!cursor-not-allowed" : ""
          }`}
          onClick={handleClick}
          title={blockType.toUpperCase()}
        >
          {aabr[blockType]}
          <span className="text-[5px] text-white">{blockIndex}</span>
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
