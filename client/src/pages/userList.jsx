
import React, { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from "@mui/material";
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs } from "firebase/firestore";
import Loader from "../components/common/Loader";

const UserList = ({ companyId }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const usersQuery = query(
          collection(db, "users"),
          where("companyId", "==", companyId)
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort active users first, followed by disabled users
        const sortedUsers = [
          ...usersData.filter((user) => !user.disabled),
          ...usersData.filter((user) => user.disabled),
        ];
        setUsers(sortedUsers);

        const rolesSnapshot = await getDocs(collection(db, "roles"));
        const rolesData = rolesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching users and roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndRoles();
  }, [companyId]);

  if (loading) {
    return <Loader />;
  }

  const activeUsers = users.filter(user => !user.disabled);
  const disabledUsers = users.filter(user => user.disabled);

  return (
    <div className="h-screen overflow-y-auto mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-purple-100">
          <div className="flex items-center mb-4">
            <PeopleIcon className="text-purple-600 mr-2 text-3xl" />
            <Typography 
              variant="h4" 
              className="text-2xl font-bold text-purple-800"
            >
              Users
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PeopleIcon className="text-purple-500 mr-2" />
                  <span className="text-purple-600 font-medium">Total Users</span>
                </div>
                <span className="text-2xl font-bold text-purple-700">{users.length}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircleIcon className="text-green-500 mr-2" />
                  <span className="text-purple-600 font-medium">Active Users</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{activeUsers.length}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CancelIcon className="text-pink-500 mr-2" />
                  <span className="text-purple-600 font-medium">Disabled Users</span>
                </div>
                <span className="text-2xl font-bold text-pink-600">{disabledUsers.length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <TableContainer component={Paper} elevation={0} className="bg-transparent">
          <Table className="min-w-full">
            <TableHead>
              <TableRow className="bg-purple-100">
                <TableCell className="px-6 py-4 font-semibold text-purple-800">
                  <div className="flex items-center">
                    <EmailIcon className="mr-2 text-purple-600" />
                    Email
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 font-semibold text-purple-800">
                  <div className="flex items-center">
                    <PersonIcon className="mr-2 text-purple-600" />
                    User Name
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 font-semibold text-purple-800">
                  <div className="flex items-center">
                    <BadgeIcon className="mr-2 text-purple-600" />
                    Role
                  </div>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className={`
                    border-b border-purple-50 transition duration-200 ease-in-out
                    ${user.disabled 
                      ? 'bg-gray-100 hover:bg-gray-200' 
                      : 'hover:bg-purple-50'
                    }
                  `}
                >
                  <TableCell 
                    className={`px-6 py-4 ${user.disabled ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell 
                    className={`px-6 py-4 ${user.disabled ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{user.name}</span>
                      {user.disabled && (
                        <Chip
                          label="Disabled"
                          size="small"
                          className="bg-pink-100 text-pink-700 ml-2"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell 
                    className={`px-6 py-4 ${user.disabled ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                      ${user.disabled 
                        ? 'bg-gray-50 text-gray-600' 
                        : 'bg-purple-100 text-purple-800'
                      }
                    `}>
                      {roles.find((role) => role.id === user.roleId)?.name || "Unknown Role"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default UserList;