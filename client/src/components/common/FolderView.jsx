import React, { useState, useEffect, useCallback } from "react";
import {
  fetchProjectFolders,
} from "../../services/folderServices";
import {
  Breadcrumbs,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Loader from "../common/Loader";
import { FolderList } from "../common/FolderList";
import {
  fetchProjectFilesByFolder,
  fetchProjectFiles,
} from "../../services/projectServices";
import { Link, useParams } from "react-router-dom";
import AdminFileFlow from "../ClientCompany/AdminFileFlow";
import { kyroCompanyId } from "../../services/companyServices";
import { useAuth } from "../../context/AuthContext";
import KyroAdminFileFlow from "../Kyrotics/KyroAdminFileFlow";
import KyroUserFileAssign from "../Kyrotics/KyroUserFileAssign";
import UserFileAssign from "../ClientCompany/UserFileAssign";
import QAWorkspace from "../../pages/QA/QAWorkspace";
import { useInstance } from "../../context/InstanceContext";

const FolderView = ({ project, onBack }) => {
  const { companyId } = useParams();
  const { currentUser } = useAuth();
  const { isKyroInstance, isClientInstance, kyroId } = useInstance();
  
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetchedFolders, setHasFetchedFolders] = useState(false);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const { folders } = await fetchProjectFolders(project.id);
      setFolders(folders || []);
      setError(null);
      setHasFetchedFolders(true);
    } catch (err) {
      setError(err.message || "Failed to fetch folders");
      setHasFetchedFolders(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolderFiles = useCallback(async () => {
    const files = await fetchProjectFilesByFolder(project.id, currentFolder.id);
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

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    setBreadcrumbs((prev) => [...prev, folder]);
    setFiles(folder.files || []);
  };

  const handleBackClick = (index = null) => {
    if (index !== null) {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      const newCurrentFolder =
        newBreadcrumbs[newBreadcrumbs.length - 1] || null;
      setCurrentFolder(newCurrentFolder);
      setFiles(newCurrentFolder?.files || []);
    } else if (currentFolder) {
      const parentFolder = breadcrumbs[breadcrumbs.length - 2] || null;
      setBreadcrumbs((prev) => prev.slice(0, -1));
      setCurrentFolder(parentFolder);
      setFiles(parentFolder?.files || []);
    } else {
      onBack();
    }
  };

  const getFileFlowComponent = () => {
    const { roleName } = currentUser || {};
    const commonProps = { companyId, projectId: project.id };
    
    // For superAdmin, use instance type to determine component
    if (roleName === 'superAdmin') {
      if (isKyroInstance) {
        return <KyroAdminFileFlow {...commonProps} />;
      } else if (isClientInstance) {
        return <AdminFileFlow {...commonProps} />;
      }
    }
    
    // For QA users
    if (roleName === 'QA') {
      return <QAWorkspace {...commonProps} />;
    }
    
    // For regular users
    if (roleName === 'user') {
      if (isKyroInstance) {
        return <KyroUserFileAssign {...commonProps} />;
      } else {
        return <UserFileAssign {...commonProps} />;
      }
    }
    
    // For admin users
    if (isKyroInstance) {
      return <KyroAdminFileFlow {...commonProps} />;
    } else {
      return <AdminFileFlow {...commonProps} />;
    }
  };

  return (
    <div className="flex flex-col items-center h-full">
      {/* Breadcrumbs */}
      <div className="w-full mb-4 flex items-center justify-between">
        <Breadcrumbs
          separator="›"
          aria-label="breadcrumb"
          className="w-full mb-4"
        >
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

        <IconButton onClick={() => handleBackClick()}>
          <ArrowBackIcon fontSize="large" />
        </IconButton>
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

      {/* File content component */}
      {hasFetchedFolders && (folders.length === 0 || files.length > 0) && (
        <div className="w-full">{getFileFlowComponent()}</div>
      )}
    </div>
  );
};

export default FolderView;