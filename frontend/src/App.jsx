import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SearchAlumni from "./pages/SearchAlumni";
import Posts from "./pages/Posts";
import Jobs from "./pages/Jobs";
import Mentorship from "./pages/Mentorship";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/AdminDashboard";


function App() {

  return (

    <Routes>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/profile"
        element={<Profile />}
      />

      <Route
        path="/search-alumni"
        element={<SearchAlumni />}
      />

      <Route
        path="/posts"
        element={<Posts />}
      />

      <Route
        path="/jobs"
        element={<Jobs />}
      />

      <Route
        path="/mentorship"
        element={<Mentorship />}
      />

      <Route
        path="/messages"
        element={<Messages />}
      />

      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>

  );
}


export default App;