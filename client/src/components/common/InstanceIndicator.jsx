import React from 'react';
import { useInstance } from '../../context/InstanceContext';
import { useAuth } from '../../context/AuthContext';
import { Chip } from '@mui/material';

const InstanceIndicator = () => {
  const { currentUser } = useAuth();
  const { isKyroInstance, isClientInstance } = useInstance();
  
  // Only show for superAdmin
  if (currentUser?.roleName !== 'superAdmin') {
    return null;
  }
  
  return (
    <div className="fixed top-5 right-48 z-50">
      <Chip
        label={isKyroInstance ? "Kyrotics Instance" : "Client Company Instance"}
        color={isKyroInstance ? "primary" : "secondary"}
        variant="outlined"
        className="font-medium"
      />
    </div>
  );
};

export default InstanceIndicator;