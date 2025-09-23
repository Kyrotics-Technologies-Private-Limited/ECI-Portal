
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { fetchAllCompanies, fetchClientCompanies } from "../../services/companyServices";
import { fetchUserCompletedFilesReport } from "../../services/reportServices";
import { exportToExcel } from "../../utils/exportExcel";
import { format } from "date-fns";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";
import { FilePageSum } from "../../utils/FilepageSum";
import Loader from "../common/Loader";
import { useParams } from "react-router-dom";
import { useInstance } from "../../context/InstanceContext";

const UserReport = () => {
  const today = format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd");
  // const oneDayBefore = new Date(today);
  // oneDayBefore.setDate(today.getDate() - 1);

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [fileDetails, setFileDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedDateRange, setCompletedDateRange] = useState({
    start: today,
    end: today,
  });

  let { companyId } = useParams();

  const { kyroId, isKyroInstance } = useInstance();

  if (isKyroInstance) {
    companyId = kyroId;
  }



  const clearFilters = () => {
    setCompletedDateRange({
      start: today,
      end: today,
    });
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companies = await fetchClientCompanies();
        setCompanies(companies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (
        !selectedCompany ||
        !completedDateRange.start ||
        !completedDateRange.end
      )
        return;

      setIsLoading(true);
      try {
        const startDate = new Date(completedDateRange.start).setHours(
          0,
          0,
          0,
          0
        );
        const endDate = new Date(completedDateRange.end).setHours(0, 0, 0, 0);
        const data = await fetchUserCompletedFilesReport(
          companyId,
          selectedCompany,
          startDate,
          endDate
        );
        // console.log(startDate);
        // console.log(endDate);


        setFileDetails(data);
        setFilteredDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedCompany, completedDateRange]);

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  // Sort the filtered details to put users with 0 files at the bottom
  const sortedDetails = useMemo(() => {
    return [...filteredDetails].sort((a, b) => {
      // First sort by file count (users with 0 files at the bottom)
      if (a.totalFiles === 0 && b.totalFiles > 0) return 1;
      if (a.totalFiles > 0 && b.totalFiles === 0) return -1;

      // If both have same file count status (both 0 or both > 0),
      // sort alphabetically by name as secondary criteria
      return b.totalPages - a.totalPages;
    });
  }, [filteredDetails]);

  const totals = FilePageSum(filteredDetails);

  return (
    <div className="h-screen overflow-y-auto mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Report</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4 flex justify-between items-center w-full mt-14">
        <FormControl sx={{ width: "30%" }} className="mb-4">
          <InputLabel id="select-company-label">Select a Company</InputLabel>
          <Select
            labelId="select-company-label"
            id="select-company"
            value={selectedCompany}
            label="Select a Company"
            onChange={handleCompanyChange}
          >
            <MenuItem value="" disabled>
              Select a Company
            </MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="flex flex-wrap space-x-8 justify-center -mt-6">
          <div className="flex flex-col">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 text-center"
              htmlFor="completedDateRange"
            >
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                name="completedStartDate"
                value={completedDateRange.start}
                onChange={(e) =>
                  setCompletedDateRange({
                    ...completedDateRange,
                    start: e.target.value,
                  })
                }
                className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <input
                type="date"
                name="completedEndDate"
                value={completedDateRange.end}
                onChange={(e) =>
                  setCompletedDateRange({
                    ...completedDateRange,
                    end: e.target.value,
                  })
                }
                className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 my-auto flex flex-col gap-4">
          <button
            onClick={clearFilters}
            className="my-auto py-2 rounded-3xl bg-[#e3d2fa] hover:bg-[#ffe0e3] hover:shadow-md"
          >
            <FilterListOffRoundedIcon className="mr-2" />
            Clear Filters
          </button>
          <Button
            variant="outlined"
            onClick={() => exportToExcel(sortedDetails, "User_Report")}
          >
            Export to XLS
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <table className="min-w-full bg-white border my-10">
          <thead>
            <tr className="bg-[#6c7ae0] text-white">
              <th className="whitespace-nowrap px-6 py-2 font-medium">
                User Name
              </th>
              <th className="whitespace-nowrap px-6 py-2 font-medium">
                Completed Files
              </th>
              <th className="whitespace-nowrap px-6 py-2 font-medium">
                Completed Pages
              </th>
              <th className="whitespace-nowrap px-6 py-2 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedDetails.map((data, index) => (
              <tr
                key={index}
                className={`even:bg-[#f0f2ff] odd:bg-white hover:bg-[#b6bffa] ${!data.isActive ? "text-gray-500" : ""
                  }`}
              >
                <td className="whitespace-nowrap px-6 py-2 font-medium text-center">
                  {data.userName}
                </td>
                <td className="whitespace-nowrap px-6 py-2 font-medium text-center">
                  {data.totalFiles}
                </td>
                <td className="whitespace-nowrap px-6 py-2 font-medium text-center">
                  {data.totalPages}
                </td>
                <td className="whitespace-nowrap px-6 py-2 font-medium text-center">
                  {data.isActive ? "Active" : "Disabled"}
                </td>
              </tr>
            ))}
            {/* Add the totals row */}
            <tr className="bg-gray-200 font-bold">
              <td className="whitespace-nowrap px-6 py-2 text-center">
                Totals
              </td>
              <td className="whitespace-nowrap px-6 py-2 text-center">
                {totals.totalFiles}
              </td>
              <td className="whitespace-nowrap px-6 py-2 text-center">
                {totals.totalPages}
              </td>
              <td className="whitespace-nowrap px-6 py-2 text-center">
                -
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserReport;

