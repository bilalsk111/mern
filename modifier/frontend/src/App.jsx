import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./app.route";
import { AuthProvider } from "./features/auth/auth.context";
import { SongProvider } from "./features/home/song.context";
import { FavProvider } from "./features/home/fav.context";

const App = () => {
  return (
    <div>
      <AuthProvider>
        <SongProvider>
          <FavProvider>
            <RouterProvider router={router} />
          </FavProvider>
        </SongProvider>
      </AuthProvider>
    </div>
  );
};

export default App;
