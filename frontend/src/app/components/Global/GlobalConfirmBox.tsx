import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

export interface GlobalConfirmBoxProps {
  open: boolean;
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GlobalConfirmBox = ({
  open,
  title,
  text,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: GlobalConfirmBoxProps) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{ style: { borderRadius: 12 } }}
  sx={{ backdropFilter: "blur(4px)" }}
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelText}
        </Button>
        <Button 
  onClick={onConfirm} 
  variant="contained" 
  autoFocus
  sx={{ backgroundColor: "#2e3547", color: "text.white", boxShadow: "none" }}
>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

