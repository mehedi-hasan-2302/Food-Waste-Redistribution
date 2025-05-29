import Navbar from "@/components/Navbar"
import { Outlet } from "react-router-dom"

const RootLayout: React.FC = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
        </>
    )
}

export default RootLayout;