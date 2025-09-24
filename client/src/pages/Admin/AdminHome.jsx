// // src/pages/Admin/AdminHome.jsx

import React, { useState, useEffect } from "react";

import {  fetchClientProjectDetails,fetchDeliveryReportDetails } from "../../services/reportServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Button,
  MenuItem,
  Select,
  CircularProgress,

} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import { exportToExcel } from "../../utils/exportExcel";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Sidebar from "../../components/ClientCompany/Sidebar";
import ClientFileDetailedReport from "../../components/ClientCompany/ClientFileDetailedReport";
import ReplyIcon from "@mui/icons-material/Reply";
import { FilePageSum } from "../../utils/FilepageSum";
import Loader from "../../components/common/Loader";



const defaultStartDate = new Date();
defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);

const AdminHome = ({ companyId, role }) => {
  // const [companies, setCompanies] = useState([]);
  // const [companyId, setcompanyId] = useState("");
  const [projectDetails, setProjectDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportDetails, setReportDetails] = useState([]);
  const [startDate, setStartDate] = useState(
    defaultStartDate.setHours(0, 0, 0, 0)
  );
  const [endDate, setEndDate] = useState(new Date().setHours(0, 0, 0, 0));
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  const toggleReport = () => {
    setShowDetailedReport(!showDetailedReport);
  };

  const clearFilters = () => {
    setStartDate(defaultStartDate.setHours(0, 0, 0, 0));
    setEndDate(new Date().setHours(0, 0, 0, 0));
  };


  useEffect(() => {
    if (companyId) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const details = await fetchClientProjectDetails(companyId);
          setProjectDetails(details);
        } catch (error) {
          console.error("Error fetching project details:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId && startDate && endDate) {
      const fetchReport = async () => {
        try {
          const details = await fetchDeliveryReportDetails(
            companyId,
            startDate,
            endDate
          );
          setReportDetails(details);
        } catch (error) {
          console.error("Error fetching report details:", error);
        } 
      };
      fetchReport();
    }
  }, [companyId, startDate, endDate]);

  // const handleCompanyChange = (event) => {
  //   setcompanyId(event.target.value);
  // };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const totals = FilePageSum(projectDetails);
  const totalDeliered = FilePageSum(reportDetails);

  return (
    <div className="flex w-screen">
      {/* {role == 'admin' && (<> */}
      {role == "admin" && (
        <>
          <Sidebar companyId={companyId} role={"admin"} />
        </>
      )}
      {/* </>)} */}
      <div className="p-2 h-screen w-full overflow-y-auto">
        <div className="">
          <button
            className={`fixed animate-bounce right-6 top-11 px-6 py-3 text-white rounded-full flex items-center shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer ${showDetailedReport
              ? "bg-gradient-to-l from-blue-500 to-purple-500"
              : // : 'bg-green-500 border border-green-700'
              "bg-gradient-to-r from-blue-500 to-purple-500"
              }`}
            onClick={toggleReport}
          >
            {showDetailedReport ? (
              <>
                <ReplyIcon className="mr-2" />
                {/* <Dashboard className="mr-2" /> */}
                Project Overview
              </>
            ) : (
              <>
                {/* <Description className="mr-2" /> */}
                Detailed Report
                <ReplyIcon className="ml-2 scale-x-[-1]" />
              </>
            )}
          </button>
        </div>

        {showDetailedReport ? (
          <div className="p-8 w-full">
            <ClientFileDetailedReport companyId={companyId} />
          </div>
        ) : (
          <div className="p-8 mt-16 w-full">
            {/* <div className="mb-4 flex justify-between space-x-14">
              <FormControl sx={{ width: "30%" }}>
                <InputLabel id="select-company-label">
                  Select a Company
                </InputLabel>
                <Select
                  labelId="select-company-label"
                  id="select-company"
                  value={companyId}
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
            </div> */}

            {isLoading ? (
              <Loader />
            ) : (
              <div>
                <div className="backdrop-blur-sm shadow-xl bg-white/30 rounded-xl mb-20">
                  <div className="p-6">
                    <div className="flex justify-between pb-3">
                      <div className="flex">
                        <div className="w-16 h-16 bg-[#e3d2fa] rounded-xl text-center flex justify-center items-center">
                          <ContentPasteSearchIcon sx={{ fontSize: "35px" }} />
                        </div>
                        <h1 className="p-4 text-2xl font-bold font-mono tracking-wider leading-6">
                          DOCUMENTS OVERVIEW
                        </h1>
                      </div>
                      <div className="mt-4 my-auto">
                        <Button
                          variant="outlined"
                          onClick={() =>
                            exportToExcel(projectDetails, "projectOverview")
                          }
                          sx={{ color: "#5b68c7" }}
                          className="my-auto"
                        >
                          Export to XLS
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200">
                      <div className="overflow-x-auto rounded-t-lg rounded-b-lg">
                        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                          <thead className="">
                            <tr className="bg-[#6c7ae0] text-white">
                              <th className="whitespace-nowrap px-6 py-2 font-medium">
                                Sl No
                              </th>
                              <th className="whitespace-nowrap px-6 py-2 font-medium">
                                Documents
                              </th>
                              <th className="whitespace-nowrap px-6 py-2 font-medium">
                                Total Files
                              </th>
                              <th className="whitespace-nowrap px-6 py-2 font-medium">
                                Received Files
                              </th>
                              <th className="whitespace-nowrap px-6 py-2 font-medium">
                                Not Started
                              </th>
                              <th className="whitespace-nowrap px-6 py-2 font-medium">
                                In Progress
                              </th>
                              <th className="whitespace-nowrap px-6 py-2 font-medium">
                                Completed Files
                              </th>
                              <th className="whitespace-nowrap px-6 py-2 font-medium">
                                Downloads
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 ">
                            {projectDetails.map((project, index) => (
                              <tr
                                key={project.id}
                                className="even:bg-[#f0f2ff] odd:bg-white hover:bg-[#b6bffa]"
                              >
                                <td className="whitespace-nowrap px-6 py-2 text-center text-gray-900">
                                  {index + 1}
                                </td>
                                <td className="whitespace-nowrap px-6 py-2 text-center text-gray-900">
                                  {project.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">
                                  {project.totalFiles}
                                </td>
                                <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">
                                  {project.receivedFiles}
                                </td>
                                <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">
                                  {project.readyForWorkFiles}
                                </td>
                                <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">
                                  {project.inProgressFiles}
                                </td>
                                <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">
                                  {project.completedFiles}
                                </td>
                                <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">
                                  {project.downloadedFiles}
                                </td>
                              </tr>
                            ))}
                            {/* Add the totals row */}
                            <tr className="bg-gray-200 font-bold">
                              <td className="whitespace-nowrap px-6 py-2 text-center">Totals</td>
                              <td className="whitespace-nowrap px-6 py-2 text-center">

                              </td>
                              <td className="whitespace-nowrap px-6 py-2 text-center">
                                {totals.totalFiles}
                              </td>
                              <td className="whitespace-nowrap px-6 py-2 text-center">
                                {totals.receivedFiles}
                              </td>
                              <td className="whitespace-nowrap px-6 py-2 text-center">
                                {totals.readyForWorkFiles}
                              </td>
                              <td className="whitespace-nowrap px-6 py-2 text-center">
                                {totals.inProgressFiles}
                              </td>
                              <td className="whitespace-nowrap px-6 py-2 text-center">
                                {totals.completedFiles}
                              </td>
                              <td className="whitespace-nowrap px-6 py-2 text-center">
                                {totals.downloadedFiles}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Received Report */}
                <div className="backdrop-blur-sm shadow-2xl bg-white/30 rounded-xl mb-20">
                  <div className="flex justify-between p-6">
                    <div className="flex">
                      <div className="w-16 h-16 bg-[#e3d2fa] rounded-xl text-center flex justify-center items-center">
                        <CalendarMonthIcon sx={{ fontSize: "35px" }} />
                      </div>
                      <h1 className="p-4 text-2xl font-bold font-mono tracking-wider leading-6">
                        RECEIVED REPORT
                      </h1>
                    </div>

                    <div className="p-4 ">
                      <label className="block text-sm font-medium text-gray-700 mb-2 items-center">
                        <CalendarToday className="text-indigo-600 mr-2" />
                        Start Date
                      </label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd/MM/yyyy"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-all duration-200"
                      />
                    </div>

                    <div className="p-4 ">
                      <label className="block text-sm font-medium text-gray-700 mb-2  items-center">
                        <CalendarToday className="text-indigo-600 mr-2" />
                        End Date
                      </label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd/MM/yyyy"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-all duration-200"
                      />
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
                        onClick={() =>
                          exportToExcel(reportDetails, "dailyReport")
                        }
                        sx={{ color: "#5b68c7" }}
                        className="my-auto"
                      >
                        Export to XLS
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto rounded-t-lg rounded-b-lg">
                      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                        <thead>
                          <tr className="bg-[#6c7ae0] text-white">
                            <th className="whitespace-nowrap px-6 py-2 font-medium">
                              Sl No
                            </th>
                            <th className="whitespace-nowrap px-6 py-2 font-medium">
                              Received Date
                            </th>
                            <th className="whitespace-nowrap px-6 py-2 font-medium">
                              File Count
                            </th>
                            <th className="whitespace-nowrap px-6 py-2 font-medium">
                              Page Count
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {reportDetails.map((detail, index) => (
                            <tr
                              key={index}
                              className="even:bg-[#f0f2ff] odd:bg-white hover:bg-[#b6bffa]"
                            >
                              <td className="whitespace-nowrap px-6 py-2 text-center text-gray-900">
                                {index + 1}
                              </td>
                              <td className="whitespace-nowrap px-6 py-2 text-center text-gray-900">
                                {detail.date}
                              </td>
                              <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">
                                {detail.TotalFiles}
                              </td>
                              <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">
                                {detail.TotalPages}
                              </td>
                            </tr>
                          ))}
                          {/* Add the totals row */}
                          <tr className="bg-gray-200 font-bold">
                            <td className="whitespace-nowrap px-6 py-2 text-center">Totals</td>
                            <td className="whitespace-nowrap px-6 py-2 text-center">

                            </td>
                            <td className="whitespace-nowrap px-6 py-2 text-center">
                              {totalDeliered.TotalFiles}
                            </td>
                            <td className="whitespace-nowrap px-6 py-2 text-center">
                              {totalDeliered.TotalPages}
                            </td>

                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
