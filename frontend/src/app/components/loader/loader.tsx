import { PuffLoader } from "react-spinners";

export default function Loader() {
    return (
        <div className="fixed inset-0 bg-black/0 backdrop-blur z-50 flex items-center justify-center">
            <PuffLoader size={90} />
        </div>
    )
}