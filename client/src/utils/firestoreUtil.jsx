// // //status notation
// // //0-->client End for delete //1-->Ml
// // //(KyroticsSide) 2-->Ready-for-work//3-->Assigned to User//4-->completed
// // //(ClientSide)4-->Ready-for-work//5-->Assigned to User//6-->completed //7-->Downloaded

import { db, storage } from "./firebase";
import { PDFDocument } from "pdf-lib";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { formatDate } from "./formatDate";
import { parse } from "date-fns";
import { server } from "../main";
import JSZip from "jszip";
import PizZip from "pizzip";
// import Docxtemplater from "docxtemplater";

// --- File Operations ---

export const uploadFile = async (projectId, file) => {
  try {
    // Upload the PDF file to Firebase Storage
    const pdfStorageRef = ref(storage, `projects/${projectId}/${file.name}`);
    const pdfSnapshot = await uploadBytes(pdfStorageRef, file);
    const pdfDownloadURL = await getDownloadURL(pdfSnapshot.ref);

    // Convert PDF file to ArrayBuffer to read the number of pages
    const arrayBuffer = await file.arrayBuffer();
    // console.log('ArrayBuffer length:', arrayBuffer.byteLength); // Log the ArrayBuffer length

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    console.log("Page count:", pageCount); // Log the page count

    // No HTML companion file anymore

    // Add file metadata to Firestore
    const fileRef = await addDoc(
      collection(db, "projects", projectId, "files"),
      {
        name: file.name,
        pdfUrl: pdfDownloadURL,
        // htmlUrl removed
        uploadedDate: formatDate(new Date()),
        status: 0,
        projectId: projectId,
        pageCount: pageCount, // Store the number of pages
      }
    );

    return {
      id: fileRef.id,
      name: file.name,
      pdfUrl: pdfDownloadURL,
      // htmlUrl removed
      uploadedDate: formatDate(new Date()),
      status: 0,
      pageCount: pageCount, // Include the number of pages in the return object
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Error uploading file");
  }
};

// Delete a file from a specific project
export const deleteFile = async (projectId, fileId, fileName) => {
  try {
    const pdfStorageRef = ref(storage, `projects/${projectId}/${fileName}`);
    await deleteObject(pdfStorageRef);

    // Also delete CSV companion if exists
    const csvFileName = fileName.replace(/\.pdf$/i, ".csv");
    const csvStorageRef = ref(storage, `projects/${projectId}/${csvFileName}`);
    await deleteObject(csvStorageRef).catch(() => {});

    const fileRef = doc(db, "projects", projectId, "files", fileId);
    await deleteDoc(fileRef);

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Error deleting file");
  }
};

export const exportFiles = async (projectId, fileId, fileName, format) => {
  try {
    // Get the PDF and CSV URLs
    const pdfUrl = await getDownloadURL(
      ref(storage, `projects/${projectId}/${fileName}`)
    );
    const csvFileName = fileName.replace(/\.pdf$/i, ".csv");
    const csvUrl = await getDownloadURL(
      ref(storage, `projects/${projectId}/${csvFileName}`)
    );

    // Fetch the files
    const [pdfBlob, csvBlob] = await Promise.all([
      fetch(pdfUrl).then((res) => res.blob()),
      fetch(csvUrl).then((res) => res.blob()),
    ]);

    // Create a zip file containing original PDF and CSV
    const zip = new JSZip();
    zip.file(`${fileName}`, pdfBlob);
    zip.file(`${csvFileName}`, csvBlob);

    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Trigger download
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.pdf$/i, "")}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting files:", error);
    throw new Error("Error exporting files");
  }
};

