
import React, { useState, useEffect } from "react";
import KyroSidebar from "../../components/Kyrotics/KyroSidebar";
import { fetchQAProjectsCount } from "../../services/projectServices";
import FolderIcon from "@mui/icons-material/Folder";
import ArticleIcon from "@mui/icons-material/Article";
import { fetchUserNameById } from "../../utils/auth";
import Loader from "../../components/common/Loader";

const QAHome = ({ companyId, userId }) => {
  const [userName, setUserName] = useState("");
  const [projectCounts, setProjectCounts] = useState({
    pendingCount: 0,
    completedCount: 0,
    pendingPages: 0,
    completedPages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const userName = await fetchUserNameById(userId);
        setUserName(userName);
        const counts = await fetchQAProjectsCount();
        setProjectCounts(counts);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex overflow-y-auto h-screen">
      <KyroSidebar companyId={companyId} role={"QA"} />
      <div className="flex-1 p-6 lg:p-12">
        {/* Welcome Section */}
        <div className="backdrop-blur-sm shadow-xl bg-[#e3d2fa]/[0.6] mt-10 rounded-xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold py-5">
                Hi, {userName}! 👋
              </h1>
              <p className="py-4 text-md">
                Welcome to your daily tasks. Let's get you started for the day!
              </p>
            </div>
            <img
              src="user.png"
              alt="user"
              className="w-40 lg:w-64"
            />
          </div>
        </div>

        {/* Project Counts Section */}
        <div className="backdrop-blur-sm shadow-xl bg-white/30 mt-10 rounded-xl p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
            {/* Pending Works */}
            <div className="flex flex-col items-center gap-5">
              <p className="text-xl font-bold">Pending Works</p>
              <div
                className="h-24 w-1/3 rounded-xl text-center flex justify-center items-center text-3xl text-red-500 font-bold"
                style={{ background: "rgba(249, 145, 145, 0.5)" }}
              >
                <FolderIcon className="mr-4" />
                {projectCounts.pendingCount}
              </div>
              <div
                className="h-24 w-1/3 rounded-xl text-center flex justify-center items-center text-3xl text-red-500 font-bold"
                style={{ background: "rgba(249, 145, 145, 0.5)" }}
              >
                <ArticleIcon className="mr-4" />
                {projectCounts.pendingPages}
              </div>
            </div>

            {/* Completed Works */}
            <div className="flex flex-col items-center gap-5">
              <p className="text-xl font-bold">Completed Works</p>
              <div
                className="h-24 w-1/3 rounded-xl text-center flex justify-center items-center text-3xl text-green-500 font-bold"
                style={{ background: "rgba(191, 249, 191, 0.5)" }}
              >
                <FolderIcon className="mr-4" />
                {projectCounts.completedCount}
              </div>
              <div
                className="h-24 w-1/3 rounded-xl text-center flex justify-center items-center text-3xl text-green-500 font-bold"
                style={{ background: "rgba(191, 249, 191, 0.5)" }}
              >
                <ArticleIcon className="mr-4" />
                {projectCounts.completedPages}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAHome;
