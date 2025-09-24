import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { handleSignOut } from "../../utils/auth";
import logo from "../../assets/logo.png";
import HomeIcon from "@mui/icons-material/Home";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import StorageTwoToneIcon from "@mui/icons-material/StorageTwoTone";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ConfirmationDialog from "../ConfirmationDialog";
import { Description, Dashboard } from "@mui/icons-material";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ManageHistoryRoundedIcon from '@mui/icons-material/ManageHistoryRounded';
import { Collapse } from "@mui/material";
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';


export default function KyroSidebar({ companyId, role }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  const isActive = (path) => location.pathname === path;

  return (
    <div className="backdrop-blur-sm shadow-xl h-screen bg-white/30">
      <div
        className={`flex flex-col justify-between transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative w-64 h-full z-10`}
      >
        <div className="py-6 px-4">
          {/* <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="h-20 w-auto" />
          </div> */}
          <div className="flex justify-center pt-6 text-2xl font-bold text-indigo-600">DMS-PORTAL </div>
          <ul className="mt-12 space-y-3  ">
            <li>
              <Link
                to="/home"
                className={`block rounded-lg justify-center  px-4 py-3 text-md font-semibold ${isActive("/home")
                  ? "bg-[#e3d2fa] text-gray-700"
                  : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                  }`}
              >
                <HomeIcon className="mr-5" />
                Home
              </Link>
            </li>
            {/* <li>
              <Link
                to={`/kyro/${companyId}/clientCompanies`}
                className={`block rounded-lg px-4 py-3 text-md font-medium ${isActive(`/kyro/${companyId}/clientCompanies`)
                  ? "bg-[#e3d2fa] text-gray-700"
                  : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                  }`}
              >
                <FolderCopyIcon className="mr-5" />
                Judgements
              </Link>
            </li> */}
            <li>
              <Link
                to={`/kyro/${companyId}/clientCompanies`}
                className={`block rounded-lg px-4 py-3 text-md font-medium ${isActive(`/kyro/${companyId}/clientCompanies`) || isActive(`/kyro/${companyId}/project`)
                    ? "bg-[#e3d2fa] text-gray-700"
                    : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                  }`}
              >
                <FolderCopyIcon className="mr-5" />
                Judgements
              </Link>
            </li>

            {role === "user" && (
              <>
                <li>
                  <Link
                    to={`/kyro/${companyId}/mywork`}
                    className={`block rounded-lg px-4 py-3 text-md font-medium ${isActive(`/kyro/${companyId}/mywork`)
                      ? "bg-[#e3d2fa] text-gray-700"
                      : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                      }`}
                  >
                    <StorageTwoToneIcon className="mr-5" />
                    My Work
                  </Link>
                </li>
              </>
            )}



            {(role === "admin" || role === "superAdmin") && (
              <>

                <li>
                  <Link
                    to={`/kyro/${companyId}/fileStatus`}
                    className={`block rounded-lg pl-2 py-3 text-md font-medium ${isActive(`/kyro/${companyId}/fileStatus`)
                      ? "bg-[#e3d2fa] text-gray-700"
                      : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                      }`}
                  >
                    <ManageHistoryRoundedIcon className="mr-5" />
                    File Status
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/kyro/${companyId}/userReport`}
                    className={`block rounded-lg px-4 py-3 text-md font-medium ${isActive(`/kyro/${companyId}/userReport`)
                      ? "bg-[#e3d2fa] text-gray-700"
                      : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                      }`}
                  >
                    <AssignmentTurnedInIcon className="mr-5" />
                    User Report
                  </Link>
                </li>


              </>
            )}

            {role === "admin" && (
              <li>
                <Link
                  to={`/kyro/${companyId}/userList`}
                  className={`block rounded-lg px-4 py-3 text-md font-medium ${isActive(`/company/${companyId}/register`)
                    ? "bg-[#e3d2fa] text-gray-700"
                    : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                    }`}
                >
                  <PeopleRoundedIcon className="mr-5" />
                  Users
                </Link>
              </li>
            )}
            {role === "superAdmin" && (
              <li>
                <Link
                  to={`/kyro/${companyId}/report`}
                  className={`block rounded-lg px-4 py-3 text-md font-medium ${isActive(`/kyro/${companyId}/report`)
                    ? "bg-[#e3d2fa] text-gray-700"
                    : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                    }`}
                >
                  <Description className="mr-5" />
                  Project Report
                </Link>
              </li>
            )}
            {role === "superAdmin" && (

              <>

                <div
                  className="flex justify-between rounded-lg px-4 py-3 mb-3 text-md font-medium text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <div>
                    <SettingsIcon className="mr-5" />
                    More
                  </div>
                  {showSettings ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </div>
                <Collapse in={showSettings} timeout="auto" unmountOnExit className="border-l-4 ml-6">
                  <ul className="space-y-2">

                    <li>
                      <Link
                        to={`/kyro/${companyId}/register`}
                        className={`block rounded-lg px-4 py-3 text-md font-medium ${isActive(`/company/${companyId}/register`)
                          ? "bg-[#e3d2fa] text-gray-700"
                          : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                          }`}
                      >
                        <PersonAddAltRoundedIcon className="mr-5" />
                        Register
                      </Link>
                    </li>

                    <li>
                      <Link
                        to={`/kyro/${companyId}/userManage`}
                        className={`block rounded-lg ml-3 pl-2 py-3 text-md font-medium ${isActive(`/kyro/${companyId}/userManage`)
                          ? "bg-[#e3d2fa] text-gray-700"
                          : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                          }`}
                      >
                        <ManageAccountsIcon className="mr-5" />
                        Manage Users
                      </Link>
                    </li>

                    <li>
                      <Link
                        to={`/kyro/${companyId}/roleManage`}
                        className={`block rounded-lg ml-3 pl-2 py-3 text-md font-medium ${isActive(`/kyro/${companyId}/roleManage`)
                          ? "bg-[#e3d2fa] text-gray-700"
                          : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                          }`}
                      >
                        <AdminPanelSettingsRoundedIcon className="mr-5" />
                        Manage Roles
                      </Link>
                    </li>

                    {/* <li>
                  <Link
                    to={`/kyro/${companyId}/permissionManage`}
                    className={`block rounded-lg px-4 py-3 text-md font-medium ${
                      isActive(`/kyro/${companyId}/permissionManage`)
                        ? "bg-[#e3d2fa] text-gray-700"
                        : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                    }`}
                  >
                    <RoomPreferencesIcon className="mr-3" />
                    Manage Permissions
                  </Link>
                </li> */}


                  </ul>
                </Collapse>

              </>
            )}

            <li>
              <Link
                to={`/kyro/${companyId}/profile`}
                className={`block rounded-lg px-4 py-3 text-md font-medium ${isActive(`/kyro/${companyId}/profile`)
                  ? "bg-[#e3d2fa] text-gray-700"
                  : "text-gray-500 hover:bg-[#e3d2fa] hover:text-gray-700"
                  }`}
              >
                <PersonIcon className="mr-5" />
                Profile
              </Link>
            </li>

            <li>
              <button
                onClick={handleOpenDialog}
                className="w-full rounded-lg px-4 py-3 text-md font-medium text-gray-500 [text-align:_inherit] bg-[#fffff] hover:bg-[#d00000] hover:text-white"
              >
                <LogoutIcon className="mr-5" />
                Logout
              </button>
            </li>
          </ul>
        </div>

        <ConfirmationDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          handleConfirm={handleSignOut}
          title="Confirm Logout"
          message="Are you sure you want to logout?"
        />
      </div>
      <div className="md:hidden">
        <button className="bg-[#e3d2fa] text-white" onClick={toggleSidebar}>
          Toggle
        </button>
      </div>
    </div>
  );
}
