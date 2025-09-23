import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import TabPanel from "../TabPanel.jsx";
import {
  fetchProjectFiles,
  fetchProjectName,
} from "../../services/projectServices.jsx";
import { updateFileStatus } from "../../services/fileServices.jsx";
import { fetchUserNameById } from "../../utils/auth.jsx";
import { useParams } from "react-router-dom";
import UserSelectModal from "../UserSelectModal.jsx";
import { auth } from "../../utils/firebase.jsx";
import TableAdmin from "../Table/TableAdmin.jsx";
import Table from "../Table/Table.jsx";
import CompletedTable from "../Table/CompletedTable.jsx";
import Button from "@mui/material/Button";
import { server } from "../../main.jsx";
import axios from "axios";
import { formatDate, fetchServerTimestamp } from "../../utils/formatDate.jsx";
import { toast } from "react-hot-toast";

const columnsReadyForWork = [
  { id: "slNo", label: "Sl. No", minWidth: 50 },
  { id: "name", label: "File Name", minWidth: 170 },
  { id: "pageCount", label: "Page Count", minWidth: 100 },
  { id: "kyro_completedDate", label: "Uploaded At", minWidth: 170 },
  { id: "edit", label: "Actions", minWidth: 100 },
];

const columnsInProgress = [
  { id: "slNo", label: "Sl. No.", minWidth: 50 },
  { id: "name", label: "File Name", minWidth: 100 },
  { id: "pageCount", label: "Page Count", minWidth: 100 },
  { id: "client_assignedDate", label: "Assigned Date", minWidth: 100 },
  { id: "client_assignedTo", label: "Assigned To", minWidth: 150 },
  { id: "edit", label: "", minWidth: 100, align: "right" },
];

const columnsCompleted = [
  { id: "slNo", label: "Sl. No.", minWidth: 50 },
  { id: "name", label: "File Name", minWidth: 100 },
  { id: "pageCount", label: "Page Count", minWidth: 100 },
  // { id: 'projectName', label: 'Project Name', minWidth: 150 },
  { id: "client_completedDate", label: "Completed Date", minWidth: 100 },
  { id: "client_assignedTo", label: "Completed By", minWidth: 150 },
  { id: "download", label: "", minWidth: 100, align: "right" },
];

const columnsDownloaded = [
  { id: "slNo", label: "Sl. No.", minWidth: 50 },
  { id: "name", label: "File Name", minWidth: 100 },
  { id: "pageCount", label: "Page Count", minWidth: 100 },
  { id: "client_downloadedDate", label: "Download Date", minWidth: 100 },
  { id: "client_assignedTo", label: "Completed By", minWidth: 150 },
];

