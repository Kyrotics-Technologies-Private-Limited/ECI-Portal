import React, { useState, useEffect, useCallback } from "react";
import { fetchAllCompanies,fetchClientCompanies } from "../../services/companyServices";
import { fetchDetailedFileReport } from "../../services/reportServices";
import { exportToExcel } from "../../utils/exportExcel";
import SearchIcon from "@mui/icons-material/Search";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  TablePagination,
  Collapse,
  IconButton,
} from "@mui/material";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";
import { parse,  isValid } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

const columns = [
  { id: "slNo", label: "Sl No", minWidth: 10 },
  { id: "fileName", label: "File Name", minWidth: 190 },
  { id: "status", label: "Status", minWidth: 60 },
  { id: "pageCount", label: "Page Count", minWidth: 70 },
  { id: "uploadedDate", label: "Uploaded Date", minWidth: 90 },
  { id: "assignedDate", label: "Assigned Date", minWidth: 130 },
  { id: "completedDate", label: "Completed Date", minWidth: 130 },
  { id: "deliveryDate", label: "Delivery Date", minWidth: 130 },
  { id: "assigneeName", label: "Assignee Name", minWidth: 130 },
  { id: "projectName", label: "Judgement", minWidth: 130 },
];

// const date1 = parse('28/08/2024', 'dd/MM/yyyy', new Date());
// console.log(date1)
// console.log(new Date())

