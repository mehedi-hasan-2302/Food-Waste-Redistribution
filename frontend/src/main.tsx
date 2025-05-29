import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import './index.css'
import RootLayout from './Pages/RootLayout.tsx'
import Home from './Pages/primary/Home.tsx';
import Services from './Pages/primary/Services.tsx';
import About from './Pages/primary/About.tsx';
import Contact from './Pages/primary/Contact.tsx';
import LoginPage from './Pages/Auth/LoginPage.tsx';
import SignupPage from './Pages/Auth/signup/SignupPage.tsx';
import NotFound from './Pages/NotFound.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true, // This makes HomePage the default child route for "/"
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "services",
        element: <Services />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignupPage />,
      },
      {
        path: "*",
        element: <NotFound />,
      }
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
