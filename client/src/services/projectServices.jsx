// // //status notation
// // //0-->client End for delete //1-->Ml
// // //(KyroticsSide) 2-->Ready-for-work//3-->Assigned to User//4-->completed
// // //(ClientSide)4-->Ready-for-work//5-->Assigned to User//6-->completed //7-->Downloaded

import { db, storage } from "../utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { parse } from "date-fns";
import { file } from "jszip";
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

export const fetchFilesByStatus = async () => {
  try {
    // Fetch all projects
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    const allFiles = [];

    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id;

      // Fetch files for each project
      const filesCollection = collection(db, "projects", projectId, "files");

      // Query for files with status 3 (Pending), status >= 5 (Completed), and status 4 (Under Review)
      const filesQuery = query(
        filesCollection,
        where("status", "in", [3, 4]),
        where("status", ">=", 3)
      );

      const filesSnapshot = await getDocs(filesQuery);

      // Filter the files based on the status criteria and map them
      const files = filesSnapshot.docs
        .map((doc) => {
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
        })
        .filter((file) => {
          // Further filter to include only Pending (status 3), Completed (status >= 5), and Under Review (status 4)
          return file.status === 3 || file.status >= 5 || file.status === 4;
        });

      // Add filtered files to the allFiles array
      allFiles.push(...files);
    }

    return allFiles;
  } catch (error) {
    console.error("Error fetching files by status:", error);
    throw new Error("Error fetching files by status");
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

export const fetchProjectFilesByFolder = async (projectId, folderId) => {
  try {
    // console.log('test run')
    const filesCollection = collection(db, "projects", projectId, "files");

    // Create query with folderId filter
    let filesSnapshot;
    if (folderId) {
      const q = query(filesCollection, where("folderId", "==", folderId));
      filesSnapshot = await getDocs(q);
    } else {
      filesSnapshot = await getDocs(filesCollection);
    }

    const files = filesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // console.log("file in project service : ", files);
 
    // const files = filesSnapshot.docs.map((doc) => {
    //   const data = doc.data();
    //   return {
    //     id: doc.id,
    //     name: data.name,
    //     pdfUrl: data.pdfUrl,
    //     htmlUrl: data.htmlUrl,
    //     pageCount: data.pageCount,
    //     projectId: projectId,
    //     folderId: folderId, // Include folderId in response
    //     status: data.status,

    //     // Date fields
    //     uploadedDate: data.uploadedDate || null,
    //     kyro_assignedDate: data.kyro_assignedDate || null,
    //     kyro_completedDate: data.kyro_completedDate || null,
    //     kyro_deliveredDate: data.kyro_deliveredDate || null,
    //     client_assignedDate: data.client_assignedDate || null,
    //     client_completedDate: data.client_completedDate || null,
    //     client_downloadedDate: data.client_downloadedDate || null,

    //     // Assignment fields
    //     kyro_assignedTo: data.kyro_assignedTo || null,
    //     client_assignedTo: data.client_assignedTo || null,
    //   };
    // });

    return files;
  } catch (error) {
    console.error("Error fetching folder files:", error);
    throw new Error("Error fetching folder files");
  }
};


export const fetchProjectFilesByFolderWithStatus = async (
  projectId,
  folderId,
  status
) => {
  const filesCollection = collection(db, "projects", projectId, "files");

  // Build an array of where-clauses
  const conditions = [ where("status", "==", status) ];
  if (folderId) {
    conditions.push( where("folderId", "==", folderId) );
  }

  // Apply them all at once
  const filesQuery = query(filesCollection, ...conditions);
  const snapshot   = await getDocs(filesQuery);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const fetchTotalProjectFilesCount = async (projectId) => {
  try {
    const q = query(collection(db, "projects", projectId, "files"));
    const filesSnapshot = await getDocs(q);
    const fileCount = filesSnapshot.size;
    //   console.log(`Project: ${projectId}, File Count: ${fileCount}`);
    return fileCount;
  } catch (error) {
    console.error(`Error fetching project files count:`, error);
    throw new Error("Error fetching project files count");
  }
};

// export const fetchTotalProjectFilesCount = async (projectId) => {
//   try {
//     // Fetch the project document to get the project name
//     const projectDoc = await getDoc(doc(db, "projects", projectId));
//     if (!projectDoc.exists()) {
//       throw new Error("Project not found");
//     }

//     const projectName = projectDoc.data().name;

//     // Query to get the files count
//     const q = query(collection(db, "projects", projectId, "files"));
//     const filesSnapshot = await getDocs(q);
//     const fileCount = filesSnapshot.size;

//     console.log(`Project: ${projectName}, File Count: ${fileCount}`);
//     return fileCount;
//   } catch (error) {
//     console.error(`Error fetching project files count:`, error);
//     throw new Error("Error fetching project files count");
//   }
// };

export const fetchUserProjectsCount = async (userId, startDate, endDate) => {
  try {
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    let pendingCount = 0;
    let completedCount = 0;
    let underReviewCount = 0;
    let pendingPages = 0;
    let completedPages = 0;
    let underReviewPages = 0;

    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id;
      const filesCollection = collection(db, "projects", projectId, "files");

      // Adjust query to retrieve relevant files by user
      const filesQuery = query(
        filesCollection,
        where("kyro_assignedTo", "==", userId),
        where("status", "in", [3, 4, 5, 6, 7, 8])
      );

      const filesSnapshot = await getDocs(filesQuery);

      filesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const completedDate = data.kyro_completedDate
          ? parse(data.kyro_completedDate, "dd/MM/yyyy", new Date())
          : null;
        const pages = data.pageCount || 0;

        // Count pending files regardless of date range
        if (data.status === 3) {
          pendingCount++;
          pendingPages += pages;
        }

        // Only count completed and under-review files within the date range
        if (
          completedDate &&
          completedDate >= startDate &&
          completedDate <= endDate
        ) {
          if (data.status >= 5) {
            completedCount++;
            completedPages += pages;
          } else if (data.status === 4) {
            underReviewCount++;
            underReviewPages += pages;
          }
        }
      });
    }

    return {
      pendingCount:
        pendingCount > 9 ? pendingCount.toString() : `0${pendingCount}`,
      completedCount:
        completedCount > 9 ? completedCount.toString() : `0${completedCount}`,
      underReviewCount:
        underReviewCount > 9
          ? underReviewCount.toString()
          : `0${underReviewCount}`,
      pendingPages:
        pendingPages > 9 ? pendingPages.toString() : `0${pendingPages}`,
      completedPages:
        completedPages > 9 ? completedPages.toString() : `0${completedPages}`,
      underReviewPages:
        underReviewPages > 9
          ? underReviewPages.toString()
          : `0${underReviewPages}`,
    };
  } catch (error) {
    console.error("Error fetching project files by user:", error);
    throw new Error("Error fetching project files by user");
  }
};