// Fetch files for a specific project
export const fetchProjectFiles = async (projectId) => {
  try {
    const filesCollection = collection(db, "projects", projectId, "files");
    const filesSnapshot = await getDocs(filesCollection);

    // return filesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const files = filesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        pdfUrl: data.pdfUrl,
        htmlUrl: data.htmlUrl,
        pageCount: data.pageCount,
        projectId: projectId,
        status: data.status,

        uploadedDate: data.uploadedDate ? data.uploadedDate : null,
        kyro_assignedDate: data.kyro_assignedDate
          ? data.kyro_assignedDate
          : null,
        kyro_completedDate: data.kyro_completedDate
          ? data.kyro_completedDate
          : null,
        kyro_deliveredDate: data.kyro_deliveredDate
          ? data.kyro_deliveredDate
          : null,

        // client_uploadedDate: data.client_uploadedDate ? data.client_uploadedDate : null,
        client_assignedDate: data.client_assignedDate
          ? data.client_assignedDate
          : null,
        client_completedDate: data.client_completedDate
          ? data.client_completedDate
          : null,

        client_downloadedDate: data.client_downloadedDate
          ? data.client_downloadedDate
          : null,

        kyro_assignedTo: data.kyro_assignedTo || null,
        client_assignedTo: data.client_assignedTo || null,
      };
    });

    return files;
  } catch (error) {
    console.error("Error fetching project files:", error);
    throw new Error("Error fetching project files");
  }
};

// Fetch document URLs for a specific file
// export const fetchDocumentUrl = async (projectId, fileId) => {
//   try {
//     const fileDocRef = doc(db, "projects", projectId, "files", fileId);
//     const fileDoc = await getDoc(fileDocRef);

