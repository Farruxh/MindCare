import { PuffLoader } from "react-spinners";
import {useAuth} from "../../context/AuthContext";

export default function Loader() {
    const { user } = useAuth();

    return (
        <div className="fixed inset-0 bg-black/0 backdrop-blur z-50 flex items-center justify-center">
            {user?.dark_mode === "dark" ? <PuffLoader color="#ffffff" size={90} /> : <PuffLoader size={90} />}
        </div>
    )
}