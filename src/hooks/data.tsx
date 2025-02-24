import { useContext } from "react";
import { DataContext } from "../context/data";

export const useData = () => useContext(DataContext);
