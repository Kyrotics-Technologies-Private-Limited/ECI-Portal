// // //status notation
// // //0-->client End for delete //1-->Ml
// // //(KyroticsSide) 2-->Ready-for-work//3-->Assigned to User//4-->completed
// // //(ClientSide)4-->Ready-for-work//5-->Assigned to User//6-->completed //7-->Downloaded

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db, storage } from "../utils/firebase";
import { fetchProjectFiles } from "../services/projectServices";
import { fetchCompanyProjects, fetchCompanyUsers } from "./companyServices";
import { fetchUserNameById } from "../utils/firestoreUtil";
import { parse } from "date-fns";

export const fetchProjectDetails = async (companyId) => {
  try {
    const projects = await fetchCompanyProjects(companyId);
    const projectDetails = await Promise.all(
      projects.map(async (project) => {
        const files = await fetchProjectFiles(project.id);
        const totalFiles = files.length;
        const deliveredFiles = files.filter((file) => file.status >= 5).length;
        // const completedFileCount = completedFiles.length;
        const readyForWorkFiles = files.filter(
          (file) => file.status == 2
        ).length;

        const inProgressFiles = files.filter(
          (file) => file.status == 3 
        ).length;
        const qaFiles = files.filter((file) => file.status == 4).length;

        // const kyroCompletedDates = completedFiles.map(file => file.kyro_completedDate);
        // const completedFilePageCount = completedFiles.map(file => file.pageCount);
        // const completedFilePageCount = completedFiles.reduce((total, file) => total + (file.pageCount || 0), 0);

        return {
          // id: project.id,
          name: project.name,
          totalFiles,
          readyForWorkFiles,
          inProgressFiles,
          qaFiles,
          deliveredFiles,
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

        const receivedFiles = files.filter(
          (file) => file.status >= 5
        ).length;

        const readyForWorkFiles = files.filter(
          (file) => file.status == 5
        ).length;

        const inProgressFiles = files.filter((file) => file.status == 6).length;

        const completedFiles = files.filter((file) => file.status == 7).length;

        const downloadedFiles = files.filter((file) => file.status == 8).length;
        return {
          name: project.name,
          totalFiles,
          receivedFiles,
          readyForWorkFiles,
          inProgressFiles,
          completedFiles,
          downloadedFiles,
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
      1: "Processing",
      2: "NotStarted",
      3: "InProgress",
      4: "QA/Completed",
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
              completedDate: file.kyro_completedDate,
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
    const statusLabel = {
      5: "NotStarted",
      6: "InProgress",
      7: "Completed",
      8: "Downloaded",
    };

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
              status: statusLabel[file.status],
              pageCount: file.pageCount,
              uploadedDate: file.uploadedDate,
              assignedDate: file.client_assignedDate,
              completedDate: file.client_completedDate,
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


export const fetchDeliveryReportDetails = async (
  companyId,
  startDate,
  endDate
) => {
  try {
    const projects = await fetchCompanyProjects(companyId);
    const allDetails = [];
    const dateMap = {}; // Move dateMap outside the project loop

    for (const project of projects) {
      const files = await fetchProjectFiles(project.id);

      const filteredFiles = files.filter((file) => {
        const deliveredDate = file.kyro_deliveredDate
          ? parse(file.kyro_deliveredDate, "dd/MM/yyyy", new Date())
          : null;
        // console.log(deliveredDate);

        return (
          file.status >= 5 &&
          deliveredDate &&
          deliveredDate >= startDate &&
          deliveredDate <= endDate
        );
      });

      filteredFiles.forEach((file) => {
        const date = file.kyro_deliveredDate;
        if (!dateMap[date]) {
          dateMap[date] = { date, TotalFiles: 0, TotalPages: 0 };
        }
        dateMap[date].TotalFiles += 1;
        dateMap[date].TotalPages += file.pageCount || 0;
      });
    }

    allDetails.push(...Object.values(dateMap));
    return allDetails;
  } catch (error) {
    console.error("Error fetching report details:", error);
    throw new Error("Error fetching report details");
  }
};

// export const fetchUserCompletedFilesReport = async (
//   companyId,
//   startDate,
//   endDate
// ) => {
//   const projects = await fetchCompanyProjects(companyId);
//   const userFiles = {};

//   for (const project of projects) {
//     const files = await fetchProjectFiles(project.id);

//     // Filter files based on the completed date range
//     const filteredFiles = files.filter((file) => {
//       const completedDate = file.kyro_completedDate
//         ? parse(file.kyro_completedDate, "dd/MM/yyyy", new Date())
//         : null;

//       // Filter based on completedDate within the range
//       return (
//         file.status === 4 &&
//         completedDate &&
//         completedDate >= startDate &&
//         completedDate <= endDate
//       );
//     });

//     // Process filtered files
//     for (const file of filteredFiles) {
//       const userName = file.kyro_assignedTo
//         ? await fetchUserNameById(file.kyro_assignedTo)
//         : "Unknown";

//       // Skip if userName is 'Unknown'
//       if (userName === "Unknown") {
//         continue;
//       }

//       if (!userFiles[userName]) {
//         userFiles[userName] = { fileCount: 0, pageCount: 0 };
//       }

//       userFiles[userName].fileCount += 1;
//       userFiles[userName].pageCount += file.pageCount || 0;
//     }
//   }

//   // Convert userFiles object to an array of objects
//   const formattedData = Object.keys(userFiles).map((userName) => ({
//     userName,
//     totalFiles: userFiles[userName].fileCount,
//     totalPages: userFiles[userName].pageCount,
//   }));

//   return formattedData;
// };



// export const fetchUserCompletedFilesReport = async (
//   companyId,
//   startDate,
//   endDate
// ) => {
//   // Fetch all projects in parallel
//   const projects = await fetchCompanyProjects(companyId);

//   const userFiles = {};
//   const userNameCache = {}; // Cache to store fetched usernames to avoid multiple fetches

//   // Process all project files in parallel using Promise.all
//   await Promise.all(
//     projects.map(async (project) => {
//       const files = await fetchProjectFiles(project.id);

//       // Filter files based on status and completed date range
//       const filteredFiles = files.filter((file) => {
//         const completedDate = file.kyro_completedDate
//           ? parse(file.kyro_completedDate, "dd/MM/yyyy", new Date())
//           : null;

//         return (
//           file.status >= 4 &&
//           completedDate &&
//           completedDate >= startDate &&
//           completedDate <= endDate
//         );
//       });

//       // Process filtered files
//       for (const file of filteredFiles) {
//         // Use cached username if available
//         let userName = userNameCache[file.kyro_assignedTo];

//         // If not in cache, fetch and store it
//         if (!userName) {
//           userName = file.kyro_assignedTo
//             ? await fetchUserNameById(file.kyro_assignedTo)
//             : "Unknown";
//           userNameCache[file.kyro_assignedTo] = userName;
//         }

//         // Skip if userName is 'Unknown'
//         if (userName === "Unknown") {
//           continue;
//         }

//         if (!userFiles[userName]) {
//           userFiles[userName] = { fileCount: 0, pageCount: 0 };
//         }

//         userFiles[userName].fileCount += 1;
//         userFiles[userName].pageCount += file.pageCount || 0;
//       }
//     })
//   );

//   // Convert userFiles object to an array of objects
//   const formattedData = Object.keys(userFiles).map((userName) => ({
//     userName,
//     totalFiles: userFiles[userName].fileCount,
//     totalPages: userFiles[userName].pageCount,
//   }));

//   return formattedData;
// };
export const fetchUserCompletedFilesReport = async (
  companyId,
  selectedCompanyId,
  startDate,
  endDate
) => {

  // Fetch all company users and projects in parallel
  const [allCompanyUsers, projects] = await Promise.all([
    fetchCompanyUsers(companyId),
    fetchCompanyProjects(selectedCompanyId)
  ]);

  // Create a map of all users with their status (active/disabled)
  const userCache = {};
  allCompanyUsers.forEach(user => {
    userCache[user.id] = {
      userName: user.name,
      isActive: !user.disabled,
      fileCount: 0,
      pageCount: 0
    };
  });

  // Track users who completed files in the date range
  const fileUserCache = {};

  // Process all project files in parallel
  await Promise.all(
    projects.map(async (project) => {
      const files = await fetchProjectFiles(project.id);

      // Filter files based on status and completed date range
      const filteredFiles = files.filter((file) => {
        const completedDate = file.kyro_completedDate
          ? parse(file.kyro_completedDate, "dd/MM/yyyy", new Date())
          : null;

        return (
          file.status >= 4 &&
          completedDate &&
          completedDate >= startDate &&
          completedDate <= endDate
        );
      });

      // Process filtered files
      for (const file of filteredFiles) {
        if (!file.kyro_assignedTo) continue;
        
        const userId = file.kyro_assignedTo;
        
        // Skip if user not found in userCache (might be deleted or from another company)
        if (!userCache[userId]) continue;
        
        // Update user stats
        userCache[userId].fileCount += 1;
        userCache[userId].pageCount += file.pageCount || 0;
        
        // Track this user in fileUserCache (users who completed files)
        fileUserCache[userId] = true;
      }
    })
  );

  // Format the output data according to requirements
  const formattedData = Object.values(userCache)
    // Filter out disabled users with 0 files
    .filter(user => user.isActive || user.fileCount > 0)
    // Map to output format
    .map(user => ({
      userName: user.userName,
      totalFiles: user.fileCount,
      totalPages: user.pageCount,
      isActive: user.isActive
    }));

  return formattedData;
};

export const fetchClientUserCompletedFilesReport = async (
  companyId,
  startDate,
  endDate
) => {
  const projects = await fetchCompanyProjects(companyId);
  const userFiles = {};

  for (const project of projects) {
    const files = await fetchProjectFiles(project.id);

    // Filter files based on the completed date range
    const filteredFiles = files.filter((file) => {
      const completedDate = file.client_completedDate
        ? parse(file.client_completedDate, "dd/MM/yyyy", new Date())
        : null;

      // Filter based on completedDate within the range
      return (
        completedDate && completedDate >= startDate && completedDate <= endDate
      );
    });

    // Process filtered files
    for (const file of filteredFiles) {
      const userName = file.client_assignedTo
        ? await fetchUserNameById(file.client_assignedTo)
        : "Unknown";

      // Skip if userName is 'Unknown'
      if (userName === "Unknown") {
        continue;
      }

      if (!userFiles[userName]) {
        userFiles[userName] = { fileCount: 0, pageCount: 0 };
      }

      userFiles[userName].fileCount += 1;
      userFiles[userName].pageCount += file.pageCount || 0;
    }
  }

  // Convert userFiles object to an array of objects
  const formattedData = Object.keys(userFiles).map((userName) => ({
    userName,
    totalFiles: userFiles[userName].fileCount,
    totalPages: userFiles[userName].pageCount,
  }));

  return formattedData;
};

export const fetchUserDetailedReport = async (companyId) => {
  try {
    // Step 1: Fetch all projects for the company
    const projects = await fetchCompanyProjects(companyId);

    const allFiles = [];

    // Step 2: Fetch files for each project
    for (const project of projects) {
      const projectFiles = await fetchProjectFiles(project.id);
      allFiles.push(...projectFiles);
    }

    // Step 3: Aggregate data by user
    const aggregatedData = {};

    for (const data of allFiles) {
      const {
        kyro_assignedTo,
        kyro_assignedDate,
        kyro_completedDate,
        pageCount,
      } = data;

      if (!kyro_assignedTo) continue; // Skip if no user assigned
      const userName = await fetchUserNameById(kyro_assignedTo);
      

      if (!aggregatedData[userName]) {
        aggregatedData[userName] = {
          assigned: {},
          completed: {},
        };
      }

      // Aggregate assigned files and pages by date
      if (kyro_assignedDate) {
        if (!aggregatedData[userName].assigned[kyro_assignedDate]) {
          aggregatedData[userName].assigned[kyro_assignedDate] = {
            totalFiles: 0,
            totalPages: 0,
          };
        }
        aggregatedData[userName].assigned[kyro_assignedDate].totalFiles += 1;
        aggregatedData[userName].assigned[kyro_assignedDate].totalPages +=
          pageCount;
      }

      // Aggregate completed files and pages by date
      if (kyro_completedDate) {
        if (!aggregatedData[userName].completed[kyro_completedDate]) {
          aggregatedData[userName].completed[kyro_completedDate] = {
            totalFiles: 0,
            totalPages: 0,
          };
        }
        aggregatedData[userName].completed[kyro_completedDate].totalFiles += 1;
        aggregatedData[userName].completed[kyro_completedDate].totalPages +=
          pageCount;
      }
    }

    // Prepare the final output
    const finalData = [];
    for (const userName in aggregatedData) {
      const assignedDates = aggregatedData[userName].assigned;
      const completedDates = aggregatedData[userName].completed;

      for (const date in assignedDates) {
        finalData.push({
          userName,
          assignedDate: date,
          assignedFiles: assignedDates[date].totalFiles,
          assignedPages: assignedDates[date].totalPages,
          completedDate: null,
          completedFiles: null,
          completedPages: null,
        });
      }

      for (const date in completedDates) {
        finalData.push({
          userName,
          assignedDate: null,
          assignedFiles: null,
          assignedPages: null,
          completedDate: date,
          completedFiles: completedDates[date].totalFiles,
          completedPages: completedDates[date].totalPages,
        });
      }
    }

    return finalData;
  } catch (error) {
    console.error("Error fetching aggregated user data:", error);
    throw new Error("Failed to fetch data");
  }
};
