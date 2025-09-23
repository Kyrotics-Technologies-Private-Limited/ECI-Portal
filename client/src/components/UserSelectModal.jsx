import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height: '600px',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const UserSelectModal = ({ open, handleClose, handleAssign, companyId }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); // Add filtered users state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // Add search term state

    useEffect(() => {
        const getUsers = async () => {
            setIsLoading(true);
            try {
                const usersQuery = query(
                    collection(db, 'users'),
                    where('companyId', '==', companyId),
                    // where('disabled', '==', 'false')
                );
                const usersSnapshot = await getDocs(usersQuery);
                const usersData = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(usersData);
                setFilteredUsers(usersData); // Initialize filtered users
            } catch (err) {
                console.error('Error fetching company users:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (open) {
            getUsers();
        }
    }, [open, companyId]);

    // Filter users based on the search term
    useEffect(() => {
        const results = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <h2>Select User</h2>
                {isLoading && <CircularProgress />}
                {error && <p>Error: {error.message}</p>}
                {!isLoading && !error && (
                    <>
                        <TextField
                            fullWidth
                            label="Search by name"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            margin="normal"
                        />
                        <Box sx={{ overflowY: 'auto', maxHeight: '400px' }}> {/* Scrollable container */}
                            {filteredUsers.length === 0 ? (
                                <p>No users found.</p>
                            ) : (
                                <List>
                                    {filteredUsers.map((user) => (
                                        <ListItem key={user.id}>
                                            <ListItemButton onClick={() => handleAssign(user.id)}>
                                                <ListItemText primary={user.name} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default UserSelectModal;
