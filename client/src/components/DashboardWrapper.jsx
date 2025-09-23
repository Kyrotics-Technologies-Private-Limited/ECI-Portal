import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import UserHome from "../pages/Users/UserHome";
import AdminHome from "../pages/Admin/AdminHome";
import SuperAdminHome from "../pages/SuperAdmin/SuperAdminHome";
import QAHome from "../pages/QA/QAHome";
import KyroticsUserHome from "../pages/Users/KyroticsUserHome";
import KyroticsAdminHome from "../pages/Admin/KyroticsAdminHome";
import { kyroCompanyId } from "../services/companyServices";
import Loader from "./common/Loader";

const DashboardWrapper = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kyroId, setKyroId] = useState();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        const { roleName, companyId, user_id } = token.claims;
        setUser(user);
        setUserId(user_id);
        setRole(roleName);
        setCompanyId(companyId);
      } else {
        setUser(null);
        setRole(null); // Reset role when user logs out
        setCompanyId(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  // console.log("role in dashboard", role);

  if (loading || role === null || companyId === null) {
    return <Loader/>; 
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (companyId === kyroId) {
    if (role === "user") {
      return <KyroticsUserHome userId={userId} userCompanyId={companyId} />;
    }
    if (role === "admin") {
      return <KyroticsAdminHome companyId={companyId} role={role} />;
    }
    if (role === "QA") {
      return <QAHome userId={userId} companyId={companyId} />;
    }
  }

  if (role === "user") {
    return <UserHome userId={userId} companyId={companyId} />;
  }
  if (role === "admin") {
    return <AdminHome companyId={companyId} role={"admin"} />;
  }
  if (role === "superAdmin") {
    return <SuperAdminHome />;
  }

  return <Navigate to="/home" />;
};

export default DashboardWrapper;
