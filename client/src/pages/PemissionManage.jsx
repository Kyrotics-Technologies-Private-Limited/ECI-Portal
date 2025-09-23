// import { server } from '../main'
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Button, TextField, Dialog,
//   DialogActions, DialogContent, DialogContentText, DialogTitle, Select, MenuItem, FormControlLabel,FormControl, InputLabel
// } from '@mui/material';
// import { CheckCircle, Cancel } from '@mui/icons-material';

// const PermissionsManager = () => {
//   const [permissions, setPermissions] = useState({
//     users: { read: false, create: false, update: false, delete: false },
//     documents: { read: false, create: false, update: false, delete: false, assign: false },
//   });

//   const [roles, setRoles] = useState([]);
//   const [selectedRole, setSelectedRole] = useState('');
//   const [allPermissions, setAllPermissions] = useState([]);
//   const [openCreateRoleDialog, setOpenCreateRoleDialog] = useState(false);
//   const [openUpdateRoleDialog, setOpenUpdateRoleDialog] = useState(false);
//   const [newRoleName, setNewRoleName] = useState('');
//   const [isAllowedToDelete, setIsAllowedToDelete] = useState(true);


//   const handleCheckboxChange = (resource, action) => {
//     setPermissions(prevPermissions => ({
//       ...prevPermissions,
//       [resource]: { ...prevPermissions[resource], [action]: !prevPermissions[resource][action] },
//     }));
//   };

//   const fetchRoles = async () => {
//     try {
//       const response = await axios.get(`${server}/api/role/getAllRoles`);
//       setRoles(response.data);
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//     }
//   };

//   const fetchPermissions = async () => {
//     try {
//       const response = await axios.get(`${server}/api/permission/getAllPermissions`);
//       setAllPermissions(response.data);
//     } catch (error) {
//       console.error('Error fetching permissions:', error);
//     }
//   };

//   const createPermission = async () => {
//     try {
//       await axios.post(`${server}/api/permission/createPermission`, { roleId: selectedRole, permissions });
//       fetchPermissions();
//     } catch (error) {
//       console.error('Error creating permission:', error);
//     }
//   };

//   const updatePermission = async () => {
//     try {
//       await axios.put(`${server}/api/permission/updatePermission`, { roleId: selectedRole, permissions });
//       fetchPermissions();
//     } catch (error) {
//       console.error('Error updating permission:', error);
//     }
//   };


//   const disableRole = async (roleId) => {
//     try {
//       const role = roles.find(r => r.id === roleId);
//       if (role.name === 'superAdmin' || role.name === 'admin' || role.name === 'user') {
//         alert('Default roles cannot be disabled');
//         return;
//       }
//       await axios.put(`${server}/api/role/disableRole`, { id: roleId });
//       fetchRoles();
//     } catch (error) {
//       console.error('Error disabling role:', error);
//     }
//   };

//   const createRole = async () => {
//     try {
//       await axios.post(`${server}/api/role/createRole`, { name: newRoleName, isAllowedToDelete });
//       fetchRoles();
//       setOpenCreateRoleDialog(false);
//       setNewRoleName('');
//       setIsAllowedToDelete(true);
//     } catch (error) {
//       console.error('Error creating role:', error);
//     }
//   };

//   const updateRole = async () => {
//     try {
//       await axios.put(`${server}/api/role/updateRole`, { id: selectedRole, name: newRoleName, isAllowedToDelete });
//       fetchRoles();
//       setOpenUpdateRoleDialog(false);
//       setNewRoleName('');
//       setIsAllowedToDelete(true);
//     } catch (error) {
//       console.error('Error updating role:', error);
//     }
//   };

//   useEffect(() => {
//     fetchRoles();
//     fetchPermissions();
//   }, []);

//   const getRoleNameById = (roleId) => {
//     const role = roles.find(r => r.id === roleId);
//     return role ? role.name : roleId;
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Permissions Manager</h1>

//       <div className="mb-3">
//         <FormControl fullWidth>
//           <InputLabel>Select Role</InputLabel>
//           <Select
//             value={selectedRole}
//             onChange={(e) => setSelectedRole(e.target.value)}
//           >
//             <MenuItem value=""><em>Select a role</em></MenuItem>
//             {roles.map((role) => (
//               <MenuItem key={role.id} value={role.id}>
//                 {role.name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </div>