export const fetchQAProjectsCount = async () => {
  try {
    // Fetch all projects
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    let pendingCount = 0;
    let completedCount = 0;
    // let underReviewCount = 0;
    let pendingPages = 0;
    let completedPages = 0;
    // let underReviewPages = 0;

    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id;

      // Fetch files for each project where kyro_assignedTo matches the userId
      const filesCollection = collection(db, "projects", projectId, "files");
      const filesQuery = query(
        filesCollection,
        where("status", "in", [4, 5, 6, 7, 8]) // Add all the statuses to filter for
      );

      const filesSnapshot = await getDocs(filesQuery);

      // Count the files based on their status
      filesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const pages = data.pageCount || 0;
        if (data.status == 4) {
          pendingCount++;
          pendingPages += pages;
        } else if (data.status >= 5) {
          completedCount++;
          completedPages += pages;
        }
      });
    }

    return {
      pendingCount:
        pendingCount > 9 ? pendingCount.toString() : `0${pendingCount}`,
      completedCount:
        completedCount > 9 ? completedCount.toString() : `0${completedCount}`,
      pendingPages:
        pendingPages > 9 ? pendingPages.toString() : `0${pendingPages}`,
      completedPages:
        completedPages > 9 ? completedPages.toString() : `0${completedPages}`,
    };
  } catch (error) {
    console.error("Error fetching project files by user:", error);
    throw new Error("Error fetching project files by user");
  }
};

export const fetchClientUserProjectsCount = async (userId) => {
  try {
    // Fetch all projects
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    let pendingCount = 0;
    let completedCount = 0;
    let underReviewCount = 0;
    let pendingPages = 0;
    let completedPages = 0;
    let underReviewPages = 0;

    for (const projectDoc of projectsSnapshot.docs) {
      const projectId = projectDoc.id;

      // Fetch files for each project where kyro_assignedTo matches the userId
      const filesCollection = collection(db, "projects", projectId, "files");
      const filesQuery = query(
        filesCollection,
        where("client_assignedTo", "==", userId),
        where("status", "in", [6, 7, 8]) // Add all the statuses to filter for
      );

      const filesSnapshot = await getDocs(filesQuery);

      // Count the files based on their status
      filesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const pages = data.pageCount || 0;
        if (data.status == 6) {
          pendingCount++;
          pendingPages += pages;
        } else if (data.status >= 7) {
          completedCount++;
          completedPages += pages;
        }
      });
    }

    return {
      pendingCount:
        pendingCount > 9 ? pendingCount.toString() : `0${pendingCount}`,
      completedCount:
        completedCount > 9 ? completedCount.toString() : `0${completedCount}`,
      underReviewCount:
        underReviewCount > 9
          ? underReviewCount.toString()
          : `0${underReviewCount}`,
      pendingPages:
        pendingPages > 9 ? pendingPages.toString() : `0${pendingPages}`,
      completedPages:
        completedPages > 9 ? completedPages.toString() : `0${completedPages}`,
      underReviewPages:
        underReviewPages > 9
          ? underReviewPages.toString()
          : `0${underReviewPages}`,
    };
  } catch (error) {
    console.error("Error fetching project files by user:", error);
    throw new Error("Error fetching project files by user");
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
