import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { EULER_ANGLES_Y } from "../constants";
import { SpawnObject } from "../types";

interface AddLaserModalProps {
  isOpen: boolean;
  onClose: () => void;
  spawnObject?: SpawnObject;
  onSubmit: (direction: number) => void;
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

export const AddLaserModal: React.FC<AddLaserModalProps> = ({
  isOpen,
  onClose,
  spawnObject,
  onSubmit,
}) => {
  const [direction, setDirection] = useState<number>(0);

  useEffect(() => {
    if (spawnObject) {
      setDirection(spawnObject.CustomTransform?.eulerAngles?.y);
    }
  }, [spawnObject]);

  const handleDirectionSelect = (direction: number) => {
    onSubmit(direction);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Select Laser Direction"
    >
      <h2 className="text-xl font-bold mb-4 text-gray-100">
        Select Laser Direction
      </h2>
      <div className="grid grid-cols-3 gap-2 w-48 mx-auto mb-4">
        <div className="col-start-2">
          <button
            onClick={() => handleDirectionSelect(EULER_ANGLES_Y.top)}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              direction === EULER_ANGLES_Y.top ? "bg-blue-700" : ""
            }`}
          >
            ↑
          </button>
        </div>
        <div className="col-start-1">
          <button
            onClick={() => handleDirectionSelect(EULER_ANGLES_Y.left)}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              direction === EULER_ANGLES_Y.left ? "bg-blue-700" : ""
            }`}
          >
            ←
          </button>
        </div>
        <div className="col-start-3">
          <button
            onClick={() => handleDirectionSelect(EULER_ANGLES_Y.right)}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              direction === EULER_ANGLES_Y.right ? "bg-blue-700" : ""
            }`}
          >
            →
          </button>
        </div>
        <div className="col-start-2">
          <button
            onClick={() => handleDirectionSelect(EULER_ANGLES_Y.bottom)}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              direction === EULER_ANGLES_Y.bottom ? "bg-blue-700" : ""
            }`}
          >
            ↓
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};
