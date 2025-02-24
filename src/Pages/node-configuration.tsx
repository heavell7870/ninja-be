import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useData } from "../hooks/data";
import { resetLevelData } from "../constants";

const NodeConfiguration: React.FC = () => {
  const { region } = useParams();
  const { data, setData } = useData();
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      const node = data.Nodes.find((n) => n.NodeTag === region);
      if (node) {
        const levelTags = node.Levels.map((level) => level.LevelTag);
        setAvailableLevels(levelTags);
      }
    }
  }, [data, region]);

  const handleAddLevel = () => {
    if (!data || !region) return;

    const updatedData = { ...data };
    const nodeIndex = updatedData.Nodes.findIndex((n) => n.NodeTag === region);

    if (nodeIndex === -1) return;

    const currentLevels = updatedData.Nodes[nodeIndex].Levels;
    const highestNumber = currentLevels.reduce((highest, level) => {
      const match = level.LevelTag.match(/Level (\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num > highest ? num : highest;
      }
      return highest;
    }, 0);

    const newLevel = resetLevelData(`Level ${highestNumber + 1}`);

    updatedData.Nodes[nodeIndex].Levels.push(newLevel);
    setData(updatedData);
    setAvailableLevels([...availableLevels, newLevel.LevelTag]);
    setSelectedLevel(newLevel.LevelTag);
    setError("");
  };

  const handleNext = () => {
    if (!region) {
      setError("Please select a region first, go back and select a node");
      return;
    }
    if (!selectedLevel) {
      setError("Please select a level first");
      return;
    }
    navigate(
      `/level-configuration/${encodeURIComponent(region)}/${encodeURIComponent(
        selectedLevel
      )}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-sm font-bold mb-6 text-center text-white">
          Level Configuration for {region}
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a level...</option>
              {availableLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center text-gray-200">OR</div>

          <div>
            <button
              type="button"
              onClick={handleAddLevel}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add New Level
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="button"
            onClick={handleNext}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeConfiguration;
