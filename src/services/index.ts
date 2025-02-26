import axios from "axios";
import { Region } from "../types";

const apiClient = axios.create({
  baseURL: "http://localhost:3003",
  //baseURL: "https://closet.sochil.io", // Replace with your actual API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export const createNinja = async (ninjaData: Region) => {
  try {
    const response = await apiClient.post("/ninja", ninjaData);
    return response.data;
  } catch (error) {
    console.error("Error creating ninja:", error);
    throw error;
  }
};

export const getNinjas = async () => {
  try {
    const response = await apiClient.get("/ninja");
    return response.data;
  } catch (error) {
    console.error("Error fetching ninjas:", error);
    throw error;
  }
};

export const updateNinja = async (region: string, ninjaData: Region) => {
  try {
    const response = await apiClient.patch(`/ninja/${region}`, ninjaData);
    return response.data;
  } catch (error) {
    console.error("Error updating ninja:", error);
    throw error;
  }
};