//       <div className="mb-4">
//         <h2 className="text-xl font-semibold mb-2">Users Permissions</h2>
//         {['read', 'create', 'update', 'delete'].map((action) => (
//           <label key={action} className="block mb-2">
//             <Checkbox
//               checked={permissions.users[action]}
//               onChange={() => handleCheckboxChange('users', action)}
//             />
//             <span className="ml-2 capitalize">{action}</span>
//           </label>
//         ))}
//       </div>

//       <div className="mb-4">
//         <h2 className="text-xl font-semibold mb-2">Documents Permissions</h2>
//         {['read', 'create', 'update', 'delete', 'assign'].map((action) => (
//           <label key={action} className="block mb-2">
//             <Checkbox
//               checked={permissions.documents[action]}
//               onChange={() => handleCheckboxChange('documents', action)}
//             />
//             <span className="ml-2 capitalize">{action}</span>
//           </label>
//         ))}
//       </div>

//       <div className="mb-4">
//         <Button variant="contained" color="primary" onClick={createPermission}>
//           Create Permission
//         </Button>
//         <Button variant="contained" color="secondary" onClick={updatePermission} className="ml-4">
//           Update Permission
//         </Button>
//       </div>

//       <div className="mb-4">
//         <Button variant="contained" color="primary" onClick={() => setOpenCreateRoleDialog(true)}>
//           Create Role
//         </Button>
//         <Button variant="contained" color="secondary" onClick={() => setOpenUpdateRoleDialog(true)} className="ml-4">
//           Update Role
//         </Button>
//       </div>

//       <Dialog open={openCreateRoleDialog} onClose={() => setOpenCreateRoleDialog(false)}>
//         <DialogTitle>Create Role</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             To create a new role, please enter the role name and set if it is allowed to be deleted.
//           </DialogContentText>
//           <TextField
//             autoFocus
//             margin="dense"
//             label="Role Name"
//             type="text"
//             fullWidth
//             value={newRoleName}
//             onChange={(e) => setNewRoleName(e.target.value)}
//           />
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={isAllowedToDelete}
//                 onChange={(e) => setIsAllowedToDelete(e.target.checked)}
//               />
//             }
//             label="Allow Deletion"
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenCreateRoleDialog(false)} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={createRole} color="primary">
//             Create
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openUpdateRoleDialog} onClose={() => setOpenUpdateRoleDialog(false)}>
//         <DialogTitle>Update Role</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             To update the selected role, please enter the new role name and set if it is allowed to be deleted.
//           </DialogContentText>
//           <TextField
//             autoFocus
//             margin="dense"
//             label="New Role Name"
//             type="text"
//             fullWidth
//             value={newRoleName}
//             onChange={(e) => setNewRoleName(e.target.value)}
//           />
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={isAllowedToDelete}
//                 onChange={(e) => setIsAllowedToDelete(e.target.checked)}
//               />
//             }
//             label="Allow Deletion"
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenUpdateRoleDialog(false)} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={updateRole} color="primary">
//             Update
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Role</TableCell>
//               <TableCell>Users - Read</TableCell>
//               <TableCell>Users - Create</TableCell>
//               <TableCell>Users - Update</TableCell>
//               <TableCell>Users - Delete</TableCell>
//               <TableCell>Documents - Read</TableCell>
//               <TableCell>Documents - Create</TableCell>
//               <TableCell>Documents - Update</TableCell>
//               <TableCell>Documents - Delete</TableCell>
//               <TableCell>Documents - Assign</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {allPermissions.map((perm) => (
//               <TableRow key={perm.id}>
//                 <TableCell>{getRoleNameById(perm.roleId)}</TableCell>
//                 <TableCell>{perm.permissions.users.read ? <CheckCircle color="success" /> : <Cancel color="error" />}</TableCell>
//                 <TableCell>{perm.permissions.users.create ? <CheckCircle color="success" /> : <Cancel color="error" />}</TableCell>
//                 <TableCell>{perm.permissions.users.update ? <CheckCircle color="success" /> : <Cancel color="error" />}</TableCell>
//                 <TableCell>{perm.permissions.users.delete ? <CheckCircle color="success" /> : <Cancel color="error" />}</TableCell>
//                 <TableCell>{perm.permissions.documents.read ? <CheckCircle color="success" /> : <Cancel color="error" />}</TableCell>
//                 <TableCell>{perm.permissions.documents.create ? <CheckCircle color="success" /> : <Cancel color="error" />}</TableCell>
//                 <TableCell>{perm.permissions.documents.update ? <CheckCircle color="success" /> : <Cancel color="error" />}</TableCell>
//                 <TableCell>{perm.permissions.documents.delete ? <CheckCircle color="success" /> : <Cancel color="error" />}</TableCell>
//                 <TableCell>{perm.permissions.documents.assign ? <CheckCircle color="success" /> : <Cancel color="error" />}</TableCell>
//                 <TableCell>
//                   <Button
//                     variant="contained"
//                     color="secondary"
//                     onClick={() => disableRole(perm.roleId)}
//                     disabled={['superAdmin', 'admin', 'user'].includes(getRoleNameById(perm.roleId))}
//                   >
//                     Disable
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </div>
//   );
// };

