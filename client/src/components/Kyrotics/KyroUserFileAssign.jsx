import React, { useState, useEffect } from "react";
import {
  fetchProjectName,
  fetchProjectFiles,
} from "../../services/projectServices";
import { fetchUserWIPCount, assignFileToUser } from "../../services/fileServices";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDate, fetchServerTimestamp } from "../../utils/formatDate";
import { toast } from "react-hot-toast";
import Loader from "../common/Loader";
import UserAssignTable from "../Table/UserAssignTable";

const KyroUserFileAssign = ({ projectId, companyId }) => {
  // const { projectId } = useParams();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [projectName, setProjectName] = useState("");
  // const [companyId, setCompanyId] = useState("");
  // const [role, setRole] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const columns = [
    { id: "slNo", label: "Sl. No", minWidth: 50 },
    { id: "name", label: "File Name", minWidth: 170 },
    { id: "pageCount", label: "Page Count", minWidth: 100 },
    { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
    { id: "assign", label: "Actions", minWidth: 100 },
  ];

  // Move getProjectData outside useEffect
  const getProjectData = async () => {
    setIsLoading(true);
    try {
      const projectFiles = await fetchProjectFiles(projectId);
      const projectName = await fetchProjectName(projectId);
      const filteredFiles = projectFiles.filter(
        (file) => file.status === 2
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

  useEffect(() => {
    if (companyId) {
      getProjectData();
    }
  }, [projectId, companyId]);

  const handleFileAssign = async (id) => {
    try {
      // 1) Check backend if user already has a WIP
      const wipCount = await fetchUserWIPCount();
      if (wipCount > 0) {
        toast.error(
          "Cannot assign more than one file to Work In Progress. " +
            "Please complete and submit your current WIP first."
        );
        return;
      }

      // 2) Double-check this particular file isn't already in-progress
      const fileData = files.find((f) => f.id === id);
      if (!fileData || fileData.status === 3) {
        toast.error("This file is already assigned. Please pick another one.");
        return;
      }

      // 3) Fetch server timestamp & format
      const serverDate = await fetchServerTimestamp();
      const formattedDate = formatDate(serverDate);

      // 4) Assignment with concurrency check
      await assignFileToUser(projectId, id, {
        status: 3,
        kyro_assignedTo: currentUser.uid,
        kyro_assignedDate: formattedDate,
      });

      toast.success("File assigned successfully!");
      navigate(1);

      // 5) Remove from local table
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      // console.error("Error assigning file:", err);
      if (err.message === "File is already assigned") {
        toast.error("This file was just assigned to someone else. Refreshing the list...");
        getProjectData(); // Refresh the list
      } else {
        toast.error("Failed to assign the file. Please try again.");
        setError(err);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div>
      {isLoading && <Loader />}
      {error && <p>Error: {error.message}</p>}
      {!isLoading && !error && files.length === 0 && <p>No files found.</p>}
      {!isLoading && !error && files.length > 0 && (
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
      )}
    </div>
  );
};

export default KyroUserFileAssign;
