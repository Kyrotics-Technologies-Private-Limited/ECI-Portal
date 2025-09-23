import axios from "axios";
import { server } from "../main";

export const createFolder = async ({
  projectId,
  folderName,
  parentFolderId = null,
}) => {
  try {
    const response = await axios.post(`${server}/api/folder/createFolder`, {
      projectId,
      folderName,
      parentFolderId,
    });
    return response.data;
  } catch (error) {
    // console.log("create", error);
    console.error("Error creating folder:", error);
    throw error;
  }
};

export const fetchProjectFolders = async (projectId) => {
  try {
    const response = await axios.get(
      `${server}/api/folder/getAllFolders/${projectId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw error;
  }
};
