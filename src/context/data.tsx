import { useState, createContext, useMemo, useCallback } from "react";
import { Region } from "../types";
import { updateNinja } from "../services";

export type DataContextProps = {
  data: Region | undefined;
  setData: React.Dispatch<React.SetStateAction<Region | undefined>>;
};

type DataProviderProps = { children: React.ReactNode };
// Create a DataContext to hold the state
export const DataContext = createContext({} as DataContextProps);

// Provider component to wrap your app and provide the state
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<Region>();

  const saveData = useCallback(async (newData: Region | undefined) => {
    if (newData) {
      try {
        await updateNinja(newData.Region, newData);
      } catch (error) {
        console.error("Failed to update ninja data:", error);
      }
    }
  }, []);

  const setDataAndSave = useCallback(
    (newData: React.SetStateAction<Region | undefined>) => {
      setData((prevData) => {
        const updatedData =
          typeof newData === "function" ? newData(prevData) : newData;
        saveData(updatedData);
        return updatedData;
      });
    },
    [saveData]
  );

  const contextValue = useMemo(
    () => ({
      data,
      setData: setDataAndSave,
    }),
    [data, setDataAndSave]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};
