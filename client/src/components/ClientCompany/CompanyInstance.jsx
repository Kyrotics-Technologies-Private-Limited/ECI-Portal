import React, { useState, useEffect } from "react";
import { useParams, Route, Routes } from "react-router-dom";
import Sidebar from "./Sidebar";
import ProjectList from "../../pages/ProjectList";
import PermissionsManage from "../../pages/PemissionManage";
import RoleManage from "../../pages/RoleManage";
import UserList from "../../pages/userList";
import UploadDocument from "./UploadDocument";
import AdminFileFlow from "./AdminFileFlow";
import Profile from "../../pages/Profile";
import UserFileFlow from "./UserFileFlow";
import UserFileAssign from "./UserFileAssign";
import Register from "../../pages/auth/Register";
import KyroSidebar from "../Kyrotics/KyroSidebar";
import UserManage from "../../pages/UserManage";
import ClientUserReport from "../reports/ClientUserReport";
import AdminHome from "../../pages/Admin/AdminHome";
import { kyroCompanyId } from "../../services/companyServices";
import InstanceIndicator from "../common/InstanceIndicator"; // Add this


const CompanyInstance = ({ role }) => {
  const { companyId } = useParams();
  // console.log(companyId);
  const [companyName, setCompanyName] = useState()
  const [kyroId, setKyroId] = useState()

  useEffect(() => {
    const fetchKyroticsCompanyId = async () => {
      try {
        const kyroId = await kyroCompanyId();
        setKyroId(kyroId);
      } catch (err) {
        console.error(err);
      }
    };

    fetchKyroticsCompanyId();
  }, []);



  return (
    <div className="flex">
      <InstanceIndicator />

      {/* {companyId == kyroId ? <KyroSidebar companyId={companyId} role={role} /> : <Sidebar companyId={companyId} role={role} />} */}
      {companyId === 'jpG7fAhdeGKAOzgCiaK5' ? <KyroSidebar companyId={companyId} role={role} /> : <Sidebar companyId={companyId} role={role} />}

      <div className="flex-grow">
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/myWork" element={<UserFileFlow />} />

          {role === "superAdmin" && (

            <>
              <Route
                path="/register"
                element={<Register instanceCompanyId={companyId} />}
              />
              <Route
                path="/report"
                element={<AdminHome companyId={companyId} />}
              />

              <Route
                path="userManage"
                element={<UserManage companyId={companyId} />}
              />
            </>
          )}

          <Route path="project" element={<ProjectList />} />
          {role === "user" && (
            <>
              <Route path="/project/:projectId" element={<UserFileAssign />} />
            </>
          )}

          {role !== "user" && (
            <>
              {/* <Route path="project/:projectId" element={<AdminDocs />} /> */}
              <Route path="project/:projectId" element={<AdminFileFlow />} />
              <Route path="uploadDocument" element={<UploadDocument />} />
              <Route path="permissionManage" element={<PermissionsManage />} />
              <Route path="roleManage" element={<RoleManage />} />
              <Route path="userReport" element={<ClientUserReport companyId={companyId} />} />
              <Route
                path="userList"
                element={<UserList companyId={companyId} />}
              />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default CompanyInstance;
