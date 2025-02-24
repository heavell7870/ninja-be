import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useData } from "../hooks/data";
import { getNinjas } from "../services";
import { Node, Region } from "../types";

const AddJson: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [regionData, setRegionData] = useState<Region[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableNodes, setAvailableNodes] = useState<string[]>([]);
  const navigate = useNavigate();
  const { setData, data } = useData();

  useEffect(() => {
    const fetchNinjas = async () => {
      try {
        const ninjasData = await getNinjas();
        setRegionData(ninjasData);
        const regionList = ninjasData.map((region: Region) => region.Region);
        setAvailableRegions(regionList);
      } catch (err) {
        console.error("Error fetching ninjas:", err);
        setError("Failed to fetch ninjas data");
      }
    };

    fetchNinjas();
  }, []);

  useEffect(() => {
    if (selectedRegion && regionData) {
      const regionDataMap = regionData.find(
        (region: Region) => region.Region === selectedRegion
      );
      if (regionDataMap) {
        setData(regionDataMap);
      }
    }
  }, [selectedRegion, regionData, setData]);

  useEffect(() => {
    if (selectedRegion && regionData) {
      const regionDataMap = regionData.find(
        (region: Region) => region.Region === selectedRegion
      );
      if (regionDataMap) {
        const nodeList = regionDataMap.Nodes.map((node: Node) => node.NodeTag);
        setAvailableNodes(nodeList);
      }
    }
  }, [selectedRegion, regionData]);

  const handleAddNode = () => {
    if (!data || !selectedRegion) return;

    const regionDataMap = regionData.find(
      (region: Region) => region.Region === selectedRegion
    );
    if (!regionDataMap) return;

    const currentNodes = regionDataMap.Nodes;
    const highestNumber = currentNodes.reduce((highest, node) => {
      const match = node.NodeTag.match(/Node (\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num > highest ? num : highest;
      }
      return highest;
    }, 0);

    const newNodeTag = `Node ${highestNumber + 1}`;
    const newNode = {
      NodeTag: newNodeTag,
      NodeId: currentNodes.length + 1,
      Levels: [],
    };

    regionDataMap.Nodes.push(newNode);

    setData(regionDataMap);
    setAvailableNodes([...availableNodes, newNodeTag]);
    setSelectedNode(newNodeTag);
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedRegion) {
      setError("Please select a region");
      return;
    }

    if (!selectedNode) {
      setError("Please select a node");
      return;
    }

    navigate(`/node-configuration/${encodeURIComponent(selectedNode)}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-6 text-center text-white">
          Add Level Configuration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {availableRegions && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Select Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a region...</option>
                  {availableRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRegion && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Select Node
                    </label>
                    <select
                      value={selectedNode}
                      onChange={(e) => setSelectedNode(e.target.value)}
                      className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a node...</option>
                      {availableNodes.map((node) => (
                        <option key={node} value={node}>
                          {node}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-center text-gray-200"> OR</div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddNode}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Add New Node
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJson;
