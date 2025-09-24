import React, { useCallback, useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Register AG Grid Modules
ModuleRegistry.registerModules([AllCommunityModule]);

import useDebounce from "../hooks/useDebounce";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Typography } from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import { auth } from "../utils/firebase";
import ConfirmationDialog from "./ConfirmationDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { toast } from "react-hot-toast";
import { server } from "../main";
import Tooltip from "@mui/material/Tooltip";

import {
  fetchFileNameById,
  fetchDocumentUrl,
  updateDocumentContent,
  updateFileStatus,
} from "../services/fileServices";
import { formatDate, fetchServerTimestamp } from "../utils/formatDate";
import { kyroCompanyId } from "../services/companyServices";
import "../App.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Loader from "./common/Loader";
import { recordFileSubmission } from "../services/trackFileServices";



const Editor = () => {
  const { projectId, documentId } = useParams();
  const navigate = useNavigate();

  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [fileName, setFileName] = useState("");
  const [pdfSrc, setPdfSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [kyroId, setKyroId] = useState();
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [role, setRole] = useState();
  // AG Grid specific configurations
  const gridRef = useRef(null);
  const defaultColDef = {
    editable: true,
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100
  };

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [quickFilter, setQuickFilter] = useState("");
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const [csvDelimiter, setCsvDelimiter] = useState('auto');
  const originalCsvRef = useRef('');

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      toast.error(
        "You're offline 😢. Don't refresh the page or you may lose unsaved changes. We'll auto-save when connection returns.",
        {
          duration: 10000,
          id: "offline-toast",
        }
      );
      const submitButton = document.getElementById("submit-button-editor"); // Use ID for submit button
      if (submitButton) submitButton.disabled = true;
    };

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online! Your changes will now be saved.", {
        id: "online-toast",
      });
      const submitButton = document.getElementById("submit-button-editor"); // Use ID for submit button
      if (submitButton) submitButton.disabled = false;
      if (hasUnsavedChanges) {
        saveContent()
          .then(() => {
            setHasUnsavedChanges(false);
            toast.success("Your changes have been saved successfully!");
          })
          .catch((err) => {
            console.error("Error saving changes after reconnection:", err);
            toast.error(
              "Failed to save your changes. Please try saving manually."
            );
          });
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges || !isOnline) {
        e.preventDefault();
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isOnline]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      document.title = `* ${fileName || "Document"} (Unsaved changes)`;
    } else {
      document.title = fileName || "Document";
    }
  }, [hasUnsavedChanges, fileName]);

  useEffect(() => {
    let pingInterval;
    if (navigator.onLine) {
      pingInterval = setInterval(async () => {
        try {
          const response = await fetch(`${server}`, {
            method: "GET",
            signal: AbortSignal.timeout(3000),
          });
          if (!response.ok && isOnline) {
            setIsOnline(false);
            toast.warning(
              "Connection to server is unstable. Your changes will be backed up locally.",
              {
                id: "connection-warning",
                duration: 5000,
              }
            );
          } else if (response.ok && !isOnline) {
            setIsOnline(true);
          }
        } catch (error) {
          if (error.name !== "AbortError" && isOnline) {
            setIsOnline(false);
            toast.warning(
              "Server connection lost. Changes will be saved locally until connection returns.",
              {
                id: "connection-warning",
                duration: 5000,
              }
            );
          }
        }
      }, 30000);
    }
    return () => clearInterval(pingInterval);
  }, [isOnline]);

  const saveContent = async () => {
    if (!gridRef.current) return;

    try {
      if (!navigator.onLine) {
        const csvContent = convertToCSV(rowData, columnDefs);
        localStorage.setItem(`editor_backup_${documentId}`, csvContent);
        setHasUnsavedChanges(true);
        toast.info("Offline: Changes saved to local backup.", {
          id: "local-backup-save",
        });
        return;
      }

      const csvContent = convertToCSV(rowData, columnDefs);
      const blob = new Blob([csvContent], {
        type: "text/csv; charset=utf-8",
      });

      const savedCsvPath = await updateDocumentContent(projectId, documentId, blob);
      setHasUnsavedChanges(false);
      localStorage.removeItem(`editor_backup_${documentId}`);
      return savedCsvPath;
    } catch (err) {
      console.error("Error saving document:", err);
      const csvContent = convertToCSV(rowData, columnDefs);
      localStorage.setItem(`editor_backup_${documentId}`, csvContent);
      setHasUnsavedChanges(true);
      toast.error("Save failed. Changes backed up locally.", {
        id: "remote-save-fail",
      });
    }
  };

  useEffect(() => {
    const checkForLocalBackup = () => {
      const backupContent = localStorage.getItem(`editor_backup_${documentId}`);
      if (backupContent && gridRef.current) {
        toast(
          (t) => (
            <span>
              Found a local backup. Recover it?
              <Button
                sx={{ ml: 1 }}
                size="small"
                variant="outlined"
                onClick={() => {
                  const { headers, data } = parseCSV(backupContent);
                  setColumnDefs(headers);
                  setRowData(data);
                  toast.dismiss(t.id);
                  toast.success("Backup content restored!");
                  localStorage.removeItem(`editor_backup_${documentId}`);
                  setHasUnsavedChanges(true);
                }}
              >
                Yes
              </Button>
              <Button
                sx={{ ml: 1 }}
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  localStorage.removeItem(`editor_backup_${documentId}`);
                  toast.dismiss(t.id);
                }}
              >
                No
              </Button>
            </span>
          ),
          { duration: Infinity, id: "backup-recovery-toast" }
        );
      }
    };
      checkForLocalBackup();
  }, [documentId]);

  // Build column definitions that support headers containing dots by using colId/valueGetter/valueSetter
  const buildColumnDefs = (fields, sampleRows) => {
    return (fields || []).map((fieldName) => {
      const sampleValue = (sampleRows || []).find(
        (r) => r[fieldName] !== '' && r[fieldName] !== undefined && r[fieldName] !== null
      )?.[fieldName];
      const isNumber = typeof sampleValue === 'number';

      const hasDot = typeof fieldName === 'string' && fieldName.includes('.');
      const baseDef = {
        headerName: fieldName,
        filter: true,
      };

      const parsedDef = isNumber
        ? { valueParser: (p) => Number(p.newValue), cellClass: 'ag-right-aligned-cell' }
        : {};

      if (hasDot) {
        return {
          ...baseDef,
          ...parsedDef,
          colId: fieldName,
          valueGetter: (params) => (params.data ? params.data[fieldName] : undefined),
          valueSetter: (params) => {
            if (!params.data) return false;
            params.data[fieldName] = params.newValue;
            return true;
          },
        };
      }
      return { ...baseDef, ...parsedDef, field: fieldName };
    });
  };

  // Determine the best delimiter by testing common candidates and picking the most consistent parse
  const determineDelimiter = (text) => {
    const candidates = [',', ';', '\t', '|'];
    let best = { delimiter: ',', score: -1 };
    for (const d of candidates) {
      try {
        const parsed = Papa.parse(text, {
          delimiter: d,
          header: true,
          dynamicTyping: true,
          skipEmptyLines: 'greedy',
          transformHeader: (h) => h.trim(),
          preview: 50,
        });
        const fields = parsed.meta?.fields || [];
        if (fields.length <= 1) continue;
        const rows = parsed.data || [];
        const consistentRows = rows.slice(0, 50).filter((r) => Object.keys(r).length === fields.length).length;
        const score = fields.length * 10 + consistentRows;
        if (score > best.score) best = { delimiter: d, score };
      } catch (e) {
        // ignore
      }
    }
    if (best.score >= 0) return best.delimiter;
    // fallback to Papa's auto
    const auto = Papa.parse(text, {
      delimiter: '',
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      preview: 50,
    });
    const autoFields = auto.meta?.fields || [];
    if (autoFields.length > 1) return auto.meta?.delimiter || ',';
    return ',';
  };

  const parseCSV = (csvText, overrideDelimiter) => {
    const effectiveDelimiter = overrideDelimiter
      ? overrideDelimiter
      : (csvDelimiter === 'auto' ? '' : csvDelimiter);
    const result = Papa.parse(csvText, {
      delimiter: effectiveDelimiter,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
    });
    if (result.errors && result.errors.length) {
      console.warn('Papa parse errors:', result.errors.slice(0, 3));
    }
    const fields = result.meta?.fields || Object.keys((result.data && result.data[0]) || {});
    const headers = buildColumnDefs(fields, result.data || []);
    const data = result.data || [];
    return { headers, data };
  };

  const convertToCSV = (rowData, columnDefs) => {
    const fields = columnDefs.map((c) => c.colId || c.field || c.headerName);
    return Papa.unparse(rowData, {
      columns: fields,
      delimiter: csvDelimiter === 'auto' ? ',' : csvDelimiter,
      newline: '\n',
      quotes: true,
    });
  };

  const pushHistory = (dataSnapshot) => {
    undoStackRef.current.push(JSON.stringify(dataSnapshot));
    redoStackRef.current = [];
  };

  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;
    const last = undoStackRef.current.pop();
    redoStackRef.current.push(JSON.stringify(rowData));
    const restored = JSON.parse(last);
    setRowData(restored);
    setHasUnsavedChanges(true);
  };

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop();
    undoStackRef.current.push(JSON.stringify(rowData));
    const restored = JSON.parse(next);
    setRowData(restored);
    setHasUnsavedChanges(true);
  };

  const addRow = () => {
    const blankRow = columnDefs.reduce((acc, col) => {
      const key = col.colId || col.field || col.headerName;
      return { ...acc, [key]: '' };
    }, {});
    pushHistory(rowData);
    setRowData((prev) => [...prev, blankRow]);
    setHasUnsavedChanges(true);
  };

  const deleteSelectedRows = () => {
    if (!gridRef.current) return;
    const selected = gridRef.current.api.getSelectedRows();
    if (!selected.length) return;
    pushHistory(rowData);
    const remaining = rowData.filter(r => !selected.includes(r));
    setRowData(remaining);
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const { csvUrl, pdfUrl } = await fetchDocumentUrl(projectId, documentId);
        setPdfSrc(pdfUrl);
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const text = await response.text();
        originalCsvRef.current = text;
        // Improve auto-detection for hosted environments: pick the most consistent delimiter
        const detected = determineDelimiter(text);
        if (csvDelimiter === 'auto') {
          setCsvDelimiter(detected);
        }
        const { headers, data } = parseCSV(text, detected);
        setColumnDefs(headers);
        setRowData(data);
      } catch (err) {
        setError("Error fetching document");
        console.error("Error fetching document:", err);
        toast.error("Could not load document content.");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [projectId, documentId]);


  useEffect(() => {
    const fetchKyroticsCompanyId = async () => {
      try {
        const kyroId = await kyroCompanyId();
        setKyroId(kyroId);
      } catch (err) {
        console.error(err);
      }
    };
    fetchKyroticsCompanyId();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        user.companyId = token.claims.companyId;
        user.roleName = token.claims.roleName;
        setUser(user);
        setCompanyId(user.companyId);
        setRole(user.roleName);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchName = async () => {
      const name = await fetchFileNameById(projectId, documentId);
      setFileName(name);
    };
    fetchName();
  }, [projectId, documentId]);

  const handleSave = async () => {
    const savedCsvPath = await saveContent();
    if (hasUnsavedChanges && isOnline) {
      toast.error("Please ensure changes are saved before submitting.");
      return;
    }
    if (!isOnline) {
      toast.error("You are offline. Cannot submit now.");
      return;
    }

    try {
      const serverDate = await fetchServerTimestamp();
      const formattedDate = formatDate(serverDate);
      // Record file submission before updating status
      await recordFileSubmission({
        projectId,
        documentId,
        userId: user?.uid,
        userName: user?.displayName || user?.name|| user?.email || "Unknown",
        fileName: fileName || "Document",
        fileUrl: savedCsvPath || "",
        companyId,
      });
      if (companyId === kyroId) {
        if (role === "QA") {
          await updateFileStatus(projectId, documentId, {
            status: 5,
            kyro_deliveredDate: formattedDate,
          });
        } else {
          await updateFileStatus(projectId, documentId, {
            status: 4,
            kyro_completedDate: formattedDate,
          });
        }
      } else {
        await updateFileStatus(projectId, documentId, {
          status: 7,
          client_completedDate: formattedDate,
        });
      }
      navigate(-1);
      toast.success("Document status updated successfully!");
    } catch (err) {
      console.error("Error updating document status:", err);
      toast.error("Failed to update document status.");
    }
  };

  const handleDownload = () => {
    try {
      if (!gridRef.current) {
        toast.error("Grid not ready for download");
        return;
      }

      const csvContent = convertToCSV(rowData, columnDefs);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName || 'document'}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
      
      toast.success("CSV file downloaded successfully!");
    } catch (err) {
      console.error("Error downloading CSV:", err);
      toast.error("Error downloading CSV file");
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      toast(
        (t) => (
          <span>
            You have unsaved changes. Are you sure you want to go back?
            <Button
              sx={{ ml: 1 }}
              size="small"
              variant="outlined"
              onClick={() => {
                toast.dismiss(t.id);
                navigate(-1);
              }}
            >
              Yes
            </Button>
            <Button
              sx={{ ml: 1 }}
              size="small"
              variant="outlined"
              color="error"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </Button>
          </span>
        ),
        { duration: 10000, id: "back-confirm-toast" }
      );
    } else {
      navigate(-1);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />{" "}
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-screen flex justify-center items-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
      {/* Toolbar */}
      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #ccc",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Tooltip title="Go back" arrow>
            <IconButton onClick={handleBack} size="small">
              <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          <Typography variant="h6" style={{ marginLeft: "10px" }}>
            {fileName || "CSV Editor"}
          </Typography>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon fontSize="small" />
            <TextField
              size="small"
              placeholder="Quick filter"
              value={quickFilter}
              onChange={(e) => {
                setQuickFilter(e.target.value);
                if (gridRef.current) {
                  gridRef.current.api.setQuickFilter(e.target.value);
                }
              }}
            />
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="delimiter-label">Delimiter</InputLabel>
            <Select
              labelId="delimiter-label"
              value={csvDelimiter}
              label="Delimiter"
              onChange={(e) => {
                const d = e.target.value;
                setCsvDelimiter(d);
                // Re-parse using the original CSV with the new delimiter
                try {
                  const result = Papa.parse(originalCsvRef.current, {
                    delimiter: d === 'auto' ? '' : d,
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: 'greedy',
                    transformHeader: (h) => h.trim(),
                  });
                  const fields = result.meta?.fields || Object.keys((result.data && result.data[0]) || {});
                  const headerDefs = buildColumnDefs(fields, result.data || []);
                  setColumnDefs(headerDefs);
                  setRowData(result.data || []);
                } catch (err) {
                  console.error('Delimiter reparse failed', err);
                }
              }}
            >
              <MenuItem value="auto">Auto</MenuItem>
              <MenuItem value=",">Comma (,)</MenuItem>
              <MenuItem value=";">Semicolon (;)</MenuItem>
              <MenuItem value="\t">Tab</MenuItem>
              <MenuItem value="|">Pipe (|)</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Undo" arrow>
            <span>
              <IconButton onClick={handleUndo} size="small" disabled={!undoStackRef.current.length}>
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo" arrow>
            <span>
              <IconButton onClick={handleRedo} size="small" disabled={!redoStackRef.current.length}>
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Add row" arrow>
            <IconButton onClick={addRow} size="small">
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete selected rows" arrow>
            <IconButton onClick={deleteSelectedRows} size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download CSV" arrow>
              <IconButton onClick={handleDownload} size="small">
              <DownloadIcon />
              </IconButton>
            </Tooltip>
          <Button
            variant="contained"
            color="primary"
                  onClick={handleOpenDialog}
            id="submit-button-editor"
                >
                  Submit
          </Button>
            </div>
          </div>

      {/* Split View: PDF (left) and CSV grid (right) */}
      <div style={{ display: "flex", flex: 1, width: "100%" }}>
        <div style={{ width: "50%", height: "100%", borderRight: "1px solid #e0e0e0", background: "#fafafa" }}>
          {pdfSrc ? (
            <iframe
              title="PDF Preview"
              src={pdfSrc}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#777" }}>
              PDF preview unavailable
            </div>
          )}
        </div>
        <div style={{ width: "50%" }} className="ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          onCellValueChanged={(params) => {
              pushHistory(rowData);
            setHasUnsavedChanges(true);
            const updatedData = gridRef.current.api.getModel().rowsToDisplay.map(row => row.data);
            setRowData(updatedData);
          }}
          onGridReady={(params) => {
            params.api.sizeColumnsToFit();
          }}
          onFirstDataRendered={(params) => {
            params.api.sizeColumnsToFit();
          }}
          enableRangeSelection={true}
          copyHeadersToClipboard={true}
          suppressDragLeaveHidesColumns={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          suppressCellSelection={false}
          stopEditingWhenCellsLoseFocus={true}
            pagination={true}
            paginationAutoPageSize={true}
            suppressCopySingleCellRanges={false}
            suppressCopyRowsToClipboard={false}
            enableCellTextSelection={true}
            enableFillHandle={true}
            undoRedoCellEditing={true}
            undoRedoCellEditingLimit={50}
            enableCharts={false}
            enableRangeHandle={true}
            suppressAggFuncInHeader={true}
            suppressRowVirtualisation={false}
            suppressColumnVirtualisation={false}
          />
        </div>
        <ConfirmationDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          handleConfirm={handleSave}
          title="Confirm Submission"
          message="Are you sure you want to submit?"
        />
      </div>
    </div>
  );
};

export default Editor;
