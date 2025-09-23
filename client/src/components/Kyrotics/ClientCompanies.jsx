
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { fetchClientCompanies } from "../../services/companyServices";
import Loader from "../common/Loader";
import { useAuth } from "../../context/AuthContext";
import { useInstance } from "../../context/InstanceContext";

const ClientCompanies = () => {
  const { currentUser } = useAuth();
  const { isKyroInstance } = useInstance();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const companies = await fetchClientCompanies();
        setCompanies(companies);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleCompanyClick = (company) => {
    // const { roleName } = currentUser || {};
    // const isSuperAdmin = roleName === 'superAdmin';
    
    // if (isSuperAdmin) {
      // If we're already in Kyro instance, maintain that instance
      if (isKyroInstance) {
        navigate(`/kyro/${company.id}/project`);
      } else {
        // Otherwise use company instance
        navigate(`/company/${company.id}/project`);
      }
    // } else {
    //   // For non-superAdmin, use regular company path
    //   navigate(`/company/${company.id}/project`);
    // }
  };

  return (
    <div className="flex flex-col items-center p-20">
      {isLoading && <Loader />}
      {error && <p>Error: {error.message}</p>}
      {!isLoading && !error && (
        <>
          <Grid container spacing={4} className="w-full">
            {companies.map((company) => (
              <Grid item xs={12} sm={6} md={4} key={company.id}>
                <div 
                  className="cursor-pointer"
                  onClick={() => handleCompanyClick(company)}
                >
                  <Card
                    className="transform transition-transform hover:scale-105 shadow-lg rounded-lg overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                    }}
                  >
                    <CardContent className="flex flex-col items-center">
                      <Typography
                        variant="h5"
                        component="div"
                        className="font-bold"
                      >
                        {company.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        component="div"
                        className="mt-2"
                      >
                        Click to view projects
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
};

export default ClientCompanies;