export const NODES = [
  [
    118, 74, 75, 76, 77, 78, 64, 1, 2, 3, 4, 5, 6, 56, 127, 128, 129, 130, 131,
    172,
  ],
  [
    119, 73, 79, 80, 81, 82, 65, 7, 8, 9, 10, 11, 12, 57, 132, 133, 134, 135,
    136, 178,
  ],
  [
    120, 83, 84, 85, 86, 87, 66, 13, 14, 15, 16, 17, 18, 58, 137, 138, 139, 140,
    141, 173,
  ],
  [
    121, 88, 89, 90, 91, 92, 67, 19, 20, 21, 22, 23, 24, 59, 142, 143, 144, 145,
    146, 175,
  ],
  [
    122, 93, 94, 95, 96, 97, 68, 25, 26, 27, 28, 29, 30, 60, 147, 148, 149, 150,
    151, 176,
  ],
  [
    123, 98, 99, 100, 101, 102, 69, 31, 32, 33, 34, 35, 36, 61, 152, 153, 154,
    155, 156, 179,
  ],
  [
    124, 103, 104, 105, 106, 107, 70, 37, 38, 39, 40, 41, 42, 62, 157, 158, 159,
    160, 161, 180,
  ],
  [
    125, 108, 109, 110, 111, 112, 71, 43, 44, 45, 46, 47, 48, 63, 162, 163, 164,
    165, 166, 201,
  ],
  [
    126, 113, 114, 115, 116, 117, 72, 49, 50, 51, 52, 53, 54, 55, 167, 168, 169,
    170, 171, 177,
  ],
  [
    310, 271, 278, 276, 277, 281, 266, 203, 204, 205, 206, 207, 208, 258, 181,
    317, 316, 318, 319, 359,
  ],
  [
    311, 182, 183, 282, 283, 284, 267, 209, 210, 211, 212, 213, 214, 259, 195,
    320, 321, 322, 323, 354,
  ],
  [
    192, 184, 285, 286, 287, 280, 268, 215, 216, 217, 218, 219, 220, 260, 325,
    324, 326, 327, 196, 202,
  ],
  [
    313, 279, 288, 289, 185, 291, 269, 221, 222, 223, 224, 225, 226, 261, 328,
    329, 330, 331, 332, 355,
  ],
  [
    193, 294, 292, 293, 295, 296, 270, 227, 228, 229, 230, 231, 232, 262, 197,
    334, 333, 337, 335, 356,
  ],
  [
    194, 186, 187, 188, 290, 297, 272, 233, 234, 235, 236, 237, 238, 263, 336,
    338, 339, 198, 340, 357,
  ],
  [
    314, 298, 300, 299, 189, 301, 273, 239, 240, 241, 242, 243, 244, 264, 341,
    342, 199, 343, 344, 358,
  ],
  [
    315, 190, 302, 303, 304, 305, 366, 245, 246, 373, 374, 249, 375, 378, 392,
    345, 346, 200, 348, 360,
  ],
  [
    391, 361, 380, 383, 385, 367, 274, 368, 369, 247, 248, 370, 250, 265, 347,
    381, 384, 379, 394, 400,
  ],
  [
    312, 306, 307, 309, 308, 191, 275, 251, 252, 253, 254, 255, 256, 257, 349,
    350, 351, 352, 353, 393,
  ],
  [
    390, 386, 387, 388, 389, 362, 382, 376, 363, 364, 365, 371, 372, 377, 395,
    396, 397, 398, 399, 174,
  ],
];

export function resetLevelData(levelTag: string) {
  return {
    LevelTag: levelTag,
    NodesPosition: {
      x: 0,
      y: 0,
      z: 0,
    },
    EndGateTransform: {
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      eulerAngles: {
        x: 0,
        y: 0,
        z: 0,
      },
    },
    Props: [],
    SubNodes: [],
    EndNode: 0,
    SpawnObjects: [],
    Traps: [],
    TriggerTraps: [],
    Enemies: [],
    Portals: [],
    NewPaths: [],
    Objectives: [],
    Restrictons: {
      Time: -1,
      Moves: -1,
      EnemyKills: -1,
    },
    Bounds: {
      BoundsX: {
        x: -10,
        y: 10,
      },
      BoundsY: {
        x: 10,
        y: 14.5,
      },
    },
  };
}

export const EULER_ANGLES_Y = {
  right: 180,
  left: 0,
  top: 90,
  bottom: -90,
};

export const aabr = {
  start: "S",
  end: "E",
  enemyStatic: "ES",
  enemyRotating: "ER",
  enemyMoving: "EM",
  enemyStrongMoving: "EMS",
  trap: "T",
  trigger: "TR",
  laser: "L",
  none: "",
  selected: "X",
  key: "K",
  rewardCage: "RC",
  damageNode: "DN",
  newPath: "NP",
  newPathIndexA: "NPA",
  newPathIndexB: "NPB",
};