// export default PermissionsManager;




import { server } from '../main'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import Sidebar from '../components/ClientCompany/Sidebar';


const PermissionsManager = () => {
  const [permissions, setPermissions] = useState({
    users: { read: false, create: false, update: false, delete: false },
    documents: { read: false, create: false, update: false, delete: false, assign: false },
  });

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [allPermissions, setAllPermissions] = useState([]);

  const handleCheckboxChange = (resource, action) => {
    setPermissions(prevPermissions => ({
      ...prevPermissions,
      [resource]: { ...prevPermissions[resource], [action]: !prevPermissions[resource][action] },
    }));
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${server}/api/role/getAllRoles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${server}/api/permission/getAllPermissions`);
      setAllPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const createPermission = async () => {
    try {
      await axios.post(`${server}/api/permission/createPermission`, { roleId: selectedRole, permissions });
      fetchPermissions();
    } catch (error) {
      console.error('Error creating permission:', error);
    }
  };

  const updatePermission = async () => {
    try {
      await axios.put(`${server}/api/permission/updatePermission`, { roleId: selectedRole, permissions });
      fetchPermissions();
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const getRoleNameById = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  return (
    <div className='flex p-6'>
      {/* <Sidebar/> */}
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Permissions Manager</h1>
      <div className='flex'>
        <div className="container">

          <div className="mb-4 pr-4">
            <label className="block text-lg font-semibold mb-2">Select Role</label>
            <select
              className="p-2 w-1/2 border rounded"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <h2 className="text-lg font-semibold mb-1">Users Permissions</h2>
            {['read', 'create', 'update', 'delete'].map((action) => (
              <label key={action} className="block">
                <Checkbox
                  checked={permissions.users[action]}
                  onChange={() => handleCheckboxChange('users', action)}
                />
                <span className="ml-2 capitalize">{action}</span>
              </label>
            ))}
          </div>

          <div className="mb-3">
            <h2 className="text-lg font-semibold mb-2">Documents Permissions</h2>
            {['read', 'create', 'update', 'delete', 'assign'].map((action) => (
              <label key={action} className="block">
                <Checkbox
                  checked={permissions.documents[action]}
                  onChange={() => handleCheckboxChange('documents', action)}
                />
                <span className="ml-2 capitalize">{action}</span>
              </label>
            ))}
          </div>

          <div className="flex space-x-4 mb-8">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={createPermission}
            >
              Create Permission
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={updatePermission}
            >
              Update Permission
            </button>
          </div>
        </div>

        <div className="container">
          <div>
            <h2 className="text-xl font-semibold mb-4">All Permissions</h2>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role Name</TableCell>
                    <TableCell>Users Permissions</TableCell>
                    <TableCell>Documents Permissions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allPermissions.map((perm) => (
                    <TableRow key={perm.id}>
                      <TableCell>{getRoleNameById(perm.roleId)}</TableCell>
                      <TableCell>
                        {Object.keys(perm.permissions.users).map((action) =>
                          perm.permissions.users[action] ? (
                            <div key={action} className="flex items-center space-x-2">
                              <CheckCircle className="text-green-500" />
                              <span>{action}</span>
                            </div>
                          ) : (
                            <div key={action} className="flex items-center space-x-2">
                              <Cancel className="text-red-500" />
                              <span>{action}</span>
                            </div>
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        {Object.keys(perm.permissions.documents).map((action) =>
                          perm.permissions.documents[action] ? (
                            <div key={action} className="flex items-center space-x-2">
                              <CheckCircle className="text-green-500" />
                              <span>{action}</span>
                            </div>
                          ) : (
                            <div key={action} className="flex items-center space-x-2">
                              <Cancel className="text-red-500" />
                              <span>{action}</span>
                            </div>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PermissionsManager;
