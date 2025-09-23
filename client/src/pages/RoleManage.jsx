import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Checkbox, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { server } from '../main'
import Sidebar from '../components/ClientCompany/Sidebar';

const RoleManager = () => {
  
  const [open, setOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [isAllowedToDelete, setIsAllowedToDelete] = useState(true);
  const [editRoleId, setEditRoleId] = useState('');
  const [roles, setRoles] = useState([]);


  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setRoleName('');
    setIsAllowedToDelete(true);
    setEditRoleId('');
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${server}/api/role/getAllRoles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleSubmit = async () => {
    if (editRoleId) {
      await axios.put(`${server}/api/role/updateRole`, { id: editRoleId, name: roleName, isAllowedToDelete });
    } else {
      await axios.post(`${server}/api/role/createRole`, { name: roleName, isAllowedToDelete });
    }
    fetchRoles();
    handleClose();
  };

  const handleEdit = (role) => {
    setRoleName(role.name);
    setIsAllowedToDelete(role.isAllowedToDelete);
    setEditRoleId(role.id);
    handleOpen();
  };

  const handleDelete = async (roleId) => {
    await axios.delete(`${server}/api/role/deleteRole`, { data: { id: roleId } });
    fetchRoles();
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className='flex p-8'>
      {/* <Sidebar/> */}
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Role Manager</h1>
      <Button variant="contained" color="primary" onClick={handleOpen}>Create Role</Button>

      <TableContainer component={Paper} className="mt-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Can be Deleted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.isAllowedToDelete ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(role)}
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  {role.name !== 'superAdmin' && role.name !== 'admin' && role.name !== 'user' && role.isAllowedToDelete === true && (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(role.id)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editRoleId ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            type="text"
            fullWidth
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
          <label>
            <Checkbox
              checked={isAllowedToDelete}
              onChange={() => setIsAllowedToDelete(!isAllowedToDelete)}
            />
            Can be deleted
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">{editRoleId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </div>
    </div>
  );
};

export default RoleManager;
