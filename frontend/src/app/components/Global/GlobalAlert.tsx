import { Alert, Snackbar } from "@mui/material";
import { useAlert } from "../../context/AlertContext";

export default function GlobalAlert() {
    const { alert, setAlert } = useAlert()
    if (!alert) return null;
    return (
        <Snackbar
            open
            autoHideDuration={2000}
            onClose={() => setAlert(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <Alert severity={alert.severity} onClose={() => setAlert(null)}>
                {alert.message}
            </Alert>
        </Snackbar>
    )
}