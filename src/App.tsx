import { Routes, Route } from "react-router";
import AddJson from "./Pages/add-json";
import NodeConfiguration from "./Pages/node-configuration";
import LevelConfiguration from "./Pages/level-configuration";

export default function App() {
  return (
    <div className="flex flex-col flex-1">
      <Routes>
        <Route path="/" element={<AddJson />} />
        <Route
          path="/node-configuration/:region"
          element={<NodeConfiguration />}
        />
        <Route
          path="/level-configuration/:region/:level"
          element={<LevelConfiguration />}
        />
      </Routes>
    </div>
  );
}
