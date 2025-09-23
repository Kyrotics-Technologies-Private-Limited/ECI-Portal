import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useInstance } from '../../context/InstanceContext';

// This component updates the instance context whenever the URL path changes
const InstancePathTracker = () => {
  const location = useLocation();
  const { updateInstanceType } = useInstance();
  
  useEffect(() => {
    updateInstanceType(location.pathname);
  }, [location.pathname, updateInstanceType]);
  
  // This is a utility component that doesn't render anything
  return null;
};

export default InstancePathTracker;