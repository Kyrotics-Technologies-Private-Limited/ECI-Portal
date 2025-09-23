import axios from "axios";
import { server } from "../main";

// Log a revert action
export const logRevertAction = async (
  projectId,
  fileId,
  userId,
  reason,
) => {


  const response = await axios.post(`${server}/api/track/revert`, {
    projectId,
    fileId,
    userId,
    reason,
  });
  return response.data;
};

// Fetch revert history for a project or specific file
export const fetchRevertHistory = async ({ projectId, fileId }) => {
  const params = { projectId };
  if (fileId) params.fileId = fileId;
  const response = await axios.get(`${server}/api/track/revert-history`, {
    params,
  });
  return response.data;
};

// Record file submission details
export const recordFileSubmission = async ({
  projectId,
  documentId,
  userId,
  userName,
  fileName,
  fileUrl,
  companyId,
}) => {
  const response = await axios.post(`${server}/api/track/file-submission`, {
    projectId,
    documentId,
    userId,
    userName,
    fileName,
    fileUrl,
    companyId,
  });
  return response.data;
};

// Fetch submission history for a document
export const fetchSubmissionHistory = async ({ projectId, documentId }) => {
  const params = { projectId, documentId };
  const response = await axios.get(
    `${server}/api/track/file-submission-history`,
    { params }
  );
  return response.data;
};
