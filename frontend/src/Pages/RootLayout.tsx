import Navbar from "@/components/Navbar"
import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify";

const RootLayout: React.FC = () => {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Navbar />
        <main>
          <Outlet />
        </main>
      </>
    );
}

export default RootLayout;