//     if (fileDoc.exists()) {
//       const data = fileDoc.data();
//       return {
//         pdfUrl: data.pdfUrl,
//         htmlUrl: data.htmlUrl,
//       };
//     } else {
//       throw new Error("File does not exist");
//     }
//   } catch (error) {
//     console.error("Error fetching document URLs:", error);
//     throw new Error("Error fetching document URLs");
//   }
// };
export const fetchDocumentUrl = async (projectId, fileId) => {
  try {
    // Step 1: Fetch the file path from Firestore
    const fileDocRef = doc(db, "projects", projectId, "files", fileId);
    const fileDoc = await getDoc(fileDocRef);

    if (!fileDoc.exists()) {
      throw new Error("File does not exist");
    }

    const data = fileDoc.data();
    const filePath = data.pdfUrl; // Assuming 'pdfUrl' contains the actual file path in GCS

    // Step 2: Request a new signed URL from the backend
    const response = await fetch(`${server}/generateSignedReadUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath }), // Send the file path to the backend
    });

    if (!response.ok) {
      throw new Error("Failed to generate signed URL");
    }

    const { signedUrl } = await response.json(); // Get the new signed URL from the backend
    console.log(signedUrl);
    return {
      pdfUrl: signedUrl, // Return the new signed URL
    };
  } catch (error) {
    console.error("Error fetching document URL:", error);
    throw new Error("Error fetching document URL");
  }
};

// Update the status of a specific file
// export const updateFileStatus = async (projectId, fileId, status, userId) => {
//   try {
//     const fileRef = doc(db, 'projects', projectId, 'files', fileId);
//     await updateDoc(fileRef, { status, cl_assignedTo: userId });
//   } catch (error) {
//     console.error('Error updating file status:', error);
//     throw new Error('Error updating file status:', error);
//   }
// };

// export const updateKyroFileStatus = async (projectId, fileId, status, userId) => {
//   try {
//     const fileRef = doc(db, 'projects', projectId, 'files', fileId);
//     await updateDoc(fileRef, { status, ky_assignedTo: userId });
//   } catch (error) {
//     console.error('Error updating file status:', error);
//     throw new Error('Error updating file status:', error);
//   }
// };

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

// Fetch files by status for a specific project
export const fetchFilesByStatus = async (status, projectId) => {
  try {
    const q = query(
      collection(db, "projects", projectId, "files"),
      where("status", "==", status)
    );
    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return files;
  } catch (error) {
    console.error(
      `Error fetching files by status ${status} for project ${projectId}:`,
      error
    );
    throw new Error(
      `Error fetching files by status ${status} for project ${projectId}`
    );
  }
};
export const fetchTotalPagesInProject = async (status, projectId) => {
  try {
    const q = query(
      collection(db, "projects", projectId, "files"),
      where("status", "==", status)
    );
    const filesSnapshot = await getDocs(q);

    let totalPages = 0;
    filesSnapshot.forEach((doc) => {
      const data = doc.data();
      totalPages += data.pageCount || 0; // Safeguard against undefined pageCount
    });

    return totalPages;
  } catch (error) {
    console.error(
      `Error fetching total pages in project with status ${status}:`,
      error
    );
    throw new Error("Error fetching total pages in project");
  }
};

export const fetchProjectFilesCount = async (status, projectId) => {
  try {
    const q = query(
      collection(db, "projects", projectId, "files"),
      where("status", "==", status)
    );
    const filesSnapshot = await getDocs(q);
    const fileCount = filesSnapshot.size; // The 'size' property gives the number of documents in the snapshot
    return fileCount;
  } catch (error) {
    console.error(
      `Error fetching project files count with status ${status}:`,
      error
    );
    throw new Error("Error fetching project files count");
  }
};

// --- Project Operations ---

// Fetch all projects
export const fetchAllProjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Error fetching projects");
  }
};

export const fetchProjectFilesByDate = async (
  projectId,
  startDate,
  endDate
) => {
  try {
    const q = query(
      collection(db, "projects", projectId, "files"),
      where("uploadedDate", ">=", startDate),
      where("uploadedDate", "<=", endDate)
    );
    const filesSnapshot = await getDocs(q);
    const files = filesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return files;
  } catch (error) {
    console.error("Error fetching project files by date:", error);
    throw new Error("Error fetching project files by date");
  }
};

// Fetch all projects for a specific company
export const fetchCompanyProjects = async (companyId) => {
  try {
    const projectsQuery = query(
      collection(db, "projects"),
      where("companyId", "==", companyId)
    );
    const projectsSnapshot = await getDocs(projectsQuery);
    const projects = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Error fetching projects");
  }
};

// Fetch all projects
export const fetchProjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error); // Detailed logging
    throw new Error("Error fetching projects");
  }
};

// Fetch projects for multiple companies
export const fetchProjectsForCompanies = async (companyIds) => {
  try {
    const allProjects = await Promise.all(
      companyIds.map(async (companyId) => {
        const companyProjects = await fetchCompanyProjects(companyId);
        return companyProjects;
      })
    );
    return allProjects.flat();
  } catch (error) {
    console.error("Error fetching projects for companies:", error);
    throw new Error("Error fetching projects for companies");
  }
};

// Fetch the name of a specific project
export const fetchProjectName = async (projectId) => {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    const projectDoc = await getDoc(projectDocRef);
    if (projectDoc.exists()) {
      return projectDoc.data().name;
    } else {
      throw new Error("Project does not exist");
    }
  } catch (error) {
    console.error("Error fetching project name:", error);
    throw new Error("Error fetching project name");
  }
};

// Fetch project details including file counts and statuses

export const fetchProjectDetails = async (companyId) => {
  try {
    const projects = await fetchCompanyProjects(companyId);
    const projectDetails = await Promise.all(
      projects.map(async (project) => {
        const files = await fetchProjectFiles(project.id);
        const totalFiles = files.length;
        const completedFiles = files.filter((file) => file.status >= 5).length;
        // const completedFileCount = completedFiles.length;
        const readyForWorkFiles = files.filter(
          (file) => file.status == 2
        ).length;

        const inProgressFiles = files.filter(
          (file) => file.status == 3 || file.status == 4
        ).length;
        // const kyroCompletedDates = completedFiles.map(file => file.kyro_completedDate);
        // const completedFilePageCount = completedFiles.map(file => file.pageCount);
        // const completedFilePageCount = completedFiles.reduce((total, file) => total + (file.pageCount || 0), 0);

        return {
          name: project.name,
          totalFiles,
          readyForWorkFiles,
          inProgressFiles,
          completedFiles,
          // kyroCompletedDates,
          // completedFilePageCount
        };
      })
    );
    return projectDetails;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw new Error("Error fetching project details");
  }
};

export const fetchClientProjectDetails = async (companyId) => {
  try {
    const projects = await fetchCompanyProjects(companyId);
    const projectDetails = await Promise.all(
      projects.map(async (project) => {
        const files = await fetchProjectFiles(project.id);
        const totalFiles = files.length;
        const completedFiles = files.filter((file) => file.status == 7);
        const completedFileCount = completedFiles.length;
        const readyForWorkFiles = files.filter(
          (file) => file.status == 5
        ).length;

        const inProgressFiles = files.filter((file) => file.status == 6).length;

        return {
          // id: project.id,
          name: project.name,
          totalFiles,
          readyForWorkFiles,
          inProgressFiles,
          completedFileCount,
          // kyroCompletedDates,
          // completedFilePageCount
        };
      })
    );
    return projectDetails;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw new Error("Error fetching project details");
  }
};

export const fetchDetailedFileReport = async (companyId) => {
  try {
    const statusLabel = {
      1: "ML",
      2: "NotStarted",
      3: "InProgress",
      4: "Completed",
      5: "Delivered",
      6: "Delivered",
      7: "Delivered",
      8: "Delivered",
    };

    const projects = await fetchCompanyProjects(companyId);
    const detailedFileReport = await Promise.all(
      projects.map(async (project) => {
        const files = await fetchProjectFiles(project.id);
        const filteredFiles = files.filter((file) => file.status >= 1);
        const filesWithAssigneeNames = await Promise.all(
          filteredFiles.map(async (file) => {
            const assigneeName = file.kyro_assignedTo
              ? await fetchUserNameById(file.kyro_assignedTo)
              : "";
            return {
              fileName: file.name,
              status: statusLabel[file.status],
              pageCount: file.pageCount,
              uploadedDate: file.uploadedDate,
              assignedDate: file.kyro_assignedDate,
              deliveryDate: file.kyro_deliveredDate,
              assigneeName,
              projectName: project.name,
            };
          })
        );
        return filesWithAssigneeNames;
      })
    );
    return detailedFileReport.flat();
  } catch (error) {
    console.error("Error fetching detailed file report:", error);
    throw new Error("Error fetching detailed file report");
  }
};

export const fetchClientDetailedFileReport = async (companyId) => {
  try {
    const projects = await fetchCompanyProjects(companyId);
    const detailedFileReport = await Promise.all(
      projects.map(async (project) => {
        const files = await fetchProjectFiles(project.id);
        const filteredFiles = files.filter((file) => file.status >= 5);
        const filesWithAssigneeNames = await Promise.all(
          filteredFiles.map(async (file) => {
            const assigneeName = file.client_assignedTo
              ? await fetchUserNameById(file.client_assignedTo)
              : "";
            return {
              fileName: file.name,
              status: file.status,
              pageCount: file.pageCount,
              uploadedDate: file.uploadedDate,
              assignedDate: file.client_assignedDate,
              deliveryDate: file.client_downloadedDate,
              assigneeName,
              projectName: project.name,
            };
          })
        );
        return filesWithAssigneeNames;
      })
    );
    return detailedFileReport.flat();
  } catch (error) {
    console.error("Error fetching detailed file report:", error);
    throw new Error("Error fetching detailed file report");
  }
};

export const fetchReportDetails = async (companyId, startDate, endDate) => {
  try {
    const projects = await fetchCompanyProjects(companyId);
    const allDetails = [];

    for (const project of projects) {
      const files = await fetchProjectFiles(project.id);

      const filteredFiles = files.filter((file) => {
        const deliveredDate = file.kyro_deliveredDate
          ? parse(file.kyro_deliveredDate, "dd/MM/yyyy", new Date())
          : null;
        // console.log(deliveredDate);

        return deliveredDate >= startDate && deliveredDate <= endDate;
      });

      const dateMap = filteredFiles.reduce((acc, file) => {
        const date = file.kyro_deliveredDate;
        // console.log(date)
        if (!acc[date]) {
          acc[date] = { date, fileCount: 0, pageCount: 0 };
        }
        acc[date].fileCount += 1;
        acc[date].pageCount += file.pageCount || 0;
        return acc;
      }, {});

      allDetails.push(...Object.values(dateMap));
    }

    return allDetails;
  } catch (error) {
    console.error("Error fetching report details:", error);
    throw new Error("Error fetching report details");
  }
};

// --- Company Operations ---

// Fetch all companies
export const fetchAllCompanies = async () => {
  try {
    const companiesSnapshot = await getDocs(collection(db, "companies"));
    const companies = companiesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return companies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw new Error("Error fetching companies");
  }
};

export const fetchCompanyNameByCompanyId = async (companyId) => {
  try {
    const companyDocRef = doc(db, "companies", companyId);
    const companyDoc = await getDoc(companyDocRef);
    if (companyDoc.exists()) {
      return companyDoc.data().name;
    } else {
      throw new Error("Company not found");
    }
  } catch (error) {
    console.error("Error fetching company name:", error);
    throw error;
  }
};

// --- User Operations ---

export const fetchUserReportData = async (companyId) => {
  try {
    // Step 1: Fetch all projects for the company
    const projects = await fetchCompanyProjects(companyId);

    const allFiles = [];

    // Step 2: Fetch files for each project
    for (const project of projects) {
      const projectFiles = await fetchProjectFiles(project.id);
      allFiles.push(...projectFiles);
    }

    const reportData = {};

    // Helper function to add files and pages to the group
    const addToGroup = (groupKey, file) => {
      if (!reportData[groupKey]) {
        reportData[groupKey] = {
          AssignedDate: "N/A",
          AssignedFiles: 0,
          AssignedPages: 0,
          CompletedDate: "N/A",
          CompletedFiles: 0,
          CompletedPages: 0,
        };
      }
      if (file.kyro_assignedDate) {
        reportData[groupKey].AssignedDate = formatDate(file.kyro_assignedDate);
        reportData[groupKey].AssignedFiles += 1;
        reportData[groupKey].AssignedPages += file.pageCount || 0;
      }
      if (file.kyro_completedDate) {
        reportData[groupKey].CompletedDate = formatDate(
          file.kyro_completedDate
        );
        reportData[groupKey].CompletedFiles += 1;
        reportData[groupKey].CompletedPages += file.pageCount || 0;
      }
    };

    // Step 3: Iterate over each file and group by date
    allFiles.forEach((file) => {
      const assignedKey = file.kyro_assignedDate
        ? formatDate(file.kyro_assignedDate)
        : null;
      const completedKey = file.kyro_completedDate
        ? formatDate(file.kyro_completedDate)
        : null;

      // Create group keys
      const groupKey = `${assignedKey || "N/A"}-${completedKey || "N/A"}`;

      // Add file to the appropriate group
      addToGroup(groupKey, file);
    });

    // Convert the grouped data object into an array
    const groupedReportData = Object.keys(reportData).map((key) => {
      const data = reportData[key];
      return {
        AssignedDate: data.AssignedDate,
        AssignedFiles: data.AssignedFiles,
        AssignedPages: data.AssignedPages,
        CompletedDate: data.CompletedDate,
        CompletedFiles: data.CompletedFiles,
        CompletedPages: data.CompletedPages,
      };
    });

    return groupedReportData;
  } catch (error) {
    console.error("Error fetching company report data:", error);
    throw new Error("Error fetching company report data");
  }
};

// Fetch the user's name by their ID
export const fetchUserNameById = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data().name;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user name:", error);
    throw error;
  }
};

// Fetch all users
export const fetchUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error fetching users");
  }
};
