// import { server } from '../../main'
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
// import Fab from '@mui/material/Fab';
// import AddIcon from '@mui/icons-material/Add';
// import { Link } from 'react-router-dom';

// const SuperAdminHome = () => {
//     const [companies, setCompanies] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [newCompanyName, setNewCompanyName] = useState('');

//     const createCompany = async () => {
//         try {
//             const response = await axios.post(`${server}/api/company/createCompany`, {
//                 name: newCompanyName,
//             }, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             });
//             setCompanies([...companies, response.data]);
//             setIsModalOpen(false);
//             setNewCompanyName('');
//         } catch (err) {
//             console.error('Error creating company:', err);
//         }
//     };

//     useEffect(() => {
//         const fetchCompanies = async () => {
//             setIsLoading(true);
//             try {
//                 const response = await axios.get(`${server}/api/company`);
//                 setCompanies(response.data);
//             } catch (err) {
//                 setError(err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchCompanies();
//     }, []);

//     return (
//         <div className="flex justify-center items-center p-20">
//             {isLoading && <p>Loading companies...</p>}
//             {error && <p>Error fetching companies: {error.message}</p>}
//             {!isLoading && !error && (
//                 <div className="grid grid-cols-1 gap-6 md:grid-cols-4 p-4">
//                     {companies.map((company) => (
//                         <Link to={`/company/${company.id}/profile`} key={company.id}>
//                             <div
//                                 className="company-box relative p-6 w-60 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 rounded-lg shadow-lg transition-transform transform hover:scale-105"
//                             >
//                                 <div className="p-4 text-center text-white text-lg font-semibold">
//                                     {company.name}
//                                 </div>
//                             </div>
//                         </Link>
//                     ))}
//                 </div>
//             )}

//             <Fab
//                 variant="extended"
//                 color="info"
//                 size="large"
//                 sx={{ position: 'fixed', bottom: 25, right: 16, width: '250px', height: '70px', fontSize: '18px' }}
//                 onClick={() => setIsModalOpen(true)}
//             >
//                 <AddIcon sx={{ mr: 1 }} />
//                 New Company
//             </Fab>

//             {isModalOpen && (
//                 <Dialog className="relative z-10" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
//                     <DialogBackdrop
//                         transition
//                         className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
//                     />

//                     <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
//                         <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//                             <DialogPanel
//                                 transition
//                                 className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
//                             >
//                                 <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
//                                     <div className="sm:flex sm:items-start">
//                                         <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
//                                             <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
//                                                 Create New Company
//                                             </DialogTitle>
//                                             <div className="mt-2">
//                                                 <input
//                                                     type="text"
//                                                     className="mt-4 p-4 block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                                                     placeholder="New Company Name"
//                                                     value={newCompanyName}
//                                                     onChange={(e) => setNewCompanyName(e.target.value)}
//                                                 />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
//                                     <button
//                                         type="button"
//                                         className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
//                                         onClick={createCompany}
//                                     >
//                                         Create
//                                     </button>
//                                     <button
//                                         type="button"
//                                         className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
//                                         onClick={() => setIsModalOpen(false)}
//                                         data-autofocus
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </DialogPanel>
//                         </div>
//                     </div>
//                 </Dialog>
//             )}
//         </div>
//     );
// };

// export default SuperAdminHome;


