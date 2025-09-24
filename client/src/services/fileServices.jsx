// // //status notation
// // //0-->client End for delete //1-->Ml
// // //(KyroticsSide) 2-->Ready-for-work//3-->Assigned to User//4-->completed
// // //(ClientSide)4-->Ready-for-work//5-->Assigned to User//6-->completed //7-->Downloaded

import { db } from "../utils/firebase";
import { PDFDocument } from "pdf-lib";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  runTransaction,
} from "firebase/firestore";

import { formatDate, fetchServerTimestamp } from "../utils/formatDate";

import axios from "axios";
import { auth } from "../utils/firebase";
import { server } from "../main";

// --- File Operations ---

async function getIdTokenHeader() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const idToken = await user.getIdToken();
  return { Authorization: `Bearer ${idToken}` };
}

export const uploadFile = async (projectId, file, folderId = null) => {
  try {
    // Step 1: Get a server timestamp & format the date (e.g., "YYYY-MM-DD")
    const serverDate = await fetchServerTimestamp();
    const formattedDate = formatDate(serverDate);

    // Step 2: Get a signed URL from your backend
    const response = await fetch(`${server}/generateSignedUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, fileName: file.name }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to get signed URL: ${response.status} - ${errorText}`
      );
      throw new Error("Failed to get signed URL");
    }

    // The backend should return { signedUrl, filePath }
    const { signedUrl, filePath } = await response.json();
    if (!signedUrl || !filePath) {
      throw new Error("Invalid signed URL or file path from backend");
    }

    // Step 3: Upload the file to GCS using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to GCS");
    }

    // Step 4: Read the file as a PDF to determine number of pages
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();

    // Step 5: Store file metadata in Firestore under the project's files subcollection
    const filesCollectionRef = collection(db, "projects", projectId, "files");
    const fileDocRef = await addDoc(filesCollectionRef, {
      name: file.name,
      pdfUrl: filePath,
      uploadedDate: formattedDate,
      status: 0,
      projectId: projectId,
      pageCount: pageCount,
      folderId: folderId || null, // <-- NEW field for folder nesting
    });

    // Return the file data (helpful for updating the UI)
    return {
      id: fileDocRef.id,
      name: file.name,
      pdfUrl: filePath,
      uploadedDate: formattedDate,
      status: 0,
      pageCount: pageCount,
      folderId: folderId || null,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Error uploading file");
  }
};

