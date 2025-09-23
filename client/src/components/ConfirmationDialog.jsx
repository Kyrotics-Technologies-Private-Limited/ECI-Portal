import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { Warning } from "@mui/icons-material";

const ConfirmationDialog = ({
  open,
  handleClose,
  handleConfirm,
  title,
  message,
}) => {
  const handleConfirmAndClose = () => {
    handleConfirm();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" className="flex items-center gap-2">
        <Warning className="text-red-500" />
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} className="text-gray-500">
          Cancel
        </Button>
        <Button
          onClick={handleConfirmAndClose}
          className="bg-red-500 hover:text-white hover:bg-red-600"
          autoFocus
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
