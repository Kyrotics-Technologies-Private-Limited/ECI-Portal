import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import TabPanel from "../TabPanel";
import {
  fetchUserNameById,
} from "../../utils/auth.jsx";
import {
  fetchProjectName,
  fetchProjectFiles,
} from "../../services/projectServices";
import { updateFileStatus } from "../../services/fileServices";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import UserSelectModal from "../UserSelectModal";
import { auth } from "../../utils/firebase";
import Table from "../Table/Table";
import TableAdmin from "../Table/TableAdmin";
import KyroCompletedTable from "../Table/KyroCompletedTable";
import { useNavigate } from "react-router-dom";
import { formatDate, fetchServerTimestamp } from "../../utils/formatDate";
import { updateFileStatusNumber } from "../../services/fileServices";
import Button from "@mui/material/Button";
import { server } from "../../main.jsx";
import axios from "axios";
import Loader from "../common/Loader.jsx";
import { toast } from "react-hot-toast";

const columnsReadyForWork = [
  { id: "slNo", label: "Sl. No.", minWidth: 50 },
  { id: "name", label: "File Name", minWidth: 100 },
  { id: "pageCount", label: "Page Count", minWidth: 100 },
  { id: "uploadedDate", label: "Uploaded At", minWidth: 100 },
  { id: "edit", label: "", minWidth: 100, align: "right" },
];

const columnsInProgress = [
  { id: "slNo", label: "Sl. No.", minWidth: 50 },
  { id: "name", label: "File Name", minWidth: 100 },
  { id: "pageCount", label: "Page Count", minWidth: 100 },
  { id: "kyro_assignedDate", label: "Assigned Date", minWidth: 100 },
  { id: "kyro_assignedToName", label: "Assigned To", minWidth: 150 },
  { id: "edit", label: "", minWidth: 100, align: "right" },
];

const columnsCompleted = [
  { id: "slNo", label: "Sl. No.", minWidth: 50 },
  { id: "name", label: "File Name", minWidth: 100 },
  { id: "pageCount", label: "Page Count", minWidth: 100 },
  // { id: 'projectName', label: 'Project Name', minWidth: 150 },
  { id: "kyro_completedDate", label: "Completed Date", minWidth: 100 },
  { id: "kyro_assignedToName", label: "Completed By", minWidth: 150 },
  { id: "edit", label: "", minWidth: 100, align: "right" },
];
const columnsQA = [
  { id: "slNo", label: "Sl. No.", minWidth: 50 },
  { id: "name", label: "File Name", minWidth: 100 },
  { id: "pageCount", label: "Page Count", minWidth: 100 },
  // { id: 'projectName', label: 'Project Name', minWidth: 150 },
  { id: "kyro_deliveredDate", label: "Delivered Date", minWidth: 100 },
  { id: "kyro_assignedToName", label: "Completed By", minWidth: 150 },
];

