/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types.ts

export interface TransformWithScale {
  position: {
    x: number;
    y: number;
    z: number;
  };
  eulerAngles: {
    x: number;
    y: number;
    z: number;
  };
  localScale: {
    x: number;
    y: number;
    z: number;
  };
}

export interface Transform {
  position: {
    x: number;
    y: number;
    z: number;
  };
  eulerAngles: {
    x: number;
    y: number;
    z: number;
  };
}

export interface SpawnObject {
  Tag: string; // "Player", "DamageNode", "Key", "RewardCage"
  NodeIndex: number;
  CustomTransform: TransformWithScale;
}

export interface Enemy {
  Object: SpawnObject;
  Type: "Static" | "Rotating" | "Moving" | "StrongMoving";
  Spawnable: boolean;
  RotateAntiClockwise: boolean;
}

export interface TrapObject {
  Tag: string; // "Turret"
  NodeIndex: number;
  CustomTransform: TransformWithScale;
}

export interface TrapTrigger {
  Tag: string; // "TurretTrigger"
  NodeIndex: number;
  CustomTransform: TransformWithScale;
}

export interface Trap {
  TrapObject: TrapObject;
  TrapTrigger: TrapTrigger;
  TrapType: "Wall" | "Turret";
  CamPan: boolean;
}

export interface Objective {
  Type: string;
  Objective: string;
  TargetAmount: number;
}

export interface Restrictons {
  Time: number; // -1 if not applied
  Moves: number; // -1 if not applied
  EnemyKills: number; // -1 if not applied
}

export interface Bounds {
  BoundsX: {
    x: number;
    y: number;
  };
  BoundsY: {
    x: number;
    y: number;
  };
}

export interface SubNode {
  Index: number;
  Paths: number[]; // (0-4) clockwise -> (up-right-bottom-left)
  NeighbourNodes: boolean[]; // (0-4) clockwise (cannotGo Value)
  JumpNodes: boolean[]; // (0-4) clockwise (cannotGo Value)
}

export interface NewPath {
  IndexA: number; // trigger A
  IndexB: number; // trigger B
  JointA: number; // joint A path will be formed from A to B
  JointB: number; // joint B
  NodesToUnlock: SubNode[];
}

export interface Level {
  LevelTag: string; // Level {level number (1-3)}
  NodesPosition: {
    x: number;
    y: number;
    z: number;
  };
  EndGateTransform: Transform;
  Props: Array<{
    propTag: string;
    activeProps: number[];
  }>;
  SubNodes: SubNode[]; // only nodes that will be active from start
  EndNode: number; // node index from sub nodes index
  SpawnObjects: SpawnObject[];
  Traps: Trap[];
  TriggerTraps: any[];
  Enemies: Enemy[];
  Portals: any[];
  NewPaths: NewPath[];
  Objectives: Objective[];
  Restrictons: Restrictons;
  Bounds: Bounds;
}

export interface Node {
  NodeTag: string; // Node {node number (0-x)}
  Levels: Level[];
}

export interface Region {
  Region: "GrassLand" | "LavaLand" | "IceLand" | "StormyLand";
  Nodes: Node[];
}

export interface EnemyData {
  type: string;
  spawnable: boolean;
  rotateAntiClockwise: boolean;
  direction: number;
}
