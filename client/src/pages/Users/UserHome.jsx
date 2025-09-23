import React, { useEffect, useState } from "react";
import Sidebar from "../../components/ClientCompany/Sidebar";
import { fetchUserNameById } from "../../utils/auth";
import { fetchClientUserProjectsCount } from "../../services/projectServices";
import FolderIcon from "@mui/icons-material/Folder";
import ArticleIcon from "@mui/icons-material/Article";



const UserHome = ({ companyId, userId })=> {
  const [userName, setUserName] = useState("");
  const [projectCounts, setProjectCounts] = useState({
    pendingCount: 0,
    completedCount: 0,
    underReviewCount: 0,
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const userName = await fetchUserNameById(userId);
        setUserName(userName);

        const counts = await fetchClientUserProjectsCount(userId);
        setProjectCounts(counts);
        // console.log(projectCounts);
      } catch (error) {
        console.error("Error loading user project counts:", error);
      }
    };

    fetchContent();
  }, [userId]);
  return (
    <div className="flex">
      <Sidebar companyId={companyId} role={"user"} />
      <div className="flex-1 p-4">
        <div className="backdrop-blur-sm shadow-xl bg-[#e3d2fa]/[0.6]  mt-10 rounded-xl p-6">
          <div className="flex justify-between">
            <div className="my-auto">
              <h1 className="text-3xl font-bold py-5">
                Hi ! &nbsp;{userName}&nbsp; &nbsp;👋 ,
              </h1>
              <p className="py-4 text-md">
                Welcome to your daily tasks. Let's get you started for the day!
              </p>
            </div>
            <img src="user.png" alt="user" className="w-80" />
          </div>
        </div>

        <div className="backdrop-blur-sm shadow-xl bg-white/30 mt-10 rounded-xl mx-auto">

           <div className="flex justify-center gap-60 p-10">
            <div className="flex flex-col items-center p-5 gap-5 ">
              <div className=" ">
                <p className="text-xl font-bold">Pending Works</p>
              </div>
              <div
                className="h-24 rounded-xl text-center flex justify-center items-center text-3xl text-red-500 font-bold"
                style={{ background: "rgba(249, 145, 145, 0.5)" }}
              >
                <div className="px-6">
                  <FolderIcon className="mr-4" />
                  {projectCounts.pendingCount}
                </div>
              </div>
              <div
                className="h-24 rounded-xl text-center flex justify-center items-center text-3xl text-red-500 font-bold"
                style={{ background: "rgba(249, 145, 145, 0.5)" }}
              >
                <div className="px-6">
                  <ArticleIcon className="mr-4" />
                  {projectCounts.pendingPages}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center p-5 gap-5">
              <div className=" ">
                <p className="text-xl font-bold">Completed Works</p>
              </div>
              <div
                className="h-24 rounded-xl text-center flex justify-center items-center text-3xl text-green-500 font-bold"
                style={{ background: "rgba(191, 249, 191, 0.5)" }}
              >
                <div className="px-6">
                  <FolderIcon className="mr-4" />
                  {projectCounts.completedCount}
                </div>
              </div>
              <div
                className="h-24 rounded-xl text-center flex justify-center items-center text-3xl text-green-500 font-bold"
                style={{ background: "rgba(191, 249, 191, 0.5)" }}
              >
                <div className="px-6">
                  <ArticleIcon className="mr-4" />
                  {projectCounts.completedPages}
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

export default UserHome;