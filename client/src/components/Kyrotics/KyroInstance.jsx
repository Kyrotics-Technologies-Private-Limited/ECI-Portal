import React, { useState, useEffect } from "react";
import { useParams, Route, Routes } from "react-router-dom";
import PermissionsManage from "../../pages/PemissionManage";
import RoleManage from "../../pages/RoleManage";
import UserManage from "../../pages/UserManage";
import KyroSidebar from "./KyroSidebar";
import Profile from "../../pages/Profile";
import ClientCompanies from "./ClientCompanies";
import KyroAdminFileFlow from "./KyroAdminFileFlow";
import KyroUserFileAssign from "./KyroUserFileAssign";
import KyroUserWorkspace from "./KyroUserWorkspace";
import QAWorkspace from "../../pages/QA/QAWorkspace";
import FileStatusManager from "../FileStatusManager";
import Register from "../../pages/auth/Register";
import KyroAdminHome from "../../pages/Admin/KyroticsAdminHome";
import UserReport from "../reports/UserReport";
import UserList from "../../pages/userList";
import ProjectList from "../../pages/ProjectList";
import { useAuth } from "../../context/AuthContext";
import InstanceIndicator from "../common/InstanceIndicator"; // Add this


export default function KyroInstance({ role }) {
  const [userCompanyId, setUserCompanyId] = useState("");

  let { companyId } = useParams();

  
  
  const { currentUser } = useAuth();
  useEffect(() => {
    setUserCompanyId(currentUser?.companyId);
  }, [currentUser]);
  // console.log("current", currentUser);
  
  if(role === "user"){
    companyId= currentUser?.companyId;
  }
  return (
    <div className="flex">
      <InstanceIndicator /> 
      <KyroSidebar companyId={companyId} role={role} />
      <div className="flex-grow">
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="project" element={<ProjectList />} />
          <Route
            path="clientCompanies"
            element={<ClientCompanies companyId={userCompanyId} />}
          />

          {role === "user" && (
            <>
              <Route path="/myWork" element={<KyroUserWorkspace />} />
              <Route
                path="project/:projectId"
                element={<KyroUserFileAssign />}
              />
            </>
          )}
          {role === "QA" && (
            <>
              <Route path="project/:projectId" element={<QAWorkspace />} />
            </>
          )}

          {role !== "user" && role !== "QA" && (
            <>
              <Route
                path="project/:projectId"
                element={<KyroAdminFileFlow />}
              />
              {/* <Route path="clientCompanies" element={<ClientCompanies />} /> */}
              <Route path="permissionManage" element={<PermissionsManage />} />
              <Route path="roleManage" element={<RoleManage />} />
              <Route path="fileStatus" element={<FileStatusManager />} />
              <Route path="userReport" element={<UserReport />} />

              <Route
                path="userList"
                element={<UserList companyId={userCompanyId} />}
              />
            </>
          )}
          {role === "superAdmin" && (
            <>
              <Route
                path="/register"
                element={<Register instanceCompanyId={companyId} />}
              />
              <Route
                path="/report"
                element={<KyroAdminHome instanceCompanyId={companyId} />}
              />
              <Route
                path="userManage"
                element={<UserManage companyId={companyId} />}
              />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}
