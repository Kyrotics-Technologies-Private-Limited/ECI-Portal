import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import MuiTable from "@mui/material/Table";
import Checkbox from "@mui/material/Checkbox";
import DownloadIcon from "@mui/icons-material/Download";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";


function CompletedTable({
  columns,
  rows = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  selectedRows,
  setSelectedRows,
  handleDownloadSelected,
  handleDownload,
  projectName,
  projectId,
  status,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [selectedAnchorEl, setSelectedAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" }); // Sort config state

  // Handle sorting logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort rows based on current sort configuration
  const sortedRows = [...rows].sort((a, b) => {
    if (sortConfig.key) {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      if (sortConfig.direction === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    }
    return 0;
  });

  const handleCheckboxClick = (event, id) => {
    if (event.target.checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleMenuOpen = (event, file) => {
    setAnchorEl(event.currentTarget);
    setCurrentFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentFile(null);
  };

  const handleSelectedMenuOpen = (event) => {
    setSelectedAnchorEl(event.currentTarget);
  };

  const handleSelectedMenuClose = () => {
    setSelectedAnchorEl(null);
  };

  const handleDownloadClick = (format) => {
    if (currentFile) {
      handleDownload(currentFile.projectId, currentFile.id, format);
    }
    handleMenuClose();
  };

  const handleDownloadSelectedClick = (format) => {
    handleDownloadSelected(format);
    handleSelectedMenuClose();
  };

  const calculateTotalPages = (rows) => {
    return rows.reduce((total, row) => {
      return total + (row.pageCount || 0);
    }, 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-4">
        <span className="ml-4 text-lg font-normal text-gray-600">
          Total: ({rows.length} files, {calculateTotalPages(rows)} pages)
        </span>
        <div  className="flex justify-between items-center mb-4 px-4">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSelectedMenuOpen}
            disabled={selectedRows.length === 0}
          >
            <DownloadIcon className="text-white text-lg mx-1" />
            Download Selected
          </Button>
          <Menu
            anchorEl={selectedAnchorEl}
            open={Boolean(selectedAnchorEl)}
            onClose={handleSelectedMenuClose}
          >
            <MenuItem onClick={() => handleDownloadSelectedClick("pdf")}>
              Download as PDF
            </MenuItem>
            <MenuItem onClick={() => handleDownloadSelectedClick("word")}>
              Download as Word
            </MenuItem>
          </Menu>
        </div>
      </div>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <MuiTable stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < rows.length
                    }
                    checked={
                      rows.length > 0 && selectedRows.length === rows.length
                    }
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedRows(rows.map((row) => row.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    style={{ minWidth: column.minWidth, cursor: "pointer" }}
                    onClick={() => handleSort(column.id)} // Click to sort by column
                  >
                    {column.label}
                    {sortConfig.key === column.id && (
                      <span>
                        {sortConfig.direction === "asc" ? "  🔼" : "   🔽"}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onChange={(event) => handleCheckboxClick(event, row.id)}
                      />
                    </TableCell>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || "left"}
                        >
                          {column.id === "download" ? (
                            <div>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={(event) => handleMenuOpen(event, row)}
                              >
                                Download
                              </Button>
                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                              >
                                <MenuItem
                                  onClick={() => handleDownloadClick("pdf")}
                                >
                                  PDF
                                </MenuItem>
                                <MenuItem
                                  onClick={() => handleDownloadClick("word")}
                                >
                                  Word
                                </MenuItem>
                              </Menu>
                            </div>
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

CompletedTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      minWidth: PropTypes.number.isRequired,
      align: PropTypes.string,
    })
  ).isRequired,
  rows: PropTypes.array,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  selectedRows: PropTypes.array.isRequired,
  setSelectedRows: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleDownloadSelected: PropTypes.func.isRequired,
  projectName: PropTypes.string.isRequired,
  handleDownload: PropTypes.func.isRequired,
};

CompletedTable.defaultProps = {
  rows: [],
};

export default CompletedTable;
