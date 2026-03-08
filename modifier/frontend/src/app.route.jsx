import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/components/Protected";
import Home from "./features/home/pages/Home";
import Hero from "./features/home/pages/Hero";
import MainLayout from "./features/home/components/MainLayout";
import Recommend from "./features/home/pages/Recommend";
import Profile from "./features/home/pages/Profile";
import Favorites from "./features/home/pages/Favorites";

const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: <Hero />,
  },
  {
    element: <Protected />, 
    children: [
      {
        element: <MainLayout />, 
        children: [
          { path: "/home", element: <Home /> },
          { path: "/profile", element: <Profile /> },
          { path: "/recommendation", element: <Recommend /> },
          { path: "/fav", element: <Favorites /> },
        ],
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

export default BrowserRouter;