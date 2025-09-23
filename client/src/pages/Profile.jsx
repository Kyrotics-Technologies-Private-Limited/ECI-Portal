import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { server } from "../main";
import { fetchCompanyNameByCompanyId } from "../services/companyServices";
import Loader from "../components/common/Loader";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const token = await user.getIdToken();
            const response = await axios.get(
              `${server}/api/auth/getUserProfile`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setProfile(response.data);
          } catch (err) {
            setError("Error fetching profile");
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
          setError("No user is signed in");
        }
      });
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (profile && profile.companyId) {
        const companyName = await fetchCompanyNameByCompanyId(profile.companyId);
        setCompanyName(companyName);
      }
    };
    fetchCompanyName();
  }, [profile]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white/40 backdrop-blur-lg p-6 rounded-lg shadow-xl">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-800 font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/50">
          {/* Header Section */}
          <div className="px-8 py-10 bg-gradient-to-r from-[#ff80b5]/10 to-[#9089fc]/10">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#ff80b5]/20 to-[#9089fc]/20 backdrop-blur-lg flex items-center justify-center border border-white/30 shadow-lg">
                <span className="text-3xl font-bold bg-gradient-to-r from-[#ff80b5] to-[#9089fc] text-transparent bg-clip-text">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff80b5] to-[#9089fc] text-transparent bg-clip-text">
                  {profile.name}
                </h1>
                <p className="text-gray-600 mt-1">{profile.roleName}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-8 py-6">
            <div className="grid gap-4">
              <div className="flex items-center p-4 bg-white/30 backdrop-blur-lg rounded-xl transition-all hover:bg-white/40 border border-white/50 shadow-sm">
                <div className="p-3 bg-gradient-to-tr from-[#ff80b5]/10 to-[#9089fc]/10 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9089fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-500">Email</h2>
                  <p className="text-lg text-gray-800">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-white/30 backdrop-blur-lg rounded-xl transition-all hover:bg-white/40 border border-white/50 shadow-sm">
                <div className="p-3 bg-gradient-to-tr from-[#ff80b5]/10 to-[#9089fc]/10 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#ff80b5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-500">Organisation</h2>
                  {companyName && <p className="text-lg text-gray-800">{companyName}</p>}
                </div>
              </div>

              <div className="flex items-center p-4 bg-white/30 backdrop-blur-lg rounded-xl transition-all hover:bg-white/40 border border-white/50 shadow-sm">
                <div className="p-3 bg-gradient-to-tr from-[#ff80b5]/10 to-[#9089fc]/10 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#9089fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-500">Role</h2>
                  <p className="text-lg text-gray-800">{profile.roleName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;