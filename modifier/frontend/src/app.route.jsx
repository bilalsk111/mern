import { createBrowserRouter } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/components/Protected";
import Home from "./features/home/pages/Home";
import Hero from "./features/home/pages/Hero";

const BowserRouter = createBrowserRouter([
  {
    path: "/",
    element: <Hero />,
  },
  {
    path: "/home",
    element: (
      <Protected>
        <Home />
      </Protected>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export default BowserRouter;