const KyroAdminFileFlow = ({ projectId, companyId }) => {
  // const { projectId,companyId } = useParams();
    console.log('projectId ',projectId)
  
  const [files, setFiles] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [kyroId, setKyroId] = useState("");
  const [readyForWorkFiles, setReadyForWorkFiles] = useState([]);
  const [inProgressFiles, setInProgressFiles] = useState([]);
  const [completedFiles, setCompletedFiles] = useState([]);
  const [qaFiles, setQaFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { currentUser } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [role, setRole] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        // console.log(token)
        user.roleName = token.claims.roleName;
        user.companyId = token.claims.companyId;

        setRole(user.roleName);
        setKyroId(user.companyId);
      }
    });
    return () => unsubscribe();
  }, []);

  const getFiles = async () => {
    if (!companyId || !projectId) return;
    setIsLoading(true);
    try {
      const projectFiles = await fetchProjectFiles(projectId);
      const projectName = await fetchProjectName(projectId);

      const fetchFileUsers = async (files) => {
        return await Promise.all(
          files.map(async (file) => {
            try {
              const assignedUser = file.kyro_assignedTo
                ? await fetchUserNameById(file.kyro_assignedTo)
                : null;
              return {
                ...file,
                kyro_assignedToName: assignedUser,
              };
            } catch (error) {
              console.error(
                `Error fetching user name for file ${file.id}:`,
                error
              );
              return {
                ...file,
                kyro_assignedToName: file.kyro_assignedTo, // Fallback to ID if name fetch fails
              };
            }
          })
        );
      };

      const readyForWork = await fetchFileUsers(
        projectFiles.filter((file) => file.status === 2)
      );
      const inProgress = await fetchFileUsers(
        projectFiles.filter((file) => file.status === 3)
      );
      const completed = await fetchFileUsers(
        projectFiles.filter((file) => file.status === 4)
      );
      const qa = await fetchFileUsers(
        projectFiles.filter((file) => file.status >= 5)
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
      setQaFiles(qa.map((file, index) => ({ ...file, slNo: index + 1 })));
      setProjectName(projectName);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getFiles();
  }, [companyId, projectId, tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedRows([]);
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

  const displayTime = async () => {
    const serverTime = await fetchServerTimestamp();
    // console.log("time", serverTime);
    // console.log("format", formatDate(serverTime));
  };
  displayTime();

  const handleAssignToUser = async (userId) => {
    try {
      const userName = await fetchUserNameById(userId);

      const serverDate = await fetchServerTimestamp();
      const formattedDate = formatDate(serverDate);

      if (selectedRows.length != 0) {
        for (const fileId of selectedRows) {
          // Update the readyForWorkFiles and inProgressFiles state
          setReadyForWorkFiles((prevFiles) =>
            prevFiles.filter((file) => file.id !== fileId)
          );

          const fileData = await fetchProjectFiles(projectId).then((files) =>
            files.find((file) => file.id === fileId)
          );

          if (!fileData) {
            toast.error("File is already assigned please assign another file.");
            return; // Prevent further action
          }

          // Check if the file is already assigned
          if (fileData.status === 3) {
            toast.error("This file is already assigned to someone else.");
            return; // Prevent further action
          }

          setInProgressFiles((prevFiles) => [
            ...prevFiles,
            {
              ...readyForWorkFiles.find((file) => file.id == fileId),
              kyro_assignedDate: formattedDate,
              kyro_assignedTo: userName,
            },
          ]);
          await updateFileStatus(projectId, fileId, {
            status: 3,
            kyro_assignedDate: formattedDate,
            kyro_assignedTo: userId,
          });
        }
      } else {
        // Update the readyForWorkFiles and inProgressFiles state
        setReadyForWorkFiles((prevFiles) =>
          prevFiles.filter((file) => file.id !== selectedFileId)
        );

        const fileData = await fetchProjectFiles(projectId).then((files) =>
          files.find((file) => file.id === selectedFileId)
        );

        if (!fileData) {
          toast.error("File is already assigned please assign another file.");
          return; // Prevent further action
        }

        // Check if the file is already assigned
        if (fileData.status === 3) {
          toast.error("File is already assigned please assign another file.");
          return; // Prevent further action
        }

        setInProgressFiles((prevFiles) => [
          ...prevFiles,
          {
            ...readyForWorkFiles.find((file) => file.id == selectedFileId),
            status: 3,
            kyro_assignedDate: formattedDate,
            kyro_assignedTo: userName,
          },
        ]);
        await updateFileStatus(projectId, selectedFileId, {
          status: 3,
          kyro_assignedDate: formattedDate,
          kyro_assignedTo: userId,
        });
      }

      // navigate(-1);

      handleCloseModal();
    } catch (err) {
      console.error("Error updating file status:", err);
      setError(err);
    }
  };

  const handleRevertBackSelected = async () => {
    for (const fileId of selectedRows) {
      // await updateFileStatusNumber(projectId, fileId, 3);
      await updateFileStatus(projectId, fileId, {
        status: 3,
        kyro_completedDate: "",
      });
      // setCompletedFiles(files.filter(file => file.id !== fileId));
    }
    setSelectedRows([]);

    await getFiles();

    // Switch to the delivered tab
    setTabValue(1);
  };

  const handleSendSelected = async () => {
    const serverDate = await fetchServerTimestamp();
    const formattedDate = formatDate(serverDate);
    for (const fileId of selectedRows) {
      await updateFileStatus(projectId, fileId, {
        status: 5,
        kyro_deliveredDate: formattedDate,
      });
    }

    setSelectedRows([]);

    await getFiles();

    // Switch to the delivered tab
    setTabValue(3);
  };

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
          }),
        {
          loading: "Downloading files...",
          success: "Files downloaded successfully!",
          error: "Error downloading files.",
        }
      );

      // setSelectedRows([]);
    } catch (err) {
      console.error("Error downloading selected files:", err);
      toast.error("Error downloading selected files.");
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  return (
    <Box sx={{ height: "100vh", overflowY: "auto" }}>
      <Box
        sx={{ borderBottom: 1, borderColor: "divider" }}
        className="backdrop-blur-sm shadow-md pt-2 bg-indigo-400/10 rounded-full"
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="basic tabs example"
          centered
          sx={{
            "& .MuiTabs-flexContainer": {
              gap: "50px",
            },
          }}
        >
          <Tab label="Ready for Work" />
          <Tab label="Work in Progress" />
          <Tab label="Completed (QA)" />
          <Tab label="Delivered" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableAdmin
          columns={columnsReadyForWork}
          rows={readyForWorkFiles}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleEditClick={handleOpenModal}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          projectName={projectName}
          projectId={projectId}
          status={2}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Table
          columns={columnsInProgress}
          rows={inProgressFiles}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          projectName={projectName}
          projectId={projectId}
          status={3}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <KyroCompletedTable
          columns={columnsCompleted}
          rows={completedFiles}
          page={page}
          rowsPerPage={rowsPerPage}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          handleSendSelected={handleSendSelected}
          handleRevertBackSelected={handleRevertBackSelected}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          projectName={projectName}
          projectId={projectId}
          status={4}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleDownloadSelected()}
          sx={{
            position: "fixed",
            top: 180,
            right: 130,
            fontSize: "14px",
            zIndex: 10,
          }}
        >
          Download Selected
        </Button>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Table
          columns={columnsQA}
          rows={qaFiles}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          projectName={projectName}
          projectId={projectId}
          status={5}
        />
      </TabPanel>
      <UserSelectModal
        open={openModal}
        handleClose={handleCloseModal}
        handleAssign={handleAssignToUser}
        companyId={kyroId}
      />
    </Box>
  );
};

export default KyroAdminFileFlow;
