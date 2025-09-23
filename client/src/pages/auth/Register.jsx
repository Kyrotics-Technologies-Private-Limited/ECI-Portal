import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";
import { useParams } from "react-router-dom";
import { fetchCompanyNameByCompanyId } from "../../utils/firestoreUtil";
import { useInstance } from "../../context/InstanceContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  let { companyId } = useParams();



  const { kyroId, isKyroInstance } = useInstance();

  if (isKyroInstance) {
    companyId = kyroId;
  }


  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhoneNo("");
    setRoleId("");
  };

  useEffect(() => {
    const getCompanyName = async () => {
      try {
        const name = await fetchCompanyNameByCompanyId(companyId);
        setCompanyName(name);
        const rolesResponse = await axios.get(`${server}/api/role/getAllRoles`);
        const roleData = rolesResponse.data.filter(
          (doc) => doc.name !== "superAdmin"
        );
        setRoles(roleData);
      } catch (error) {
        console.error(error);
      }
    };

    if (companyId) {
      getCompanyName();
    }
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      setIsRegistering(true);
      try {
        const response = await axios.post(
          `${server}/api/auth/createUser`,
          {
            email,
            password,
            name,
            phoneNo,
            roleId,
            companyId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        toast.success("Registration Successful");
        resetForm();
      } catch (error) {
        console.error(error);
        let message = "An error occurred. Please try again.";

        // Check for backend error messages
        if (error.response && error.response.data) {
          message = error.response.data.error || message;
        } else {
          message = error.message || message;
        }

        toast.error(message);
      } finally {
        setIsRegistering(false);
      }
    }
  };

  return (
    <div className="flex w-full  ">
      {/* <Sidebar role='superAdmin'/> */}

      {/* Main content */}
      <div className="w-full flex justify-center bg-slate-200">
        <div className="flex w-4/5 h-screen items-center justify-center ">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Register
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  minLength="6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="phoneNo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone No
                </label>
                <input
                  id="phoneNo"
                  type="text"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="roleId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  id="roleId"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="companyId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company
                </label>
                <input
                  id="companyId"
                  type="text"
                  value={companyName}
                  readOnly
                  required
                  className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isRegistering ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
