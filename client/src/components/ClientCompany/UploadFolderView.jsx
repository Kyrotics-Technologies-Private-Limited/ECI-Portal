
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchProjectFolders,
  createFolder,
} from "../../services/folderServices";
import {
  deleteFile,
  fetchFileNameById,
  uploadFile,
} from "../../services/fileServices";
import {
  Breadcrumbs,
  Link,
  Button,
  Fab,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TableUpload from "../Table/TableUpload";
import Loader from "../common/Loader";
import { FolderList } from "../common/FolderList";
import { UploadFile } from "@mui/icons-material";
import {
  fetchTotalProjectFilesCount,
  fetchProjectFilesByFolder,
  fetchProjectFiles,
  fetchProjectFilesByFolderWithStatus,
} from "../../services/projectServices";
import { file, folder } from "jszip";

const UploadFolderView = ({ project, onBack }) => {
  const [folders, setFolders] = useState([]); // All folders data
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // Currently selected folder
  const [breadcrumbs, setBreadcrumbs] = useState([]); // Breadcrumbs for navigation
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [projectFileCount, setProjectFileCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [hasFetchedFolders, setHasFetchedFolders] = useState(false);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const { folders } = await fetchProjectFolders(project.id);
      setFolders(folders || []);
      setError(null);
      setHasFetchedFolders(true); // Mark folders as fetched
    } catch (err) {
      setError(err.message || "Failed to fetch folders");
      setHasFetchedFolders(true); // Even on error, mark as fetched
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolderFiles = useCallback(async () => {
    const files = await fetchProjectFilesByFolderWithStatus(project.id, currentFolder.id,0);

    setFiles(files);
  }, [project.id, currentFolder?.id]);

  const fetchDirectProjectFiles = useCallback(async () => {
    const projectFiles = await fetchProjectFiles(project.id);
    const filteredFiles = projectFiles.filter((file) => file.status === 0);
    setFiles(filteredFiles);
  }, [project.id]);

  useEffect(() => {
    fetchFolders();
  }, [project]);

  useEffect(() => {
    const CountFiles = async () => {
      const count = await fetchTotalProjectFilesCount(project.id);
      setProjectFileCount(count);
    };
    CountFiles();
  }, [project.id]);

  useEffect(() => {
    if (currentFolder) {
      fetchFolderFiles();
    } else if (hasFetchedFolders && folders.length === 0) {
      fetchDirectProjectFiles();
    }
  }, [
    currentFolder,
    folders.length,
    hasFetchedFolders,
    fetchFolderFiles,
    fetchDirectProjectFiles,
  ]);

  const handleFileDelete = async (fileId, fileName) => {
    try {
      setIsLoading(true);
      await deleteFile(project.id, fileId, fileName);
      setFiles(files.filter((file) => file.id !== fileId));

      setIsLoading(false);
    } catch (err) {
      console.error("Error deleting file:", err);
      setError(err);
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    for (const row of selectedRows) {
      // console.log("row",row)
      let fileName = await fetchFileNameById(project.id, row);
      // console.log("row",row, fileName);
      await handleFileDelete(row, fileName);
    }
    setSelectedRows([]);
    fetchFolderFiles();
    // setSelectedProject(null);
    // navigate(1);
  };

  const columns = [
    { id: "slNo", label: "Sl. No", minWidth: 50 },
    { id: "name", label: "File Name", minWidth: 170 },
    { id: "pageCount", label: "Page Count", minWidth: 100 },
    { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
    { id: "edit", label: "Actions", minWidth: 100 },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // console.log("folder", folders);
  // console.log("current folder", currentFolder);

  // Handle folder click
  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setCurrentFolder(folder);
    setBreadcrumbs((prev) => [...prev, folder]);
    setFiles(folder.files || []);
  };

  // Handle back button or breadcrumb click
  const handleBackClick = (index = null) => {
    if (index !== null) {
      // Navigate to a specific breadcrumb
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      const newCurrentFolder =
        newBreadcrumbs[newBreadcrumbs.length - 1] || null;
      setCurrentFolder(newCurrentFolder);
      setFiles(newCurrentFolder?.files || []);
    } else if (currentFolder) {
      // Navigate back to the parent folder
      const parentFolder = breadcrumbs[breadcrumbs.length - 2] || null;
      setBreadcrumbs((prev) => prev.slice(0, -1));
      setCurrentFolder(parentFolder);
      setFiles(parentFolder?.files || []);
    } else {
      onBack();
    }
  };

  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      const newFolder = await createFolder({
        projectId: project.id,
        folderName: newFolderName,
        parentFolderId: currentFolder ? currentFolder.id : null,
        // parentFolderId: selectedFolder ? selectedFolder.id : null,
      });
      setFolders([...folders, newFolder.folder]);
      setIsCreateFolderModalOpen(false);
      setNewFolderName("");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to create folder");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf"
    );
    // console.log('upload')

    try {
      setIsLoading(true);
      const uploadPromises = uploadedFiles.map((file) =>
        uploadFile(
          project.id,
          file,
          currentFolder?.id
          // currentPath.length ? currentPath[currentPath.length - 1].id : null
        )
      );
      const uploadedFilesData = await Promise.all(uploadPromises);
      setFiles([...files, ...uploadedFilesData]);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to upload files");
    } finally {
      setIsLoading(false);
    }
  };
  // console.log("project file count", projectFileCount);
  // console.log("current folder", currentFolder);
  // console.log("Folder length", folders.length);

  return (
    <div className="flex flex-col items-center h-full  p-4">
      <div className="w-full mb-4 flex items-center justify-between">
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            onClick={() => handleBackClick(null)}
            className="cursor-pointer"
          >
            {project.name}
          </Link>
          {breadcrumbs.map((folder, index) => (
            <Link
              key={folder.id}
              underline="hover"
              color={
                index === breadcrumbs.length - 1 ? "text.primary" : "inherit"
              }
              onClick={() => handleBackClick(index)}
              className="cursor-pointer"
            >
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>

        {breadcrumbs.length >= 0 && (
          <IconButton onClick={() => handleBackClick()}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
        )}
      </div>

      {/* Loading and error state */}
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <Loader />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {/* Folder List */}
      {!isLoading && !error && folders.length > 0 && (
        <div className="w-full">
          <FolderList
            folders={
              currentFolder
                ? currentFolder.children || []
                : folders.filter((folder) => !folder.parentFolderId)
            }
            onFolderClick={handleFolderClick}
          />
        </div>
      )}

      {/* Empty state message */}
      {!isLoading &&
        !error &&
        currentFolder?.children?.length === 0 &&
        files.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No files or folders found
          </div>
        )}
        
      {/* File List */}
      {hasFetchedFolders && (folders.length == 0 || files.length > 0) && (
        <div className="w-full">
          <TableUpload
            columns={[
              { id: "slNo", label: "Sl. No", minWidth: 50 },
              { id: "name", label: "File Name", minWidth: 170 },
              { id: "pageCount", label: "Page Count", minWidth: 100 },
              { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
            ]}
            rows={files.map((file, index) => ({
              ...file,
              slNo: index + 1,
            }))}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            handleEditClick={handleFileDelete}
            handleDeleteSelected={handleDeleteSelected}
            // projectName={selectedProject.name}
          />
        </div>
      )}

      {/* ---------------------------
            Floating Action Button + Menu
           --------------------------- */}
      <div className="fixed bottom-8 right-8 z-40">
        <Fab
          color="primary"
          aria-haspopup="true"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
            "&:hover": {
              background: "linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)",
              transform: "scale(1.05)",
            },
            transition: "all 0.3s ease-in-out",
          }}
        >
          <AddIcon />
        </Fab>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: 2,
              marginBottom: 1,
              boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .1)",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setIsCreateFolderModalOpen(true);
              setAnchorEl(null);
            }}
            disabled={
              files.length > 0 || (folders.length == 0 && projectFileCount > 0)
            }
            sx={{
              minWidth: 200,
              "&:hover": {
                backgroundColor: "rgba(33, 150, 243, 0.08)",
              },
            }}
          >
            <FolderIcon sx={{ mr: 1 }} />
            Create New Folder
          </MenuItem>

          <MenuItem
            onClick={() => document.getElementById("file-upload").click()}
            disabled={
              (currentFolder && currentFolder.children?.length > 0) ||
              (!currentFolder && folders.length > 0)
            }
            sx={{
              minWidth: 200,
              "&:hover": {
                backgroundColor: "rgba(33, 150, 243, 0.08)",
              },
            }}
          >
            <UploadFile sx={{ mr: 1 }} />
            Upload Files
          </MenuItem>
          <input
            type="file"
            multiple
            accept="application/pdf"
            id="file-upload"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </Menu>
      </div>

      {/* ---------------------------
            Create Folder Modal
           --------------------------- */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
            <input
              type="text"
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateFolder}
              >
                Create
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setIsCreateFolderModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFolderView;
