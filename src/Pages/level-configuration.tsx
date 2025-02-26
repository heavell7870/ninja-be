// src/App.tsx

import React, { useEffect, useState } from "react";
import Grid from "../components/Grid";
import LevelPreview from "../components/LevelPreview";
import { EnemyData, Level, TrapTrigger } from "../types";
import { useData } from "../hooks/data";
import { useParams } from "react-router";
import { aabr, NODES, resetLevelData } from "../constants";

const keyInstructions = [
  { key: "x", action: "Add Path" },
  { key: "s", action: "Select Start" },
  { key: "e", action: "Select End" },
  { key: "k", action: "Add Cage Key" },
  { key: "r", action: "Add Cage Reward" },
  { key: "d", action: "Add Damage Node" },
  { key: "a", action: "Add Enemy" },
  { key: "n", action: "Add New Path Index A" },
  { key: "m", action: "Add New Path Index B" },
  { key: "p", action: "Add New Path" },
  { key: "t", action: "Add Trap" },
  { key: "o", action: "Add Trap Object" },
];

const LevelConfiguration: React.FC = () => {
  const { data, setData } = useData();
  const { region, level } = useParams();
  const [levelData, setLevelData] = useState<Level>();
  const [isAddingTrap, setIsAddingTrap] = useState<{
    type: "Wall" | "Turret";
    index: number;
  } | null>(null);

  useEffect(() => {
    if (data && !levelData) {
      const foundLevel = data.Nodes.find(
        (n) => n.NodeTag === region
      )?.Levels.find((l) => l.LevelTag === level);
      if (foundLevel) {
        setLevelData(foundLevel);
      }
    }
  }, [data, region, level]);

  // For adding enemy
  const handleAddEnemy = (blockIndex: number, enemyData: EnemyData) => {
    console.log(blockIndex, enemyData, "called");
    setLevelData((prevData) => {
      if (!prevData) return prevData;

      // Check if enemy already exists at this position
      const existingEnemy = prevData.Enemies.find(
        (enemy) => enemy.Object.NodeIndex === blockIndex
      );

      if (existingEnemy) {
        // If enemy exists, update it instead of adding new one
        const newData = { ...prevData };
        const enemyIndex = newData.Enemies.findIndex(
          (enemy) => enemy.Object.NodeIndex === blockIndex
        );

        newData.Enemies[enemyIndex] = {
          Object: {
            Tag: "Enemy",
            NodeIndex: blockIndex,
            CustomTransform: {
              position: { x: 0, y: 0, z: 0 },
              eulerAngles: { x: 0, y: enemyData.direction, z: 0 },
              localScale: { x: 0, y: 0, z: 0 },
            },
          },
          Type: enemyData.type as
            | "Static"
            | "Rotating"
            | "Moving"
            | "StrongMoving",
          Spawnable: enemyData.spawnable,
          RotateAntiClockwise: enemyData.rotateAntiClockwise,
        };
        return newData;
      }

      // If no existing enemy, add new one
      const newData = { ...prevData };
      newData.Enemies.push({
        Object: {
          Tag: "Enemy",
          NodeIndex: blockIndex,
          CustomTransform: {
            position: { x: 0, y: 0, z: 0 },
            eulerAngles: { x: 0, y: enemyData.direction, z: 0 },
            localScale: { x: 0, y: 0, z: 0 },
          },
        },
        Type: enemyData.type as
          | "Static"
          | "Rotating"
          | "Moving"
          | "StrongMoving",
        Spawnable: enemyData.spawnable,
        RotateAntiClockwise: enemyData.rotateAntiClockwise,
      });
      return newData;
    });
  };

  const saveLevel = (data: Level) => {
    if (!data) return;
    setLevelData(data);
    setData((prevData) => {
      if (!prevData) return prevData;
      const updatedData = { ...prevData };
      const selectedNodeIndex = updatedData.Nodes.findIndex(
        (n) => n.NodeTag === region
      );
      if (selectedNodeIndex !== -1) {
        const selectedLevelIndex = updatedData.Nodes[
          selectedNodeIndex
        ].Levels.findIndex((l) => l.LevelTag === level);
        if (selectedLevelIndex !== -1) {
          updatedData.Nodes[selectedNodeIndex].Levels[selectedLevelIndex] =
            data;
        }
      }
      return updatedData;
    });
  };

  const generateNeighbourNodesForMainPath = (newData: Level) => {
    if (!newData) return newData;

    const subNodes = [...(newData.SubNodes || [])];

    // Helper function to check if two nodes are connected by paths
    const areNodesConnected = (node1Index: number, node2Index: number) => {
      const node1 = subNodes.find((n) => n.Index === node1Index);
      const node2 = subNodes.find((n) => n.Index === node2Index);
      if (!node1 || !node2) return false;

      // Find positions
      let node1Row = -1,
        node1Col = -1,
        node2Row = -1,
        node2Col = -1;
      NODES.forEach((row, i) => {
        const index1 = row.indexOf(node1Index);
        const index2 = row.indexOf(node2Index);
        if (index1 > -1) {
          node1Row = i;
          node1Col = index1;
        }
        if (index2 > -1) {
          node2Row = i;
          node2Col = index2;
        }
      });

      // Determine required paths based on relative position
      if (node2Row === node1Row - 1) {
        // node2 is above node1
        return node1.Paths.includes(0) || node2.Paths.includes(2);
      } else if (node2Col === node1Col + 1) {
        // node2 is right of node1
        return node1.Paths.includes(1) || node2.Paths.includes(3);
      } else if (node2Row === node1Row + 1) {
        // node2 is below node1
        return node1.Paths.includes(2) || node2.Paths.includes(0);
      } else if (node2Col === node1Col - 1) {
        // node2 is left of node1
        return node1.Paths.includes(3) || node2.Paths.includes(1);
      }
      return false;
    };

    // Helper function to get neighbour nodes
    const getNeighbourNodes = (nodeIndex: number) => {
      let row = -1,
        col = -1;
      NODES.forEach((r, i) => {
        const c = r.indexOf(nodeIndex);
        if (c > -1) {
          row = i;
          col = c;
        }
      });

      const neighbourNodes = [false, false, false, false];

      // Up
      if (row >= 1) {
        const upIndex = NODES[row - 1][col];
        const upExists = subNodes.some((n) => n.Index === upIndex);
        if (upExists && !areNodesConnected(nodeIndex, upIndex)) {
          neighbourNodes[0] = true;
        }
      }

      // Right
      if (col <= NODES[0].length - 2) {
        const rightIndex = NODES[row][col + 1];
        const rightExists = subNodes.some((n) => n.Index === rightIndex);
        if (rightExists && !areNodesConnected(nodeIndex, rightIndex)) {
          neighbourNodes[1] = true;
        }
      }

      // Down
      if (row <= NODES.length - 2) {
        const downIndex = NODES[row + 1][col];
        const downExists = subNodes.some((n) => n.Index === downIndex);
        if (downExists && !areNodesConnected(nodeIndex, downIndex)) {
          neighbourNodes[2] = true;
        }
      }

      // Left
      if (col >= 1) {
        const leftIndex = NODES[row][col - 1];
        const leftExists = subNodes.some((n) => n.Index === leftIndex);
        if (leftExists && !areNodesConnected(nodeIndex, leftIndex)) {
          neighbourNodes[3] = true;
        }
      }

      return neighbourNodes;
    };

    // Update all nodes' NeighbourNodes
    subNodes.forEach((node) => {
      node.NeighbourNodes = getNeighbourNodes(node.Index);
    });

    newData.SubNodes = subNodes;
    return newData;
  };

  const generateNeighbourNodesForNewPath = (newData: Level) => {
    if (
      !newData.NewPaths?.length ||
      !newData.NewPaths ||
      !newData.NewPaths[0] ||
      !newData.NewPaths[0].NodesToUnlock
    )
      return newData;
    const subNodes = [...(newData.NewPaths[0]?.NodesToUnlock || [])];

    // Helper function to check if two nodes are connected by paths
    const areNodesConnected = (node1Index: number, node2Index: number) => {
      const node1 = subNodes.find((n) => n.Index === node1Index);
      const node2 = subNodes.find((n) => n.Index === node2Index);
      if (!node1 || !node2) return false;

      // Find positions
      let node1Row = -1,
        node1Col = -1,
        node2Row = -1,
        node2Col = -1;
      NODES.forEach((row, i) => {
        const index1 = row.indexOf(node1Index);
        const index2 = row.indexOf(node2Index);
        if (index1 > -1) {
          node1Row = i;
          node1Col = index1;
        }
        if (index2 > -1) {
          node2Row = i;
          node2Col = index2;
        }
      });

      // Determine required paths based on relative position
      if (node2Row === node1Row - 1) {
        // node2 is above node1
        return node1.Paths.includes(0) || node2.Paths.includes(2);
      } else if (node2Col === node1Col + 1) {
        // node2 is right of node1
        return node1.Paths.includes(1) || node2.Paths.includes(3);
      } else if (node2Row === node1Row + 1) {
        // node2 is below node1
        return node1.Paths.includes(2) || node2.Paths.includes(0);
      } else if (node2Col === node1Col - 1) {
        // node2 is left of node1
        return node1.Paths.includes(3) || node2.Paths.includes(1);
      }
      return false;
    };

    // Helper function to get neighbour nodes
    const getNeighbourNodes = (nodeIndex: number) => {
      let row = -1,
        col = -1;
      NODES.forEach((r, i) => {
        const c = r.indexOf(nodeIndex);
        if (c > -1) {
          row = i;
          col = c;
        }
      });

      const neighbourNodes = [false, false, false, false];

      // Up
      if (row >= 1) {
        const upIndex = NODES[row - 1][col];
        const upExists = subNodes.some((n) => n.Index === upIndex);
        if (upExists && !areNodesConnected(nodeIndex, upIndex)) {
          neighbourNodes[0] = true;
        }
      }

      // Right
      if (col <= NODES[0].length - 2) {
        const rightIndex = NODES[row][col + 1];
        const rightExists = subNodes.some((n) => n.Index === rightIndex);
        if (rightExists && !areNodesConnected(nodeIndex, rightIndex)) {
          neighbourNodes[1] = true;
        }
      }

      // Down
      if (row <= NODES.length - 2) {
        const downIndex = NODES[row + 1][col];
        const downExists = subNodes.some((n) => n.Index === downIndex);
        if (downExists && !areNodesConnected(nodeIndex, downIndex)) {
          neighbourNodes[2] = true;
        }
      }

      // Left
      if (col >= 1) {
        const leftIndex = NODES[row][col - 1];
        const leftExists = subNodes.some((n) => n.Index === leftIndex);
        if (leftExists && !areNodesConnected(nodeIndex, leftIndex)) {
          neighbourNodes[3] = true;
        }
      }

      return neighbourNodes;
    };

    // Update all nodes' NeighbourNodes
    subNodes.forEach((node) => {
      node.NeighbourNodes = getNeighbourNodes(node.Index);
    });

    newData.NewPaths[0].NodesToUnlock = subNodes;
    return newData;
  };

  const generateJumpNodesForMainPath = (newData: Level) => {
    const subNodes = [...(newData.SubNodes || [])];

    // Helper function to find node position
    const findNodePosition = (nodeIndex: number) => {
      let row = -1,
        col = -1;
      NODES.forEach((r, i) => {
        const c = r.indexOf(nodeIndex);
        if (c > -1) {
          row = i;
          col = c;
        }
      });
      return { row, col };
    };

    // Helper function to check if nodes are connected in a direction
    const areNodesConnectedInDirection = (
      node1Index: number,
      node2Index: number,
      direction: number
    ) => {
      const node1 = subNodes.find((n) => n.Index === node1Index);
      const node2 = subNodes.find((n) => n.Index === node2Index);

      if (!node1 || !node2) return false;

      // Check if either node points to the other in the specified direction
      if (direction === 0) {
        // Up
        return node1.Paths.includes(0) || node2.Paths.includes(2);
      } else if (direction === 1) {
        // Right
        return node1.Paths.includes(1) || node2.Paths.includes(3);
      } else if (direction === 2) {
        // Down
        return node1.Paths.includes(2) || node2.Paths.includes(0);
      } else if (direction === 3) {
        // Left
        return node1.Paths.includes(3) || node2.Paths.includes(1);
      }
      return false;
    };

    subNodes.forEach((node) => {
      const { row, col } = findNodePosition(node.Index);
      const jumpNodes = [false, false, false, false];

      // Check Up (0)
      if (row >= 1) {
        const upIndex = NODES[row - 1][col];
        if (areNodesConnectedInDirection(node.Index, upIndex, 0)) {
          jumpNodes[0] = true;
        }
      }

      // Check Right (1)
      if (col <= NODES[0].length - 2) {
        const rightIndex = NODES[row][col + 1];
        if (areNodesConnectedInDirection(node.Index, rightIndex, 1)) {
          jumpNodes[1] = true;
        }
      }

      // Check Down (2)
      if (row <= NODES.length - 2) {
        const downIndex = NODES[row + 1][col];
        if (areNodesConnectedInDirection(node.Index, downIndex, 2)) {
          jumpNodes[2] = true;
        }
      }

      // Check Left (3)
      if (col >= 1) {
        const leftIndex = NODES[row][col - 1];
        if (areNodesConnectedInDirection(node.Index, leftIndex, 3)) {
          jumpNodes[3] = true;
        }
      }

      node.JumpNodes = jumpNodes;
    });

    newData.SubNodes = subNodes;
    return newData;
  };

  const generateSubNodeForNewPath = (newData: Level) => {
    if (
      !newData.NewPaths?.length ||
      !newData.NewPaths ||
      !newData.NewPaths[0] ||
      !newData.NewPaths[0].NodesToUnlock
    )
      return newData;
    const subNodes = [...(newData.NewPaths[0].NodesToUnlock || [])];

    // Helper function to find node position
    const findNodePosition = (nodeIndex: number) => {
      let row = -1,
        col = -1;
      NODES.forEach((r, i) => {
        const c = r.indexOf(nodeIndex);
        if (c > -1) {
          row = i;
          col = c;
        }
      });
      return { row, col };
    };

    // Helper function to check if nodes are connected in a direction
    const areNodesConnectedInDirection = (
      node1Index: number,
      node2Index: number,
      direction: number
    ) => {
      const node1 = subNodes.find((n) => n.Index === node1Index);
      const node2 = subNodes.find((n) => n.Index === node2Index);

      if (!node1 || !node2) return false;

      // Check if either node points to the other in the specified direction
      if (direction === 0) {
        // Up
        return node1.Paths.includes(0) || node2.Paths.includes(2);
      } else if (direction === 1) {
        // Right
        return node1.Paths.includes(1) || node2.Paths.includes(3);
      } else if (direction === 2) {
        // Down
        return node1.Paths.includes(2) || node2.Paths.includes(0);
      } else if (direction === 3) {
        // Left
        return node1.Paths.includes(3) || node2.Paths.includes(1);
      }
      return false;
    };

    subNodes.forEach((node) => {
      const { row, col } = findNodePosition(node.Index);
      const jumpNodes = [false, false, false, false];

      // Check Up (0)
      if (row >= 1) {
        const upIndex = NODES[row - 1][col];
        if (areNodesConnectedInDirection(node.Index, upIndex, 0)) {
          jumpNodes[0] = true;
        }
      }

      // Check Right (1)
      if (col <= NODES[0].length - 2) {
        const rightIndex = NODES[row][col + 1];
        if (areNodesConnectedInDirection(node.Index, rightIndex, 1)) {
          jumpNodes[1] = true;
        }
      }

      // Check Down (2)
      if (row <= NODES.length - 2) {
        const downIndex = NODES[row + 1][col];
        if (areNodesConnectedInDirection(node.Index, downIndex, 2)) {
          jumpNodes[2] = true;
        }
      }

      // Check Left (3)
      if (col >= 1) {
        const leftIndex = NODES[row][col - 1];
        if (areNodesConnectedInDirection(node.Index, leftIndex, 3)) {
          jumpNodes[3] = true;
        }
      }

      node.JumpNodes = jumpNodes;
    });

    newData.NewPaths[0].NodesToUnlock = subNodes;
    return newData;
  };
  const generateJumpNodes = () => {
    if (!levelData) return;
    const confirmSave = window.confirm("Save level?");
    if (!confirmSave) return;

    let newData = { ...levelData };
    newData = generateJumpNodesForMainPath(newData);
    newData = generateNeighbourNodesForMainPath(newData);
    newData = generateSubNodeForNewPath(newData);
    newData = generateNeighbourNodesForNewPath(newData);
    saveLevel(newData);
  };

  // For creating SubNodes
  const handleAddPath = (
    currentBlockIndex: number,
    prevBlockIndex?: number
  ) => {
    if (!levelData) return;

    setLevelData((prevData) => {
      if (!prevData) {
        console.log("No previous data");
        return prevData;
      }

      const newData = { ...prevData };
      const subNodes = [...(newData.SubNodes || [])];
      const jumpNodes = [false, false, false, false];
      const neighbourNodes = [false, false, false, false];

      // If no previous index, just create a new node
      if (!prevBlockIndex) {
        const currNode = subNodes.find(
          (node) => node.Index === currentBlockIndex
        );

        if (!currNode) {
          subNodes.push({
            Index: currentBlockIndex,
            Paths: [],
            JumpNodes: jumpNodes,
            NeighbourNodes: neighbourNodes,
          });
        }

        newData.SubNodes = subNodes;
        return newData;
      }

      // Find if previous node exists
      const prevNode = subNodes.find((node) => node.Index === prevBlockIndex);
      const currNode = subNodes.find(
        (node) => node.Index === currentBlockIndex
      );

      // Get relative position to determine path direction
      let prevRow = -1,
        prevCol = -1,
        currRow = -1,
        currCol = -1;
      NODES.forEach((row, i) => {
        const pIndex = row.indexOf(prevBlockIndex);
        const cIndex = row.indexOf(currentBlockIndex);
        if (pIndex > -1) {
          prevRow = i;
          prevCol = pIndex;
        }
        if (cIndex > -1) {
          currRow = i;
          currCol = cIndex;
        }
      });

      // Determine path direction
      let pathDirection = -1;
      if (currRow === prevRow - 1) pathDirection = 0;
      else if (currCol === prevCol + 1) pathDirection = 1;
      else if (currRow === prevRow + 1) pathDirection = 2;
      else if (currCol === prevCol - 1) pathDirection = 3;

      if (pathDirection === -1) {
        console.log("Invalid path");
        return prevData;
      }

      if (prevNode) {
        if (!prevNode.Paths.includes(pathDirection)) {
          prevNode.Paths.push(pathDirection);
        }
      } else {
        subNodes.push({
          Index: prevBlockIndex,
          Paths: [pathDirection],
          JumpNodes: jumpNodes,
          NeighbourNodes: neighbourNodes,
        });
      }

      if (!currNode) {
        subNodes.push({
          Index: currentBlockIndex,
          Paths: [],
          JumpNodes: jumpNodes,
          NeighbourNodes: neighbourNodes,
        });
      }

      newData.SubNodes = subNodes;
      return newData;
    });
  };

  const handleReset = () => {
    setLevelData(resetLevelData(levelData?.LevelTag || ""));
  };

  const handleStartSelect = (blockIndex: number, angle: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };

      // Check if Player object already exists
      const playerIndex = newData.SpawnObjects.findIndex(
        (obj) => obj.Tag === "Player"
      );

      if (playerIndex !== -1) {
        // Update existing player object
        newData.SpawnObjects[playerIndex] = {
          ...newData.SpawnObjects[playerIndex],
          NodeIndex: blockIndex,
          CustomTransform: {
            ...newData.SpawnObjects[playerIndex].CustomTransform,
            eulerAngles: { x: 0, y: angle, z: 0 },
          },
        };
      } else {
        // Add new player object
        newData.SpawnObjects.push({
          Tag: "Player",
          NodeIndex: blockIndex,
          CustomTransform: {
            position: { x: 0, y: 0, z: 0 },
            eulerAngles: { x: 0, y: angle, z: 0 },
            localScale: { x: 0, y: 0, z: 0 },
          },
        });
      }

      return newData;
    });
  };

  const handleEndSelect = (blockIndex: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };
      newData.EndNode = blockIndex;
      return newData;
    });
  };

  const handleAddCageKey = (blockIndex: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };

      // Check if Key object already exists
      const keyIndex = newData.SpawnObjects.findIndex(
        (obj) => obj.Tag === "Key"
      );

      if (keyIndex !== -1) {
        // Update existing key object
        newData.SpawnObjects[keyIndex] = {
          ...newData.SpawnObjects[keyIndex],
          NodeIndex: blockIndex,
          CustomTransform: {
            ...newData.SpawnObjects[keyIndex].CustomTransform,
            position: { x: 0, y: 0, z: 0 },
            eulerAngles: { x: 0, y: 0, z: 0 },
            localScale: { x: 0, y: 0, z: 0 },
          },
        };
      } else {
        // Add new key object
        newData.SpawnObjects.push({
          Tag: "Key",
          NodeIndex: blockIndex,
          CustomTransform: {
            position: { x: 0, y: 0, z: 0 },
            eulerAngles: { x: 0, y: 0, z: 0 },
            localScale: { x: 0, y: 0, z: 0 },
          },
        });
      }

      return newData;
    });
  };
  const handleAddCageReward = (blockIndex: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };

      // Check if RewardCage object already exists
      const rewardCageIndex = newData.SpawnObjects.findIndex(
        (obj) => obj.Tag === "RewardCage"
      );

      if (rewardCageIndex !== -1) {
        // Update existing reward cage object
        newData.SpawnObjects[rewardCageIndex] = {
          ...newData.SpawnObjects[rewardCageIndex],
          NodeIndex: blockIndex,
          CustomTransform: {
            ...newData.SpawnObjects[rewardCageIndex].CustomTransform,
            position: { x: 0, y: 0, z: 0 },
            eulerAngles: { x: 0, y: 0, z: 0 },
            localScale: { x: 0, y: 0, z: 0 },
          },
        };
      } else {
        // Add new reward cage object
        newData.SpawnObjects.push({
          Tag: "RewardCage",
          NodeIndex: blockIndex,
          CustomTransform: {
            position: { x: 0, y: 0, z: 0 },
            eulerAngles: { x: 0, y: 0, z: 0 },
            localScale: { x: 0, y: 0, z: 0 },
          },
        });
      }

      return newData;
    });
  };

  const handleAddDamageNode = (blockIndex: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };
      newData.SpawnObjects.push({
        Tag: "DamageNode",
        NodeIndex: blockIndex,
        CustomTransform: {
          position: { x: 0, y: 0, z: 0 },
          eulerAngles: { x: 0, y: 0, z: 0 },
          localScale: { x: 0, y: 0, z: 0 },
        },
      });
      return newData;
    });
  };
  const handleAddNewPathIndexA = (index: number) => {
    const exists = levelData?.NewPaths?.[0]?.IndexA;
    if (exists) {
      const confirm = window.confirm(
        "A path already exists, click ok to overwrite"
      );
      if (confirm) {
        setLevelData((prevData) => {
          if (!prevData) return prevData;
          const newData = { ...prevData };
          if (!newData.NewPaths || !newData.NewPaths[0]) {
            newData.NewPaths = [
              {
                IndexA: index,
                IndexB: index,
                JointA: index,
                JointB: index,
                NodesToUnlock: [],
              },
            ];
          } else {
            newData.NewPaths[0].IndexA = index;
            newData.NewPaths[0].JointA = index;
          }
          return newData;
        });
      }
    } else {
      setLevelData((prevData) => {
        if (!prevData) return prevData;
        const newData = { ...prevData };
        if (!newData.NewPaths || !newData.NewPaths[0]) {
          newData.NewPaths = [
            {
              IndexA: index,
              IndexB: index,
              JointA: index,
              JointB: index,
              NodesToUnlock: [],
            },
          ];
        } else {
          newData.NewPaths[0].IndexA = index;
          newData.NewPaths[0].JointA = index;
        }
        return newData;
      });
    }
  };

  const handleAddNewPathIndexB = (index: number) => {
    const exists = levelData?.NewPaths[0]?.IndexB;
    if (!exists) {
      alert("No index a found, add index a first");
      return;
    }
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };
      newData.NewPaths[0].IndexB = index;
      newData.NewPaths[0].JointB = index;
      return newData;
    });
  };

  const handleAddNewPath = (
    currentBlockIndex: number,
    prevBlockIndex?: number
  ) => {
    if (!levelData) return;
    console.log("currentBlockIndex", currentBlockIndex, prevBlockIndex);
    setLevelData((prevData) => {
      if (!prevData) {
        console.log("No previous data");
        return prevData;
      }

      const newData = { ...prevData };

      // Ensure NewPaths[0] exists
      if (!newData.NewPaths || !newData.NewPaths[0]) {
        newData.NewPaths = [
          {
            IndexA: 0,
            IndexB: 0,
            JointA: 0,
            JointB: 0,
            NodesToUnlock: [],
          },
        ];
      }

      const subNodes = [...(newData.NewPaths[0]?.NodesToUnlock || [])];
      const jumpNodes = [false, false, false, false];
      const neighbourNodes = [false, false, false, false];

      // If no previous index, just create a new node
      if (!prevBlockIndex) {
        const currNode = subNodes.find(
          (node) => node.Index === currentBlockIndex
        );

        if (!currNode) {
          subNodes.push({
            Index: currentBlockIndex,
            Paths: [],
            NeighbourNodes: neighbourNodes,
            JumpNodes: jumpNodes,
          });
        }

        newData.NewPaths[0].NodesToUnlock = subNodes;
        return newData;
      }

      // Find the last clicked node index
      const lastClickedIndex = prevBlockIndex;

      // Find or create nodes
      let prevNode = subNodes.find((node) => node.Index === lastClickedIndex);
      let currNode = subNodes.find((node) => node.Index === currentBlockIndex);

      // Get relative position to determine path direction
      let prevRow = -1,
        prevCol = -1,
        currRow = -1,
        currCol = -1;
      NODES.forEach((row, i) => {
        const pIndex = row.indexOf(lastClickedIndex);
        const cIndex = row.indexOf(currentBlockIndex);
        if (pIndex > -1) {
          prevRow = i;
          prevCol = pIndex;
        }
        if (cIndex > -1) {
          currRow = i;
          currCol = cIndex;
        }
      });

      // Determine path direction
      let pathDirection = -1;
      if (currRow === prevRow - 1) pathDirection = 0;
      else if (currCol === prevCol + 1) pathDirection = 1;
      else if (currRow === prevRow + 1) pathDirection = 2;
      else if (currCol === prevCol - 1) pathDirection = 3;

      if (pathDirection === -1) {
        console.log("Invalid path");
        return prevData;
      }

      // Create previous node if it doesn't exist
      if (!prevNode) {
        prevNode = {
          Index: lastClickedIndex,
          Paths: [pathDirection],
          NeighbourNodes: [...neighbourNodes],
          JumpNodes: [...jumpNodes],
        };
        subNodes.push(prevNode);
      } else {
        // Add path to existing node if not already present
        if (!prevNode.Paths.includes(pathDirection)) {
          prevNode.Paths.push(pathDirection);
        }
      }

      // Create current node if it doesn't exist
      if (!currNode) {
        // Calculate opposite direction (0→2, 1→3, 2→0, 3→1)
        const oppositeDirection = (pathDirection + 2) % 4;

        currNode = {
          Index: currentBlockIndex,
          Paths: [oppositeDirection],
          NeighbourNodes: [...neighbourNodes],
          JumpNodes: [...jumpNodes],
        };
        subNodes.push(currNode);
      } else {
        // Add opposite path to current node
        const oppositeDirection = (pathDirection + 2) % 4;
        if (!currNode.Paths.includes(oppositeDirection)) {
          currNode.Paths.push(oppositeDirection);
        }
      }

      newData.NewPaths[0].NodesToUnlock = subNodes;
      return newData;
    });
  };

  const handleAddTrapObject = (blockIndex: number, direction: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };

      // Allow multiple traps to be added
      const trapIndex = isAddingTrap?.index ?? newData.Traps.length;

      // Add a new trap object
      newData.Traps[trapIndex] = {
        TrapObject: {
          Tag: isAddingTrap?.type === "Turret" ? "Turret" : "Wall",
          NodeIndex: blockIndex,
          CustomTransform: {
            position: { x: 0, y: 0, z: 0 },
            eulerAngles: { x: 0, y: direction, z: 0 },
            localScale: { x: 0, y: 0, z: 0 },
          },
        },
        TrapTrigger: {} as TrapTrigger,
        TrapType: isAddingTrap?.type === "Turret" ? "Turret" : "Wall",
        CamPan: false,
      };

      return newData;
    });
  };

  const handleAddTrapTrigger = (blockIndex: number, direction: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };
      if (!newData.Traps.length) {
        alert("No trap object found, add trap first");
        return newData;
      }

      // Use index from isAddingTrap to set the data
      const trapIndex = isAddingTrap?.index;
      if (trapIndex !== undefined && newData.Traps[trapIndex]) {
        newData.Traps[trapIndex].TrapTrigger = {
          Tag:
            isAddingTrap?.type === "Turret" ? "TurretTrigger" : "WallTrigger",
          NodeIndex: blockIndex,
          CustomTransform: {
            position: { x: 0, y: 0, z: 0 },
            eulerAngles: { x: 0, y: direction, z: 0 },
            localScale: { x: 0, y: 0, z: 0 },
          },
        };
      }

      return newData;
    });
  };

  const onAddTrap = (type: "Wall" | "Turret") => {
    if (!isAddingTrap) {
      setIsAddingTrap({ type, index: levelData?.Traps.length || 0 });
    } else {
      if (!levelData?.Traps.length) {
        setIsAddingTrap(null);
        return;
      }
      const incompleteTraps = levelData.Traps.filter(
        (trap) => !trap.TrapObject || !trap.TrapTrigger
      );
      if (!incompleteTraps.length) {
        setIsAddingTrap(null);
        return;
      }
      alert("Complete adding previous trap");
    }
  };

  const handleRemoveBlock = (blockIndex: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;

      const newData = { ...prevData };

      // Remove from SpawnObjects
      const initialSpawnObjectsLength = newData.SpawnObjects.length;
      newData.SpawnObjects = newData.SpawnObjects.filter(
        (obj) => obj.NodeIndex !== blockIndex
      );

      // Remove from Enemies
      const initialEnemiesLength = newData.Enemies.length;
      newData.Enemies = newData.Enemies.filter(
        (enemy) => enemy.Object.NodeIndex !== blockIndex
      );

      // Remove from NewPaths
      const initialNewPathsLength = newData.NewPaths.length;
      newData.NewPaths = newData.NewPaths.filter(
        (path) => path.IndexA !== blockIndex
      );

      // Remove from Traps
      const initialTrapsLength = newData.Traps.length;
      newData.Traps = newData.Traps.filter(
        (trap) => trap.TrapObject?.NodeIndex !== blockIndex
      );

      // Remove from SubNodes only if none of the above were removed
      if (
        newData.SpawnObjects.length === initialSpawnObjectsLength &&
        newData.Enemies.length === initialEnemiesLength &&
        newData.NewPaths.length === initialNewPathsLength &&
        newData.Traps.length === initialTrapsLength
      ) {
        // First, find the node to be removed
        const nodeToRemove = newData.SubNodes.find(
          (subNode) => subNode.Index === blockIndex
        );

        if (nodeToRemove) {
          // Find adjacent nodes and remove paths that connect to this node
          newData.SubNodes.forEach((node) => {
            if (node.Index !== blockIndex) {
              // Get relative position to determine path direction
              let nodeRow = -1,
                nodeCol = -1,
                removeRow = -1,
                removeCol = -1;

              NODES.forEach((row, i) => {
                const nIndex = row.indexOf(node.Index);
                const rIndex = row.indexOf(blockIndex);
                if (nIndex > -1) {
                  nodeRow = i;
                  nodeCol = nIndex;
                }
                if (rIndex > -1) {
                  removeRow = i;
                  removeCol = rIndex;
                }
              });

              // Check if nodes are adjacent and remove the corresponding path
              if (removeRow === nodeRow - 1 && removeCol === nodeCol) {
                // Node to remove is above current node (path 0)
                node.Paths = node.Paths.filter((p) => p !== 0);
              } else if (removeCol === nodeCol + 1 && removeRow === nodeRow) {
                // Node to remove is to the right of current node (path 1)
                node.Paths = node.Paths.filter((p) => p !== 1);
              } else if (removeRow === nodeRow + 1 && removeCol === nodeCol) {
                // Node to remove is below current node (path 2)
                node.Paths = node.Paths.filter((p) => p !== 2);
              } else if (removeCol === nodeCol - 1 && removeRow === nodeRow) {
                // Node to remove is to the left of current node (path 3)
                node.Paths = node.Paths.filter((p) => p !== 3);
              }
            }
          });

          // Finally, remove the node itself
          newData.SubNodes = newData.SubNodes.filter(
            (subNode) => subNode.Index !== blockIndex
          );
        }

        // Also handle NewPaths[0].NodesToUnlock if it exists
        if (newData.NewPaths?.[0]?.NodesToUnlock) {
          // Find the node to be removed
          const newPathNodeToRemove = newData.NewPaths[0].NodesToUnlock.find(
            (subNode) => subNode.Index === blockIndex
          );

          if (newPathNodeToRemove) {
            // Find adjacent nodes and remove paths that connect to this node
            newData.NewPaths[0].NodesToUnlock.forEach((node) => {
              if (node.Index !== blockIndex) {
                // Get relative position to determine path direction
                let nodeRow = -1,
                  nodeCol = -1,
                  removeRow = -1,
                  removeCol = -1;

                NODES.forEach((row, i) => {
                  const nIndex = row.indexOf(node.Index);
                  const rIndex = row.indexOf(blockIndex);
                  if (nIndex > -1) {
                    nodeRow = i;
                    nodeCol = nIndex;
                  }
                  if (rIndex > -1) {
                    removeRow = i;
                    removeCol = rIndex;
                  }
                });

                // Check if nodes are adjacent and remove the corresponding path
                if (removeRow === nodeRow - 1 && removeCol === nodeCol) {
                  // Node to remove is above current node (path 0)
                  node.Paths = node.Paths.filter((p) => p !== 0);
                } else if (removeCol === nodeCol + 1 && removeRow === nodeRow) {
                  // Node to remove is to the right of current node (path 1)
                  node.Paths = node.Paths.filter((p) => p !== 1);
                } else if (removeRow === nodeRow + 1 && removeCol === nodeCol) {
                  // Node to remove is below current node (path 2)
                  node.Paths = node.Paths.filter((p) => p !== 2);
                } else if (removeCol === nodeCol - 1 && removeRow === nodeRow) {
                  // Node to remove is to the left of current node (path 3)
                  node.Paths = node.Paths.filter((p) => p !== 3);
                }
              }
            });

            // Finally, remove the node itself
            newData.NewPaths[0].NodesToUnlock =
              newData.NewPaths[0].NodesToUnlock.filter(
                (subNode) => subNode.Index !== blockIndex
              );
          }
        }
      }

      return newData;
    });
  };

  const handleAddLaser = (blockIndex: number, direction: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };
      newData.SpawnObjects.push({
        Tag: "Turret",
        NodeIndex: blockIndex,
        CustomTransform: {
          position: { x: 0, y: 0, z: 0 },
          eulerAngles: { x: 0, y: direction, z: 0 },
          localScale: { x: 0, y: 0, z: 0 },
        },
      });
      return newData;
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-1">
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold mb-4">Level Generator</h1>
            <div className="flex gap-2 items-center">
              <button
                className={`px-4 py-2 text-white rounded ${
                  isAddingTrap?.type === "Turret" ? "bg-red-800" : "bg-blue-600"
                }`}
                onClick={() => onAddTrap("Turret")}
              >
                Add Turret
              </button>
              <button
                className={`px-4 py-2 text-white rounded ${
                  isAddingTrap?.type === "Wall" ? "bg-red-800" : "bg-blue-600"
                }`}
                onClick={() => onAddTrap("Wall")}
              >
                Add Wall
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={generateJumpNodes}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-red-800 text-white rounded"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
          {levelData && (
            <Grid
              isAddingTrap={isAddingTrap}
              onAddTrapObject={handleAddTrapObject}
              onAddTrapTrigger={handleAddTrapTrigger}
              onAddEnemy={handleAddEnemy}
              onAddPath={handleAddPath}
              onNormalClick={handleRemoveBlock}
              onStartSelect={handleStartSelect}
              onEndSelect={handleEndSelect}
              onAddCageKey={handleAddCageKey}
              onAddCageReward={handleAddCageReward}
              onAddDamageNode={handleAddDamageNode}
              onAddNewPathIndexA={handleAddNewPathIndexA}
              onAddNewPathIndexB={handleAddNewPathIndexB}
              onLaserSelect={handleAddLaser}
              onAddNewPath={handleAddNewPath}
              data={levelData}
            />
          )}
          {levelData && <LevelPreview levelData={levelData} />}
        </div>
        <div className="relative">
          <div className="fixed right-0 top-0 p-2 bg-gray-700 shadow-md flex flex-col  items-start">
            <h4 className="font-bold">Key Instructions</h4>
            <ul className="flex flex-col gap-2 items-start">
              {keyInstructions.map((instruction) => (
                <li key={instruction.key}>
                  <strong>{instruction.key.toUpperCase()}</strong>:{" "}
                  {instruction.action}
                </li>
              ))}
            </ul>
            <h4 className="font-bold mt-2">AABR</h4>
            <ul className="flex flex-col gap-2 items-start">
              {Object.entries(aabr).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}</strong>: {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelConfiguration;