import { server } from '../../main';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useInstance } from '../../context/InstanceContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import { kyroCompanyId } from '../../services/companyServices';
import { Card, CardContent, Typography, Grid, IconButton, Chip, Tab, Tabs, Box, Paper } from '@mui/material';
import { Delete, ArrowForward, Business, School, Dashboard, People } from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const SuperAdminHome = () => {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyType, setNewCompanyType] = useState('client');
    const [tabValue, setTabValue] = useState(0);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [kyroId, setKyroId] = useState('');
    const [stats, setStats] = useState({
        totalCompanies: 0,
        clientCompanies: 0,
        totalProjects: 0,
        totalUsers: 0
    });

    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { updateInstanceType } = useInstance();

    // Fetch Kyro company ID
    useEffect(() => {
        const fetchKyroId = async () => {
            try {
                const id = await kyroCompanyId();
                setKyroId(id);
            } catch (error) {
                console.error('Failed to fetch Kyro company ID:', error);
            }
        };

        fetchKyroId();
    }, []);

    const createCompany = async () => {
        try {
            if (!newCompanyName.trim()) {
                toast.error('Company name cannot be empty');
                return;
            }

            const response = await axios.post(`${server}/api/company/createCompany`, {
                name: newCompanyName,
                type: newCompanyType
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setCompanies([...companies, response.data]);
            setIsModalOpen(false);
            setNewCompanyName('');
            toast.success(`${newCompanyName} has been created successfully`);
        } catch (err) {
            console.error('Error creating company:', err);
            toast.error('Failed to create company: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteCompany = async (companyId) => {
        try {
            await axios.delete(`${server}/api/company/${companyId}`);

            // Remove the company from the local state
            setCompanies(companies.filter(company => company.id !== companyId));
            setConfirmDelete(null);
            toast.success('Company deleted successfully');
        } catch (err) {
            console.error('Error deleting company:', err);
            toast.error('Failed to delete company: ' + (err.response?.data?.message || err.message));
        }
    };

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${server}/api/company`);
                setCompanies(response.data);

                // Calculate stats
                const clientCompaniesCount = response.data.filter(company => company.id !== kyroId).length;
                setStats({
                    totalCompanies: response.data.length,
                    clientCompanies: clientCompaniesCount,
                    totalProjects: 0, // You could fetch this from your API if available
                    totalUsers: 0 // You could fetch this from your API if available
                });
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (kyroId) {
            fetchCompanies();
        }
    }, [kyroId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCompanyClick = (company) => {
        // Determine which instance path to use based on company type
        const isKyroCompany = company.id === kyroId;

        if (isKyroCompany) {
            // Update the instance context when navigating
            updateInstanceType('/kyro/' + company.id);
            navigate(`/kyro/${company.id}/clientCompanies`);
        } else {
            // Update the instance context when navigating
            updateInstanceType('/company/' + company.id);
            navigate(`/company/${company.id}/project`);
        }
    };

    // Filter companies based on tab selection
    const filteredCompanies = companies.filter(company => {
        if (tabValue === 0) return true; // All companies
        if (tabValue === 1) return company.id === kyroId; // Kyrotics only
        if (tabValue === 2) return company.id !== kyroId; // Client companies only
        return true;
    });

    return (
        <div className="p-8  min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <Typography variant="h4" component="h1" className="text-gray-800 font-bold">
                        Company Management Dashboard
                    </Typography>
                    <Typography variant="body1" className="text-gray-600 mt-2">
                        Manage all companies and access their data from this central dashboard
                    </Typography>
                </div>



                {/* Filter Tabs */}
                <Paper className="mb-6 rounded-lg overflow-hidden shadow-sm">
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                        className="bg-white"
                    >
                        <Tab label="All Companies" className="py-4" />
                        <Tab
                            label="Kyrotics"
                            icon={<School fontSize="small" />}
                            iconPosition="start"
                            className="py-4"
                        />
                        <Tab
                            label="Client Companies"
                            icon={<Business fontSize="small" />}
                            iconPosition="start"
                            className="py-4"
                        />
                    </Tabs>
                </Paper>

                {/* Company Cards */}
                {isLoading && (
                    <div className="flex justify-center items-center h-64">
                        <Loader />
                    </div>
                )}

                {error && (
                    <div className="text-center py-6 px-4 bg-red-50 text-red-700 rounded-lg shadow">
                        <Typography variant="body1">
                            Error fetching companies: {error.message}
                        </Typography>
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {filteredCompanies.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                                <Typography variant="h6" className="text-gray-500">
                                    No companies found in this category
                                </Typography>
                                <Typography variant="body2" className="text-gray-400 mt-2">
                                    Click the "New Company" button to add one
                                </Typography>
                            </div>
                        ) : (
                            <Grid container spacing={4}>
                                {filteredCompanies.map((company) => {
                                    const isKyroCompany = company.id === kyroId;

                                    return (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
                                            <Card
                                                className="h-full transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] cursor-pointer"
                                                onClick={() => handleCompanyClick(company)}
                                                sx={{
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    background: isKyroCompany ?
                                                        'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)' :
                                                        'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
                                                    color: 'white'
                                                }}
                                            >
                                                {/* Decorative Elements */}
                                                <div
                                                    className="absolute right-0 top-0 w-16 h-16 rounded-full opacity-20 bg-white"
                                                    style={{ transform: 'translate(30%, -30%)' }}
                                                />
                                                <div
                                                    className="absolute left-0 bottom-0 w-24 h-24 rounded-full opacity-10 bg-white"
                                                    style={{ transform: 'translate(-30%, 30%)' }}
                                                />

                                                <CardContent className="relative p-6">
                                                    <div className="mb-3">
                                                        <Chip
                                                            size="small"
                                                            label={isKyroCompany ? "Kyrotics" : "Client"}
                                                            sx={{
                                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                                color: 'white',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 'bold'
                                                            }}
                                                        />
                                                    </div>

                                                    <Typography
                                                        variant="h5"
                                                        component="div"
                                                        className="font-bold mb-4 mt-2"
                                                    >
                                                        {company.name}
                                                    </Typography>

                                                    <div className="flex justify-between items-center mt-6">
                                                        <div className="flex items-center">
                                                            {!isKyroCompany && (
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setConfirmDelete(company);
                                                                    }}
                                                                    sx={{
                                                                        color: 'rgba(255,255,255,0.9)',
                                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                                        '&:hover': {
                                                                            bgcolor: 'rgba(255,0,0,0.2)'
                                                                        }
                                                                    }}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                        </div>

                                                        <div className="bg-white bg-opacity-20 text-white p-1 px-3 rounded-full flex items-center text-sm font-medium">
                                                            Access
                                                            <ArrowForward fontSize="small" className="ml-1" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        )}
                    </>
                )}

                {/* Create Company Button */}
                <Fab
                    variant="extended"
                    color="info"
                    size="large"
                    sx={{ position: 'fixed', bottom: 25, right: 16, width: '250px', height: '70px', fontSize: '18px' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <AddIcon sx={{ mr: 1 }} />
                    New Company
                </Fab>

                {isModalOpen && (
                    <Dialog className="relative z-10" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                        <DialogBackdrop
                            transition
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                        />

                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel
                                    transition
                                    className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                                >
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                    Create New Company
                                                </DialogTitle>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        className="mt-4 p-4 block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                        placeholder="New Company Name"
                                                        value={newCompanyName}
                                                        onChange={(e) => setNewCompanyName(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                                            onClick={createCompany}
                                        >
                                            Create
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setIsModalOpen(false)}
                                            data-autofocus
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </div>
                    </Dialog>
                )}

                {/* Delete Confirmation Modal */}
                {confirmDelete && (
                    <Dialog className="relative z-10" open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
                        <DialogBackdrop
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        />

                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel
                                    className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                                >
                                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3">
                                        <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-white">
                                            Delete Company
                                        </DialogTitle>
                                    </div>

                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                                <Delete className="h-6 w-6 text-red-600" aria-hidden="true" />
                                            </div>
                                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Are you sure you want to delete <span className="font-semibold">{confirmDelete.name}</span>?
                                                        This action cannot be undone and will remove all associated data.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:from-red-600 hover:to-red-700 sm:ml-3 sm:w-auto"
                                            onClick={() => handleDeleteCompany(confirmDelete.id)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setConfirmDelete(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </div>
                    </Dialog>
                )}
            </div>
        </div>
    );
};

export default SuperAdminHome;