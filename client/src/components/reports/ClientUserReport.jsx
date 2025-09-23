
import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { fetchClientUserCompletedFilesReport } from "../../services/reportServices";
import { exportToExcel } from "../../utils/exportExcel";
import { format } from "date-fns";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";
import { FilePageSum } from "../../utils/FilepageSum";

const ClientUserReport = ({companyId}) => {
  const today = format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd");

  const [fileDetails, setFileDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedDateRange, setCompletedDateRange] = useState({
    start: today,
    end: today,
  });

 

  const clearFilters = () => {
    setCompletedDateRange({
      start: today,
      end: today,
    });
  };



  useEffect(() => {
    const fetchDetails = async () => {
      if (
        !companyId ||
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
        const data = await fetchClientUserCompletedFilesReport(
          companyId,
          startDate,
          endDate
        );
        console.log(startDate);
        console.log(endDate);
        console.log(data);
        setFileDetails(data);
        setFilteredDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [companyId, completedDateRange]);



  const totals = FilePageSum(filteredDetails);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">USER REPORT</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4 flex justify-between items-center w-full mt-14">
       
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
            onClick={() => exportToExcel(filteredDetails, "User_Report")}
          >
            Export to XLS
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white border  my-10">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 ">
            {filteredDetails.map((data, index) => (
              <tr
                key={index}
                className="even:bg-[#f0f2ff] odd:bg-white hover:bg-[#b6bffa]"
              >
                <td className="whitespace-nowrap px-6 py-2 font-medium  text-center">
                  {data.userName}
                </td>
                <td className="whitespace-nowrap px-6 py-2 font-medium text-center">
                  {data.totalFiles}
                </td>
                <td className="whitespace-nowrap px-6 py-2 font-medium text-center">
                  {data.totalPages}
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
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClientUserReport;






