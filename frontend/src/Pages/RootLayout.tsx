import Navbar from "@/components/Navbar"
import GlobalModalManager from "@/components/orders/GlobalModalManager";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify";

const RootLayout: React.FC = () => {
  useEffect(() => {
    useAuthStore.getState().setIsLoading(false);
  }, [])
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
        <GlobalModalManager />
      </>
    );
}

export default RootLayout;