const AdminFileFlow = ({ projectId, companyId }) => {
  // console.log(companyId)
  const [tabValue, setTabValue] = useState(0);
  const [readyForWorkFiles, setReadyForWorkFiles] = useState([]);
  const [inProgressFiles, setInProgressFiles] = useState([]);
  const [completedFiles, setCompletedFiles] = useState([]);
  const [downloadedFiles, setDownloadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const [role, setRole] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        // console.log(token)
        user.roleName = token.claims.roleName;
        user.companyId = token.claims.companyId;

        setRole(user.roleName);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getFiles = async () => {
      if (!companyId || !projectId) return;
      setIsLoading(true);
      try {
        const projectFiles = await fetchProjectFiles(projectId);
        const projectName = await fetchProjectName(projectId);

        const fetchFileUsers = async (files) => {
          return await Promise.all(
            files.map(async (file) => {
              const assignedUser = file.client_assignedTo
                ? await fetchUserNameById(file.client_assignedTo)
                : null;
              // const completedUser = file.assignedTo ? await fetchUserNameById(file.assignedTo) : null;
              return {
                ...file,
                client_assignedTo: assignedUser,
                // completedBy: completedUser
              };
            })
          );
        };

        const readyForWork = await fetchFileUsers(
          projectFiles.filter((file) => file.status === 5)
        );
        const inProgress = await fetchFileUsers(
          projectFiles.filter((file) => file.status === 6)
        );
        const completed = await fetchFileUsers(
          projectFiles.filter((file) => file.status === 7)
        );
        const downloaded = await fetchFileUsers(
          projectFiles.filter((file) => file.status === 8)
        );

        setReadyForWorkFiles(
          readyForWork.map((file, index) => ({ ...file, slNo: index + 1 }))
        );
        setInProgressFiles(
          inProgress.map((file, index) => ({ ...file, slNo: index + 1 }))
        );
        setCompletedFiles(
          completed.map((file, index) => ({ ...file, slNo: index + 1 }))
        );
        setDownloadedFiles(
          downloaded.map((file, index) => ({ ...file, slNo: index + 1 }))
        );

        setProjectName(projectName);
      } catch (err) {
        console.error("Error fetching files:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    getFiles();
  }, [companyId, projectId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenModal = (id) => {
    setSelectedFileId(id);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFileId(null);
  };

  const handleAssignToUser = async (userId) => {
    try {
      const serverDate = await fetchServerTimestamp();
      const formattedDate = formatDate(serverDate);
      const userName = await fetchUserNameById(userId);

      if (selectedRows.length !== 0) {
        for (const fileId of selectedRows) {
          await updateFileStatus(projectId, fileId, {
            status: 6, // New status
            client_assignedTo: userId,
            client_assignedDate: formattedDate,
          });

          // Update the readyForWorkFiles and inProgressFiles state
          setReadyForWorkFiles((prevFiles) =>
            prevFiles.filter((file) => file.id !== fileId)
          );

          setInProgressFiles((prevFiles) => [
            ...prevFiles,
            {
              ...readyForWorkFiles.find((file) => file.id === fileId),
              status: 6,
              client_assignedTo: userName,
              client_assignedDate: formattedDate,
            },
          ]);
        }
      } else {
        await updateFileStatus(projectId, selectedFileId, {
          status: 6, // New status
          client_assignedTo: userId,
          client_assignedDate: formattedDate,
        });

        // Update the readyForWorkFiles and inProgressFiles state
        setReadyForWorkFiles((prevFiles) =>
          prevFiles.filter((file) => file.id !== selectedFileId)
        );

        setInProgressFiles((prevFiles) => [
          ...prevFiles,
          {
            ...readyForWorkFiles.find((file) => file.id === selectedFileId),
            status: 6,
            client_assignedTo: userName,
            client_assignedDate: formattedDate,
          },
        ]);
      }
      // navigate(-1);

      handleCloseModal();
    } catch (err) {
      console.error("Error updating file status:", err);
      setError(err);
    }
  };

  const handleDownload = async (projectId, documentId, format) => {
    setError(null);

    try {
      let endpoint = `${server}/api/document/${projectId}/${documentId}/downloadPdf`;
      if (format === "word") {
        endpoint = `${server}/api/document/${projectId}/${documentId}/downloadDocx`;
      }

      // Use toast.promise to handle the download process
      await toast.promise(
        axios
          .get(endpoint, {
            responseType: "blob", // Expecting a blob for successful downloads
          })
          .then(async (response) => {
            // Check if response size is very small, it might be an error message in blob
            if (response.data.size < 100) {
              // Try converting blob to text for an error message
              const text = await response.data.text();
              try {
                const errorData = JSON.parse(text);
                throw new Error(
                  errorData.message || "An unknown error occurred."
                );
              } catch (err) {
                throw new Error("Error occurred during file download.");
              }
            }

            // Proceed with file download if it's valid
            const contentDisposition = response.headers["content-disposition"];
            const filename = contentDisposition
              ? contentDisposition.split("filename=")[1].replace(/"/g, "")
              : "document.zip";

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Update the completed files list
            setCompletedFiles((prevFiles) =>
              prevFiles.filter((file) => file.id !== documentId)
            );

            setDownloadedFiles((prevFiles) => [
              ...prevFiles,
              {
                ...completedFiles.find((file) => file.id === documentId),
                status: 8,
                client_downloadedDate: formatDate(new Date()),
              },
            ]);

            // Update file status
            return updateFileStatus(projectId, documentId, {
              status: 8,
              client_downloadedDate: formatDate(new Date()),
            });
          }),
        {
          loading: "Downloading...",
          success: "File downloaded successfully!",
          error: "An error occurred while downloading the file.",
        }
      );
    } catch (err) {
      console.log("error", err);
      // Display the error using toast
      // toast.error(err.message || "An error occurred. Please try again.", {
      //   position: "top-right",
      //   style: { background: "#333", color: "#fff" },
      // });
      console.error("Error during document download:", err);
    }
  };

  // const handleDownloadSelected = async (format) => {
  //   try {
  //     for (const documentId of selectedRows) {
  //       await handleDownload(projectId, documentId, format);
  //     }
  //     setSelectedRows([]);
  //   } catch (err) {
  //     console.error("Error downloading selected files:", err);
  //   }
  // };

  // console.log("rows",selectedRows)
  const handleDownloadSelected = async () => {
    setError(null);

    try {
      const endpoint = `${server}/api/document/downloadSelected`;

      await toast.promise(
        axios
          .post(
            endpoint,
            {
              projectId,
              documentIds: selectedRows, // Send all selected rows
            },
            {
              responseType: "blob", // Expect a blob for download
            }
          )
          .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${projectName}.zip`);

            document.body.appendChild(link);
            link.click();
            link.remove();

            for (const documentId of selectedRows) {
              setCompletedFiles((prevFiles) =>
                prevFiles.filter((file) => file.id !== documentId)
              );

              setDownloadedFiles((prevFiles) => [
                ...prevFiles,
                {
                  ...completedFiles.find((file) => file.id === documentId),
                  status: 8,
                  client_downloadedDate: formatDate(new Date()),
                },
              ]);

              updateFileStatus(projectId, documentId, {
                status: 8,
                client_downloadedDate: formatDate(new Date()),
              });
            }
          }),
        {
          loading: "Downloading files...",
          success: "Files downloaded successfully!",
          error: "Error downloading files.",
        }
      );

      setSelectedRows([]);
      navigate(0);
    } catch (err) {
      console.error("Error downloading selected files:", err);
      toast.error("Error downloading selected files.");
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  return (
    <Box>
      <Box className=" border-b border-gray-200 ">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-center">
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="document status tabs"
              TabIndicatorProps={{
                style: {
                  backgroundColor: "#2563eb",
                  height: 2,
                },
              }}
            >
              {[
                "Ready for Work",
                "Work in Progress",
                "Completed",
                "Downloaded",
              ].map((label, index) => (
                <Tab
                  key={index}
                  label={label}
                  style={{
                    textTransform: "none",
                    fontSize: "0.875rem",
                    fontWeight: tabValue === index ? 600 : 500,
                    color: tabValue === index ? "#2563eb" : "#6b7280",
                    padding: "1rem 2rem",
                    minHeight: "3.5rem",
                  }}
                />
              ))}
            </Tabs>
          </div>
        </div>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableAdmin
          columns={columnsReadyForWork}
          rows={readyForWorkFiles}
          page={page}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleEditClick={handleOpenModal}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          projectName={projectName}
          projectId={projectId}
          status={5}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Table
          columns={columnsInProgress}
          rows={inProgressFiles}
          page={page}
          projectName={projectName}
          projectId={projectId}
          status={6}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <CompletedTable
          columns={columnsCompleted}
          rows={completedFiles}
          page={page}
          projectName={projectName}
          projectId={projectId}
          status={7}
          rowsPerPage={rowsPerPage}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleDownload={handleDownload}
          handleDownloadSelected={handleDownloadSelected}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <CompletedTable
          columns={columnsDownloaded}
          rows={downloadedFiles}
          page={page}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          projectName={projectName}
          projectId={projectId}
          status={8}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleDownloadSelected={handleDownloadSelected}
        />
      </TabPanel>
      <UserSelectModal
        open={openModal}
        handleClose={handleCloseModal}
        handleAssign={handleAssignToUser}
        companyId={companyId}
      />
    </Box>
  );
};

export default AdminFileFlow;
