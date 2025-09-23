
import React, { useState, useEffect } from "react";
import axios from "axios";
import UploadFolderView from "./UploadFolderView";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import { server } from "../../main";
import Loader from "../common/Loader";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import FolderIcon from "@mui/icons-material/Folder";
import { GridIcon, ListIcon } from "lucide-react";

const UploadDocument = () => {
  const { companyId } = useParams();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const { currentUser } = useAuth();
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${server}/api/project/${companyId}/getprojects`
        );
        setProjects(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [companyId]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  const newProject = async () => {
    try {
      const response = await axios.post(
        `${server}/api/project/createProject`,
        {
          name: newProjectName,
          companyId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setProjects([...projects, response.data]);
      setIsModalOpen(false);
      setNewProjectName("");
      toast.success("Project created successfully!");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create project. Try again.";
      toast.error(message);
    }
  };

  return (
    <div className="h-screen overflow-y-auto backdrop-blur-sm bg-white/30">
      <div className="max-w-[80vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && <Loader />}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-700">Error: {error.message}</p>
          </div>
        )}

        {!selectedProject && (
          <>
            {/* View toggle buttons */}
            {projects.length > 0 && (
              <div className="flex justify-end gap-2 mb-4">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-2 rounded-lg ${
                    isGridView
                      ? "bg-indigo-100 text-indigo-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <GridIcon size={20} />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-2 rounded-lg ${
                    !isGridView
                      ? "bg-indigo-100 text-indigo-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <ListIcon size={20} />
                </button>
              </div>
            )}

            <div
              className={`mt-10 ${
                isGridView
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4 max-w-6xl mx-auto"
              }`}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`backdrop-blur-md bg-indigo-200/30 rounded-lg border border-white/40 shadow-sm 
                    hover:bg-indigo-100/20 hover:border-blue-500 hover:shadow-md transition-all duration-200 
                    cursor-pointer group`}
                >
                  <div className={`p-6 ${!isGridView && "flex items-center"}`}>
                    <div
                      className={`flex ${
                        isGridView ? "items-center" : "items-center"
                      } space-x-4`}
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-white/40 flex items-center justify-center group-hover:bg-blue-100/50 transition-colors duration-200">
                          <FolderIcon
                            sx={{
                              fontSize: 28,
                              color: "rgb(59 130 246)",
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {project.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Fab
              variant="extended"
              color="primary"
              size="large"
              sx={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: 1000,
                width: "auto",
                height: "56px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontSize: "16px",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
                },
                transition: "all 0.2s ease-in-out",
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <AddIcon sx={{ mr: 1 }} />
              New Project
            </Fab>
          </>
        )}

        {selectedProject && (
          <UploadFolderView project={selectedProject} onBack={handleBack} />
        )}

        {/* Create Project Modal */}
        {isModalOpen && (
          <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <Toaster position="top-center" />
            <div className="fixed inset-0 flex items-center justify-center">
              <DialogPanel className="backdrop-blur-md bg-white/90 rounded-xl shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
                <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
                  Create New Project
                </DialogTitle>
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={newProject}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default UploadDocument;
