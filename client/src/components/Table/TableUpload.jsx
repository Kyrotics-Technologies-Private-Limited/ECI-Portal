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

const calculateTotalPages = (rows) => {
  return rows.reduce((total, row) => {
    return total + (row.pageCount || 0);
  }, 0);
};

function TableUpload({
  columns,
  rows = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEditClick,
  selectedRows = [],
  setSelectedRows,
  handleDeleteSelected,
  projectName,
}) {
  const handleCheckboxClick = (event, id) => {
    if (event.target.checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((row) => row.id !== id));
    }
  };

  const handleDeleteSelectedClick = () => {
    handleDeleteSelected();
  };

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

  const selectedRowsData = rows.filter((row) => selectedRows.includes(row.id));
  const totalSelectedPages = calculateTotalPages(selectedRowsData);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-4">
        {selectedRows?.length > 0 && (
          <span>
            {selectedRows.length} selected, {totalSelectedPages} pages
          </span>
        )}
        <span className="text-lg font-normal text-gray-600">
          Total: ({rows?.length || 0} files, {calculateTotalPages(rows || [])}{" "}
          pages)
        </span>
        <Button
          variant="contained"
          color="warning"
          onClick={() => {
            handleDeleteSelectedClick();
          }}
          disabled={selectedRows?.length === 0}
        >
          Delete Selected
        </Button>
      </div>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <MuiTable stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows?.length > 0 &&
                      selectedRows?.length < (rows?.length || 0)
                    }
                    checked={
                      rows?.length > 0 && selectedRows?.length === rows.length
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
                {columns?.map((column) => (
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
              {sortedRows && sortedRows.length > 0 ? (
                sortedRows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.id || index}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.includes(row.id)}
                          onChange={(event) =>
                            handleCheckboxClick(event, row.id)
                          }
                        />
                      </TableCell>
                      {columns?.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align || "left"}
                          >
                            {column.id === "edit" ? (
                              <div>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={() =>
                                    handleEditClick &&
                                    handleEditClick(row.id, row.name)
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            ) : (
                              value
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns?.length || 1}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    No files available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

TableUpload.propTypes = {
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
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEditClick: PropTypes.func,
  selectedRows: PropTypes.array.isRequired,
  setSelectedRows: PropTypes.func.isRequired,
  projectName: PropTypes.string.isRequired,
};

TableUpload.defaultProps = {
  rows: [],
  handleEditClick: null,
};

export default TableUpload;
