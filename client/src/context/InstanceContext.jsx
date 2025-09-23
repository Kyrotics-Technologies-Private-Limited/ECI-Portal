import React, { createContext, useContext, useState, useEffect } from 'react';
import { kyroCompanyId } from '../services/companyServices';
import { useAuth } from './AuthContext';

// Create context
const InstanceContext = createContext();

export const InstanceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [kyroId, setKyroId] = useState('');
  const [instanceType, setInstanceType] = useState(null); // 'kyro' or 'client'
  const [currentPath, setCurrentPath] = useState(null);
  
  // Fetch Kyro company ID once on mount
  useEffect(() => {
    const fetchKyroId = async () => {
      try {
        const id = await kyroCompanyId();
        setKyroId(id);
      } catch (error) {
        console.error('Failed to fetch Kyro company ID:', error);
      }
    };
    
    if (currentUser) {
      fetchKyroId();
    }
  }, [currentUser]);
  
  // Update the instance type whenever the path changes
  const updateInstanceType = (path) => {
    setCurrentPath(path);
    if (path.includes('/kyro/')) {
      setInstanceType('kyro');
    } else if (path.includes('/company/')) {
      setInstanceType('client');
    }
  };
  
  const isKyroInstance = instanceType === 'kyro';
  const isClientInstance = instanceType === 'client';
  
  return (
    <InstanceContext.Provider 
      value={{ 
        kyroId,
        instanceType,
        isKyroInstance,
        isClientInstance,
        currentPath,
        updateInstanceType
      }}
    >
      {children}
    </InstanceContext.Provider>
  );
};

// Custom hook for using the instance context
export const useInstance = () => {
  const context = useContext(InstanceContext);
  if (!context) {
    throw new Error('useInstance must be used within an InstanceProvider');
  }
  return context;
};

export default InstanceContext;