const DetailedFileReport = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [fileDetails, setFileDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: "",
    assignedStartDate: "",
    assignedEndDate: "",
    status: "",
    deliveryStartDate: "",
    deliveryEndDate: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      assignedStartDate: "",
      assignedEndDate: "",
      status: "",
      deliveryStartDate: "",
      deliveryEndDate: "",
    });
    setShowFilters(false);
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
    if (selectedCompany) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const details = await fetchDetailedFileReport(selectedCompany);
          setFileDetails(details);
          setFilteredDetails(details);
        } catch (error) {
          console.error("Error fetching detailed file report:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [selectedCompany]);

  useEffect(() => {
    applyFilters();
  }, [filters, fileDetails]);

  const applyFilters = useCallback(() => {
    const filtered = fileDetails.filter((file) => {
      // Ensure that file.assignedDate and file.deliveryDate are not null or undefined
      const assignedDate = file.assignedDate
        ? parse(file.assignedDate, "dd/MM/yyyy", new Date())
        : null;
      // console.log(assignedDate)
      const deliveryDate = file.deliveryDate
        ? parse(file.deliveryDate, "dd/MM/yyyy", new Date())
        : null;
      const assignedStartDate = filters.assignedStartDate
        ? parse(filters.assignedStartDate, "yyyy-MM-dd", new Date())
        : //? new Date(filters.assignedStartDate)
          null;
      // console.log("assignStartDate", assignedStartDate);

      const assignedEndDate = filters.assignedEndDate
        ? parse(filters.assignedEndDate, "yyyy-MM-dd", new Date())
        : null;
      const deliveryStartDate = filters.deliveryStartDate
        ? parse(filters.deliveryStartDate, "yyyy-MM-dd", new Date())
        : null;
      const deliveryEndDate = filters.deliveryEndDate
        ? parse(filters.deliveryEndDate, "yyyy-MM-dd", new Date())
        : null;

      return (
        (filters.searchQuery
          ? file.fileName
              .toLowerCase()
              .includes(filters.searchQuery.toLowerCase()) ||
            file.assigneeName
              .toLowerCase()
              .includes(filters.searchQuery.toLowerCase()) ||
            file.projectName
              .toLowerCase()
              .includes(filters.searchQuery.toLowerCase())
          : true) &&
        (assignedStartDate && assignedEndDate
          ? isValid(assignedDate) &&
            assignedDate >= assignedStartDate &&
            assignedDate <= assignedEndDate
          : true) &&
        // (filters.status
        //   ? filters.status == "Delivered"
        //     ? file.status >= 5
        //     : file.status == (filters.status)
        //   : true) &&
        (filters.status ? file.status == filters.status : true) &&
        (deliveryStartDate && deliveryEndDate
          ? isValid(deliveryDate) &&
            deliveryDate >= deliveryStartDate &&
            deliveryDate <= deliveryEndDate
          : true)
      );
    });
    setFilteredDetails(filtered);
  }, [filters, fileDetails]);

  // console.log(filters.assignedStartDate);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleDateFilterChange = (date, name) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: date,
    }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="">
      <FormControl sx={{ width: "30%" }}>
        <InputLabel id="select-company-label"> Select Organisation
        </InputLabel>
        <Select
          labelId="select-company-label"
          id="select-company"
          value={selectedCompany}
          label="Select a Company"
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="flex justify-between pb-4 mt-10">
        <div className="flex gap-6 ">
          <div className="relative w-60">
            <div className="absolute z-10 left-0 p-3 -mt-1 flex m-auto pointer-events-none">
              <SearchIcon className="w-5 text-gray-500" />
            </div>
            <input
              type="text"
              name="searchQuery"
              placeholder="Search User, File, Judgements"
              value={filters.searchQuery}
              onChange={handleFilterChange}
              className="block w-full pl-10 pr-3 py-2 border border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex flex-col">
            <select
              id="status-options"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 pr-2 border border-[#02bbcc] rounded-3xl backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              name="status"
              placeholder="Select Status"
            >
              {/* <option value="">Select Status</option>
              <option value="1">ML</option>
              <option value="2">Ready for Work</option>
              <option value="3">Work in Progress</option>
              <option value="4">Completed</option>
              <option value="5.5">Delivered</option> */}

              <option value="">All Status</option>
              <option value="Processing">Processing</option>
              <option value="NotStarted">Ready for Work</option>
              <option value="InProgress">Work in Progress</option>
              <option value="QA/Completed">QA/Completed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            {/* <FilterListIcon /> */}
            <FilterAltRoundedIcon />
          </IconButton>
        </div>

        <div className="flex space-x-6">
          <button
            onClick={clearFilters}
            className="my-auto py-2 px-3 rounded-3xl bg-[#e3d2fa] hover:bg-[#ffe0e3] hover:shadow-md"
          >
            <FilterListOffRoundedIcon className="mr-2" />
            Clear Filters
          </button>
          <Button
            variant="outlined"
            onClick={() =>
              exportToExcel(filteredDetails, "Detailed File Report")
            }
          >
            Export to XLS
          </Button>
        </div>
      </div>

      <Collapse in={showFilters} timeout="auto" unmountOnExit>
        <div className="grid grid-cols-1 gap-4 mb-4 py-3">
          <div className="flex flex-wrap space-x-16 justify-center">
            <div className="flex flex-col">
              <label
                className="block text-gray-700 text-sm font-bold mb-2 text-center"
                htmlFor="assignedDateRange"
              >
                Assigned Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="assignedStartDate"
                  value={filters.assignedStartDate}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />

                {/* <DatePicker
                  name="assignedStartDate"
                  value={filters.assignedStartDate}
                  // selected={startDate}
                  onChange={(date) => handleDateFilterChange(date, 'assignedStartDate')}
                  dateFormat="dd/MM/yyyy"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-all duration-200"
                /> */}

                <input
                  type="date"
                  name="assignedEndDate"
                  value={filters.assignedEndDate}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label
                className="block text-gray-700 text-sm font-bold mb-2 text-center"
                htmlFor="deliveryDateRange"
              >
                Delivery Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="deliveryStartDate"
                  value={filters.deliveryStartDate}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <input
                  type="date"
                  name="deliveryEndDate"
                  value={filters.deliveryEndDate}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </Collapse>

      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
        <TableContainer sx={{ maxHeight: 700 }}>
          <Table stickyHeader aria-label="sticky table" >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{
                      minWidth: column.minWidth,
                      backgroundColor: "#6c7ae0",
                      color: "#ffffff",
                      fontSize:"12px"
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDetails
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((file, index) => (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={index}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#f0f2ff" : "inherit",
                      
                    }}
                    
                  >
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>{file.fileName}</TableCell>
                    {/* <TableCell align="center">{file.status}</TableCell> */}
                    <TableCell sx={{ fontSize:'12px'}} >{file.status}</TableCell>
                    <TableCell  sx={{ fontSize:'12px'}} align="center">{file.pageCount}</TableCell>
                    <TableCell  sx={{ fontSize:'12px'}} align="center">{file.uploadedDate}</TableCell>
                    <TableCell  sx={{ fontSize:'12px'}} align="center">{file.assignedDate}</TableCell>
                    <TableCell  sx={{ fontSize:'12px'}} align="center">{file.completedDate}</TableCell>
                    <TableCell  sx={{ fontSize:'12px'}} align="center">{file.deliveryDate}</TableCell>
                    <TableCell sx={{ fontSize:'12px'}} >{file.assigneeName}</TableCell>
                    <TableCell sx={{ fontSize:'12px'}} >{file.projectName}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredDetails.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default DetailedFileReport;
