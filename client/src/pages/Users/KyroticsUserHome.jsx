
import React, { useEffect, useState } from "react";
import KyroSidebar from "../../components/Kyrotics/KyroSidebar";
import { fetchUserNameById } from "../../utils/auth";
import { fetchUserProjectsCount } from "../../services/projectServices";
import FolderIcon from "@mui/icons-material/Folder";
import ArticleIcon from "@mui/icons-material/Article";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { format } from "date-fns";

export default function KyroticsUserHome({ companyId, userId }) {
  const today = format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd");
  const [userName, setUserName] = useState("");
  const [projectCounts, setProjectCounts] = useState({
    pendingCount: 0,
    completedCount: 0,
    underReviewCount: 0,
  });
  const [completedDateRange, setCompletedDateRange] = useState({
    start: today,
    end: today,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const userName = await fetchUserNameById(userId);
        setUserName(userName);

        const startDate = new Date(completedDateRange.start).setHours(
          0,
          0,
          0,
          0
        );
        const endDate = new Date(completedDateRange.end).setHours(0, 0, 0, 0);
        const counts = await fetchUserProjectsCount(userId, startDate, endDate);
        setProjectCounts(counts);
      } catch (error) {
        console.error("Error loading user project counts:", error);
      }
    };

    fetchContent();
  }, [userId, completedDateRange]);

  return (
    <div className="flex">
      <KyroSidebar companyId={companyId} role={"user"} />
      <div className="flex-1 p-4 h-screen overflow-y-auto">
        <div className="backdrop-blur-sm shadow-xl bg-[#e3d2fa]/[0.6]  mt-2 rounded-xl p-6">
          <div className="flex justify-between">
            <div className="my-auto">
              <h1 className="text-3xl font-bold py-4">
                Hi ! &nbsp;{userName}&nbsp; &nbsp;👋 ,
              </h1>
              <p className="py-4 text-md">
                Welcome to your daily tasks. Let's get you started for the day!
              </p>
            </div>
            <img src="user.png" alt="user" className="w-80" />
          </div>
        </div>


        {/* Date Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 my-6 shadow-lg border border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <CalendarMonthIcon className="text-indigo-500 text-2xl" />
            <h2 className="text-lg font-semibold text-gray-800">Filter by Date Range</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                From
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={completedDateRange.start}
                  onChange={(e) =>
                    setCompletedDateRange({
                      ...completedDateRange,
                      start: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-indigo-200 rounded-xl 
                       text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:border-transparent 
                       transition-all duration-200 hover:border-indigo-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-8 h-[2px] bg-indigo-200 hidden md:block"></div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                To
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={completedDateRange.end}
                  onChange={(e) =>
                    setCompletedDateRange({
                      ...completedDateRange,
                      end: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-indigo-200 rounded-xl 
                       text-gray-700 focus:ring-2 focus:ring-indigo-400 focus:border-transparent 
                       transition-all duration-200 hover:border-indigo-300"
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            View project statistics for your selected time period
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Pending Works */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-red-300">
            <h3 className="text-xl font-bold text-red-500 mb-4 text-center">
              Pending Works
            </h3>
            <div className="space-y-4">
              <div className="bg-red-100/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FolderIcon className="text-red-500 mr-2" />
                  <span className="text-gray-600">Judgements</span>
                </div>
                <span className="text-2xl font-bold text-red-500">
                  {projectCounts.pendingCount}
                </span>
              </div>
              <div className="bg-red-100/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <ArticleIcon className="text-red-500 mr-2" />
                  <span className="text-gray-600">Pages</span>
                </div>
                <span className="text-2xl font-bold text-red-500">
                  {projectCounts.pendingPages}
                </span>
              </div>
            </div>
          </div>

          {/* Under Review */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-yellow-300">
            <h3 className="text-xl font-bold mb-4 text-center text-yellow-500">
              Under Review
            </h3>
            <div className="space-y-4">
              <div className="bg-yellow-100/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FolderIcon className="text-yellow-500 mr-2" />
                  <span className="text-gray-600">Judgements</span>
                </div>
                <span className="text-2xl font-bold text-yellow-500">
                  {projectCounts.underReviewCount}
                </span>
              </div>
              <div className="bg-yellow-100/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <ArticleIcon className="text-yellow-500 mr-2" />
                  <span className="text-gray-600">Pages</span>
                </div>
                <span className="text-2xl font-bold text-yellow-500">
                  {projectCounts.underReviewPages}
                </span>
              </div>
            </div>
          </div>

          {/* Completed Works */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-green-300">
            <h3 className="text-xl font-bold text-green-500 mb-4 text-center">
              Completed Works
            </h3>
            <div className="space-y-4">
              <div className="bg-green-100/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FolderIcon className="text-green-500 mr-2" />
                  <span className="text-gray-600">Judgements</span>
                </div>
                <span className="text-2xl font-bold text-green-500">
                  {projectCounts.completedCount}
                </span>
              </div>
              <div className="bg-green-100/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <ArticleIcon className="text-green-500 mr-2" />
                  <span className="text-gray-600">Pages</span>
                </div>
                <span className="text-2xl font-bold text-green-500">
                  {projectCounts.completedPages}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

