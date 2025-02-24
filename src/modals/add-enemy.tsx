import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Enemy } from "../types";
import { EULER_ANGLES_Y } from "../constants";

interface AddEnemyModalProps {
  isOpen: boolean;
  enemyData?: Enemy;
  onClose: () => void;
  onSubmit: (enemyData: {
    type: string;
    spawnable: boolean;
    rotateAntiClockwise: boolean;
    direction: number;
  }) => void;
}

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#1f2937", // Dark background
    padding: "20px",
    borderRadius: "8px",
    minWidth: "300px",
    border: "1px solid #374151", // Dark border
    color: "#f3f4f6", // Light text
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)", // Dark overlay
    zIndex: 1000,
  },
};

Modal.setAppElement("#root");

export const AddEnemyModal: React.FC<AddEnemyModalProps> = ({
  isOpen,
  enemyData,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<string>("Static");
  const [spawnable, setSpawnable] = useState<boolean>(true);
  const [rotateAntiClockwise, setRotateAntiClockwise] =
    useState<boolean>(false);
  const [direction, setDirection] = useState<number>(0);

  useEffect(() => {
    if (enemyData) {
      setType(enemyData.Type);
      setSpawnable(enemyData.Spawnable);
      setRotateAntiClockwise(enemyData.RotateAntiClockwise);
    }
  }, [enemyData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate type
    if (
      !["Static", "Rotating", "Moving", "StrongMoving", "Laser"].includes(type)
    ) {
      alert("Invalid enemy type");
      return;
    }

    // Only allow rotateAntiClockwise for Rotating type
    const validatedRotateAntiClockwise =
      type === "Rotating" ? rotateAntiClockwise : false;

    onSubmit({
      type,
      spawnable,
      rotateAntiClockwise: validatedRotateAntiClockwise,
      direction,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Add Enemy Modal"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-100">
        {enemyData ? "Edit Enemy" : "Add Enemy"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2 text-gray-200">
            Type:
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded bg-gray-700 text-gray-100 border-gray-600"
            >
              <option value="Static">Static</option>
              <option value="Rotating">Rotating</option>
              <option value="Moving">Moving</option>
              <option value="StrongMoving">Strong Moving</option>
              <option value="Laser">Laser</option>
            </select>
          </label>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-200">Direction:</label>
          <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
            <div className="col-start-2">
              <button
                type="button"
                onClick={() => setDirection(EULER_ANGLES_Y.top)}
                className={`w-full px-4 py-2 ${
                  direction === EULER_ANGLES_Y.top
                    ? "bg-blue-700"
                    : "bg-blue-400"
                } text-white rounded hover:bg-blue-700`}
              >
                ↑
              </button>
            </div>
            <div className="col-start-1">
              <button
                type="button"
                onClick={() => setDirection(EULER_ANGLES_Y.left)}
                className={`w-full px-4 py-2 ${
                  direction === EULER_ANGLES_Y.left
                    ? "bg-blue-700"
                    : "bg-blue-400"
                } text-white rounded hover:bg-blue-700`}
              >
                ←
              </button>
            </div>
            <div className="col-start-3">
              <button
                type="button"
                onClick={() => setDirection(EULER_ANGLES_Y.right)}
                className={`w-full px-4 py-2 ${
                  direction === EULER_ANGLES_Y.right
                    ? "bg-blue-700"
                    : "bg-blue-400"
                } text-white rounded hover:bg-blue-700`}
              >
                →
              </button>
            </div>
            <div className="col-start-2">
              <button
                type="button"
                onClick={() => setDirection(EULER_ANGLES_Y.bottom)}
                className={`w-full px-4 py-2 ${
                  direction === EULER_ANGLES_Y.bottom
                    ? "bg-blue-700"
                    : "bg-blue-400"
                } text-white rounded hover:bg-blue-700`}
              >
                ↓
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center text-gray-200">
            <input
              type="checkbox"
              checked={spawnable}
              onChange={(e) => setSpawnable(e.target.checked)}
              className="mr-2 bg-gray-700 border-gray-600"
            />
            Spawnable
          </label>
        </div>

        {type === "Rotating" && (
          <div className="mb-4">
            <label className="flex items-center text-gray-200">
              <input
                type="checkbox"
                checked={rotateAntiClockwise}
                onChange={(e) => setRotateAntiClockwise(e.target.checked)}
                className="mr-2 bg-gray-700 border-gray-600"
              />
              Rotate Anti-Clockwise
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {enemyData ? "Update Enemy" : "Add Enemy"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
