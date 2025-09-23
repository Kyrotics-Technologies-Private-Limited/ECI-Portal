import React, { useState, useEffect } from "react";
import { uploadFile } from "../../services/fileServices";
import { fetchProjectFiles, fetchProjectName } from "../../services/projectServices";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../../context/AuthContext";
import { updateFileStatus } from "../../services/fileServices";
import { formatDate, fetchServerTimestamp } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import UserAssignTable from "../Table/UserAssignTable";


const UserFileAssign = ({ projectId, companyId }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [projectName, setProjectName] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();


  const columns = [
    { id: "slNo", label: "Sl. No", minWidth: 50 },
    { id: "name", label: "File Name", minWidth: 170 },
    { id: "pageCount", label: "Page Count", minWidth: 100 },
    { id: "kyro_completedDate", label: "Uploaded At", minWidth: 170 },
    { id: "assign", label: "Actions", minWidth: 100 },
  ];


  useEffect(() => {
    if (companyId) {
      const getProjectData = async () => {
        setIsLoading(true);
        try {
          const projectFiles = await fetchProjectFiles(projectId);
          const projectName = await fetchProjectName(projectId);
          const filteredFiles = projectFiles.filter(
            (file) => file.status === 5
          );
          setFiles(filteredFiles);
          setProjectName(projectName);
        } catch (err) {
          console.error("Error fetching project data:", err);
          setError(err);
        } finally {
          setIsLoading(false);
        }
      };
      getProjectData();
    }
  }, [projectId, companyId]);

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf"
    );
    try {
      setIsLoading(true);
      const uploadPromises = uploadedFiles.map((file) =>
        uploadFile(projectId, file)
      );
      const uploadedFilesData = await Promise.all(uploadPromises);
      setFiles([...files, ...uploadedFilesData]);
      setIsLoading(false);
    } catch (err) {
      console.error("Error uploading files:", err);
      setError(err);
      setIsLoading(false);
    }
  };



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFileAssign = async (id) => {
    try {
      // Fetch the latest data for the file from the database
      const fileData = await fetchProjectFiles(projectId).then((files) =>
        files.find((file) => file.id === id)
      );

      if (!fileData) {
        toast.error("File is already assigned please assign another file.");
        return; // Prevent further action
      }

      // Check if the file is already assigned
      if (fileData.status === 6) {
        toast.error("File is already assigned please assign another file.");
        return; // Prevent further action
      }

      // If file is not assigned, proceed with assignment
      const serverDate = await fetchServerTimestamp();
      const formattedDate = formatDate(serverDate);

      await updateFileStatus(projectId, id, {
        status: 6,
        client_assignedTo: currentUser.uid,
        client_assignedDate: formattedDate,
      });

      toast.success("File assigned successfully!");
      navigate(1);

      // Update the local state by removing the assigned file
      setFiles(files.filter((file) => file.id !== id));
    } catch (err) {
      console.error("Error assigning file:", err);
      toast.error("Failed to assign the file. Please try again.");
      setError(err);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="application/pdf"
        id="file-upload"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      {isLoading && <CircularProgress />}
      {error && <p>Error: {error.message}</p>}
      {!isLoading && !error && files.length === 0 && <p>No files found.</p>}
      {!isLoading && !error && files.length > 0 && (
        <>
          <UserAssignTable
            columns={columns}
            rows={files.map((file, index) => ({ ...file, slNo: index + 1 }))}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleEditClick={handleFileAssign}
            projectName={projectName}
          />
        </>
      )}
    </div>
  );
};

export default UserFileAssign;
