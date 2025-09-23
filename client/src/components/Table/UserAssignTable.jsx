import React,  { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import MuiTable from '@mui/material/Table';


const calculateTotalPages = (rows) => {
  return rows.reduce((total, row) => {
    return total + (row.pageCount || 0);
  }, 0);
};

function UserAssignTable({
  columns,
  rows = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEditClick,
  projectName,
}) {
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


  return (
    <div>
      <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: "24px" }} className='py-10'>{projectName}<span className="ml-4 text-lg font-normal text-gray-600">
       ({rows.length} files, {calculateTotalPages(rows)} pages)
      </span></h2>
      <Paper sx={{ width: '95%', overflow: 'hidden', margin:'auto' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <MuiTable stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                   <TableCell
                   key={column.id}
                   align={column.align || "left"}
                   style={{ minWidth: column.minWidth, cursor: 'pointer' }}
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
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align || 'left'} >
                          {column.id === 'assign' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleEditClick && handleEditClick(row.id, row.name)}
                            >
                              Assign
                            </Button>
                          ) : value}
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

UserAssignTable.propTypes = {
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
  projectName: PropTypes.string.isRequired,
};

UserAssignTable.defaultProps = {
  rows: [],
  handleEditClick: null,
};

export default UserAssignTable;
