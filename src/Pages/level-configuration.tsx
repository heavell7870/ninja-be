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
  const [isAddingTrap, setIsAddingTrap] = useState(false);

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
    newData = generateSubNodeForNewPath(newData);
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

      // If no previous index, just create a new node
      if (!prevBlockIndex) {
        const currNode = subNodes.find(
          (node) => node.Index === currentBlockIndex
        );

        if (!currNode) {
          subNodes.push({
            Index: currentBlockIndex,
            Paths: [],
            NeighbourNodes: getNeighbourNodes(currentBlockIndex),
            JumpNodes: jumpNodes,
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
          prevNode.NeighbourNodes = getNeighbourNodes(prevBlockIndex);
        }
      } else {
        subNodes.push({
          Index: prevBlockIndex,
          Paths: [pathDirection],
          NeighbourNodes: getNeighbourNodes(prevBlockIndex),
          JumpNodes: jumpNodes,
        });
      }

      if (!currNode) {
        subNodes.push({
          Index: currentBlockIndex,
          Paths: [],
          NeighbourNodes: getNeighbourNodes(currentBlockIndex),
          JumpNodes: jumpNodes,
        });
      } else {
        currNode.NeighbourNodes = getNeighbourNodes(currentBlockIndex);
      }

      // Update all nodes' NeighbourNodes as they might be affected
      subNodes.forEach((node) => {
        node.NeighbourNodes = getNeighbourNodes(node.Index);
      });

      newData.SubNodes = subNodes;
      return newData;
    });
  };

  const handleNormalClick = (blockIndex: number) => {
    console.log(blockIndex);
  };

  const handleReset = () => {
    setLevelData(resetLevelData(levelData?.LevelTag || ""));
  };

  const handleStartSelect = (blockIndex: number, angle: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };
      newData.SpawnObjects.push({
        Tag: "Player",
        NodeIndex: blockIndex,
        CustomTransform: {
          position: { x: 0, y: 0, z: 0 },
          eulerAngles: { x: 0, y: angle, z: 0 },
          localScale: { x: 0, y: 0, z: 0 },
        },
      });
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
      newData.SpawnObjects.push({
        Tag: "Key",
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

  const handleAddCageReward = (blockIndex: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };
      newData.SpawnObjects.push({
        Tag: "RewardCage",
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
    const exists = levelData?.NewPaths[0].IndexA;
    if (exists) {
      const confirm = window.confirm(
        "A path already exists, click ok to overwrite"
      );
      if (confirm) {
        setLevelData((prevData) => {
          if (!prevData) return prevData;
          const newData = { ...prevData };
          newData.NewPaths[0].IndexA = index;
          newData.NewPaths[0].JointA = index;
          return newData;
        });
      }
    }
  };

  const handleAddNewPathIndexB = (index: number) => {
    const exists = levelData?.NewPaths[0].IndexB;
    if (exists) {
      const confirm = window.confirm(
        "A path already exists, click ok to overwrite"
      );
      if (confirm) {
        setLevelData((prevData) => {
          if (!prevData) return prevData;
          const newData = { ...prevData };
          newData.NewPaths[0].IndexB = index;
          newData.NewPaths[0].JointB = index;
          return newData;
        });
      }
    }
  };

  const handleAddNewPath = (
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
      const subNodes = [...(newData.NewPaths[0]?.NodesToUnlock || [])];
      const jumpNodes = [false, false, false, false];

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

      // If no previous index, just create a new node
      if (!prevBlockIndex) {
        const currNode = subNodes.find(
          (node) => node.Index === currentBlockIndex
        );

        if (!currNode) {
          subNodes.push({
            Index: currentBlockIndex,
            Paths: [],
            NeighbourNodes: getNeighbourNodes(currentBlockIndex),
            JumpNodes: jumpNodes,
          });
        }

        newData.NewPaths[0].NodesToUnlock = subNodes;
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
          prevNode.NeighbourNodes = getNeighbourNodes(prevBlockIndex);
        }
      } else {
        subNodes.push({
          Index: prevBlockIndex,
          Paths: [pathDirection],
          NeighbourNodes: getNeighbourNodes(prevBlockIndex),
          JumpNodes: jumpNodes,
        });
      }

      if (!currNode) {
        subNodes.push({
          Index: currentBlockIndex,
          Paths: [],
          NeighbourNodes: getNeighbourNodes(currentBlockIndex),
          JumpNodes: jumpNodes,
        });
      } else {
        currNode.NeighbourNodes = getNeighbourNodes(currentBlockIndex);
      }

      // Update all nodes' NeighbourNodes as they might be affected
      subNodes.forEach((node) => {
        node.NeighbourNodes = getNeighbourNodes(node.Index);
      });

      newData.NewPaths[0].NodesToUnlock = subNodes;
      return newData;
    });
  };

  const handleAddTrapObject = (blockIndex: number, direction: number) => {
    setLevelData((prevData) => {
      if (!prevData) return prevData;
      const newData = { ...prevData };

      // Only allow one trap to be added
      if (newData.Traps.length > 0) {
        alert("A trap object already exists. Only one trap is allowed.");
        return newData;
      }

      // Add a new trap object
      newData.Traps.push({
        TrapObject: {
          Tag: "Turret",
          NodeIndex: blockIndex,
          CustomTransform: {
            position: { x: 0, y: 0, z: 0 },
            eulerAngles: { x: 0, y: direction, z: 0 },
            localScale: { x: 0, y: 0, z: 0 },
          },
        },
        TrapTrigger: {} as TrapTrigger,
        TrapType: "Turret",
        CamPan: false,
      });

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

      // Add a trigger to the existing trap
      newData.Traps[0].TrapTrigger = {
        Tag: "TurretTrigger",
        NodeIndex: blockIndex,
        CustomTransform: {
          position: { x: 0, y: 0, z: 0 },
          eulerAngles: { x: 0, y: direction, z: 0 },
          localScale: { x: 0, y: 0, z: 0 },
        },
      };

      return newData;
    });
    setIsAddingTrap(false);
  };

  const onAddTrap = () => {
    if (!isAddingTrap) {
      setIsAddingTrap(true);
    } else {
      if (!levelData?.Traps.length) {
        setIsAddingTrap(false);
        return;
      }
      const incompleteTrap = levelData.Traps.find(
        (trap) => !trap.TrapObject || !trap.TrapTrigger
      );
      if (!incompleteTrap) {
        setIsAddingTrap(false);
        return;
      }
      alert("Complete adding trap");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4">Level Generator</h1>
        <button
          className={`px-4 py-2 text-white rounded ${
            isAddingTrap ? "bg-red-800" : "bg-blue-600"
          }`}
          onClick={onAddTrap}
        >
          Add Trap
        </button>
        <button
          className="px-4 py-2 bg-red-800 text-white rounded"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
      {levelData && (
        <Grid
          isAddingTrap={isAddingTrap}
          onAddTrapObject={handleAddTrapObject}
          onAddTrapTrigger={handleAddTrapTrigger}
          onAddEnemy={handleAddEnemy}
          onAddPath={handleAddPath}
          onNormalClick={handleNormalClick}
          onStartSelect={handleStartSelect}
          onEndSelect={handleEndSelect}
          onAddCageKey={handleAddCageKey}
          onAddCageReward={handleAddCageReward}
          onAddDamageNode={handleAddDamageNode}
          onAddNewPathIndexA={handleAddNewPathIndexA}
          onAddNewPathIndexB={handleAddNewPathIndexB}
          onAddNewPath={handleAddNewPath}
          data={levelData}
        />
      )}
      <div className="mt-4 flex flex-col space-y-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={generateJumpNodes}
        >
          Save
        </button>
      </div>
      {levelData && <LevelPreview levelData={levelData} />}
      <div className="fixed right-0 top-0 p-2 bg-gray-700 shadow-md">
        <h4 className="font-bold">Key Instructions</h4>
        <ul>
          {keyInstructions.map((instruction) => (
            <li key={instruction.key}>
              <strong>{instruction.key.toUpperCase()}</strong>:{" "}
              {instruction.action}
            </li>
          ))}
        </ul>
        <h4 className="font-bold mt-2">AABR</h4>
        <ul>
          {Object.entries(aabr).map(([key, value]) => (
            <li key={key}>
              <strong>{key}</strong>: {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LevelConfiguration;