export const deleteFile = async (projectId, fileId, fileName) => {
  try {
    // Make a request to your backend to delete the file from GCS
    const response = await fetch(`${server}/api/document/deleteFile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId, fileName }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete file from GCS");
    }

    // Continue to delete file metadata from Firestore
    const fileRef = doc(db, "projects", projectId, "files", fileId);
    await deleteDoc(fileRef);

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Error deleting file");
  }
};

export const fetchFileNameById = async (projectId, fileId) => {
  try {
    const fileDocRef = doc(db, "projects", projectId, "files", fileId);
    const fileDoc = await getDoc(fileDocRef);

    if (fileDoc.exists()) {
      const data = fileDoc.data();
      // console.log("File data:", data);
      return data.name ? data.name : null; // Return the file name or null if it doesn't exist
    } else {
      console.error("No such file document exists!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching file name by ID:", error.message);
    throw new Error(
      `Error fetching file name for projectId: ${projectId}, fileId: ${fileId}`
    );
  }
};

export const updateFileStatus = async (projectId, fileId, updates) => {
  try {
    const fileRef = doc(db, "projects", projectId, "files", fileId);
    await updateDoc(fileRef, updates);
  } catch (error) {
    console.error("Error updating file status:", error);
    throw new Error("Error updating file status:", error);
  }
};

export const updateFileStatusNumber = async (projectId, fileId, status) => {
  try {
    const fileRef = doc(db, "projects", projectId, "files", fileId);
    await updateDoc(fileRef, { status });
  } catch (error) {
    console.error("Error updating file status:", error);
    throw new Error("Error updating file status:", error);
  }
};

export const fetchDocumentUrl = async (projectId, fileId) => {
  try {
    // Step 1: Fetch the file paths from Firestore
    const fileDocRef = doc(db, "projects", projectId, "files", fileId);
    const fileDoc = await getDoc(fileDocRef);

    if (!fileDoc.exists()) {
      throw new Error("File does not exist");
    }

    const data = fileDoc.data();
    let fileName = data.name;
    fileName = fileName.replace(/\.pdf$/i, "");

    // Step 2: Request new signed URLs from the backend
    const responsePdf = await fetch(`${server}/generateReadSignedUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, fileName, fileType: "pdf" }), // Include fileType to specify it's a PDF
    });

    if (!responsePdf.ok) {
      throw new Error("Failed to generate PDF signed URL");
    }

    const { signedUrl: pdfSignedUrl } = await responsePdf.json();

    const responseCSV = await fetch(`${server}/generateReadSignedUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, fileName, fileType: "csv" }), // Include fileType to specify it's an HTML file
    });

    if (!responseCSV.ok) {
      throw new Error("Failed to generate HTML signed URL");
    }

    const { signedUrl: csvSignedUrl } = await responseCSV.json();

    console.log("csvurl", csvSignedUrl);

    // console.log("pdfurl", pdfSignedUrl, csvSignedUrl);

    // Return both signed URLs
    return {
      pdfUrl: pdfSignedUrl,
      csvUrl: csvSignedUrl,
    };
  } catch (error) {
    console.error("Error fetching document URLs:", error);
    throw new Error("Error fetching document URLs");
  }
};

export const updateDocumentContent = async (
  projectId,
  fileId,
  newCsvBlob
) => {
  try {
    // Step 1: Request the signed URL for the update
    const signedUrlResponse = await fetch(
      `${server}/api/document/generateSignedUrlForCsvUpdate`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, fileId }),
      }
    );

    if (!signedUrlResponse.ok) {
      throw new Error("Failed to generate signed URL");
    }

    const { signedUrl, gcsFilePath } = await signedUrlResponse.json();

    // Step 2: Upload the new CSV content to the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "text/csv",
      },
      body: newCsvBlob, // The CSV content to be updated
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload new CSV content");
    }

    // Return the canonical path where the CSV was saved
    return gcsFilePath;
  } catch (error) {
    console.error("Error updating CSV content:", error);
    throw error;
  }
};

export async function fetchUserWIPCount() {
  const headers = await getIdTokenHeader();
  const response = await axios.get(`${server}/api/project/user-wip-count`, {
    headers,
  });

  // console.log("WIP count response:", response.data);
  return response.data.count;
}

/**
 * Fetch all "In Progress" files assigned to the current user.
 */
export async function fetchInProgressFiles() {
  const headers = await getIdTokenHeader();
  const resp = await axios.get(`${server}/api/project/files/inProgress`, {
    headers,
  });
  // resp.data should be an array of file objects
  return resp.data;
}

/**
 * Fetch all "Completed" files assigned to the current user.
 */
export async function fetchCompletedFiles() {
  const headers = await getIdTokenHeader();
  const resp = await axios.get(`${server}/api/project/files/completed`, {
    headers,
  });
  // resp.data should be an array of file objects
  return resp.data;
}

export async function fetchClientInProgressFiles() {
  const headers = await getIdTokenHeader();
  const resp = await axios.get(`${server}/api/project/files/ClientInProgress`, {
    headers,
  });
  // resp.data should be an array of file objects
  return resp.data;
}

/**
 * Fetch all "Completed" files assigned to the current user.
 */
export async function fetchClientCompletedFiles() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const idToken = await user.getIdToken();
  const resp = await axios.get(`${server}/api/project/files/ClientCompleted`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  // resp.data should be an array of file objects
  return resp.data;
}

/**
 * Fetch user's project‐count metrics (pending/underReview/completed).
 *
 * @param {Date} startDate - JS Date for earliest kyro_completedDate (inclusive)
 * @param {Date} endDate - JS Date for latest kyro_completedDate (inclusive)
 * @returns Promise<{
 *   pendingCount: string,
 *   completedCount: string,
 *   underReviewCount: string,
 *   pendingPages: string,
 *   completedPages: string,
 *   underReviewPages: string
 * }>
 */
export async function fetchUserFileCount(startDate, endDate) {
  const headers = await getIdTokenHeader();
  // Convert JS Date → ISO string
  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();

  const resp = await axios.get(`${server}/api/project/user/fileCount`, {
    headers,
    params: {
      startDate: startISO,
      endDate: endISO,
    },
  });

  return resp.data;
}

// Assignment-specific update (with status check)
export const assignFileToUser = async (projectId, fileId, updates) => {
  const fileRef = doc(db, "projects", projectId, "files", fileId);
  try {
    await runTransaction(db, async (transaction) => {
      const fileDoc = await transaction.get(fileRef);
      if (!fileDoc.exists()) {
        throw new Error("File does not exist");
      }
      const fileData = fileDoc.data();
      if (fileData.status !== 2) {
        throw new Error("File is already assigned");
      }
      transaction.update(fileRef, updates);
    });
  } catch (error) {
    console.error("Error assigning file:", error);
    throw new Error(error.message || "Error assigning file");
  }
};
