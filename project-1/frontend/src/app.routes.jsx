import {createBrowserRouter} from 'react-router'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import Feed from './features/post/pages/Feed'
import CreatePost from './features/post/pages/CreatePost'
import Saved from './features/post/pages/Saved'
import Profile from './features/user/pages/Profile'
import MainLayout from './features/post/MainLayout'
import Protected from './features/components/Protected'
import Reels from './features/post/pages/Reels'
import UserSearch from './features/post/pages/UserSearch'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Protected>
      <MainLayout />
    </Protected>,
    children: [
      {
        path: 'feed',
        element: <Feed />
      },
      {
        path: 'create',
        element: <CreatePost />
      },
      {
        path: 'reels',
        element: <Reels />
      },
      {
        path: 'search',
        element: <UserSearch />
      },
      {
        path: 'save',
        element: <Saved />
      },
      {
        path: 'profile/:username',
        element: <Profile />
      }
    ]
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/login',
    element: <Login />
  }
]);

// import { createBrowserRouter, Navigate } from "react-router-dom";
// import Login from "./features/auth/pages/Login";
// import Register from "./features/auth/pages/Register";
// import Feed from "./features/auth/pages/Feed";
// import { useAuth } from "./features/auth/hooks/useAuth";

// const Protected = ({ children }) => {
//   const { user, loading } = useAuth();

//   if (loading) return null;

//   return user ? children : <Navigate to="/login" />;
// };
// const Public = ({ children }) => {
//   const { user, loading } = useAuth();

//   if (loading) return null;

//   return user ? <Navigate to="/feed" /> : children;
// };
// export const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Navigate to="/feed" />,
//   },
//   {
//     path: "/login",
//     element: (
//       <Public>
//         <Login />
//       </Public>
//     ),
//   },
//   {
//     path: "/register",
//     element: (
//       <Public>
//         <Register />
//       </Public>
//     ),
//   },
//   {
//     path: "/feed",
//     element: (
//       <Protected>
//         <Feed />
//       </Protected>
//     ),
//   },
// ]);