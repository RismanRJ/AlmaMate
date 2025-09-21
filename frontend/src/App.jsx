import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { Box, } from "@chakra-ui/react";
import Navbar from "./pages/Navbar";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";
import { Button, Spinner } from "@chakra-ui/react";
import ChatPage from "./pages/ChatPage";
import Profile from "./pages/Profile";
import Notification from "./pages/Notification";
import ProfilePage from "./pages/ProfilePage";
import PostCreationForm from "./pages/PostCreationForm";
import EventScheduler from "./pages/EventScheduler";
import JobPostingForm from "./pages/JobPostingForm";
import JobListings from "./pages/ViewJobs";
import EventListings from "./pages/ViewEvents";
import UserManagementPage from "./pages/DownloadUsers";``

function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log(onlineUsers);

  if (isCheckingAuth && !authUser)
    return (
      <div>
        <h1>...Loading</h1>
      </div>
    );

  return (
    <div>
      <Navbar />
      <Box paddingTop="4rem" paddingBottom="5rem">
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/signup"
            element={authUser ? <Navigate to={"/"} /> : <SignUp />}
          />

          <Route
            path="/login"
            element={authUser ? <Navigate to={"/"} /> : <Login />}
          />
          <Route
            path="/chat"
            element={authUser ? <ChatPage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/profile"
            element={authUser ? <Profile /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/notification"
            element={authUser ? <Notification /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/account"
            element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/postcreation"
            element={<PostCreationForm />}
          />
          <Route
            path="/eventscheduler"
            element={<EventScheduler />}
          />
          <Route
            path="/jobpost"
            element={<JobPostingForm />}
          />
          <Route
            path="/postcreation/:postId"
            element={<PostCreationForm />}
          />
          <Route
            path="/eventscheduler/:eventId"
            element={<EventScheduler />}
          />
          <Route
            path="/jobpost/:jobId"
            element={<JobPostingForm />}
          />
          <Route
            path="/jobs"
            element={<JobListings />}
          />
          <Route
            path="/events"
            element={<EventListings />}
          />

          <Route
            path="/downloadusers"
            element={<UserManagementPage />}
          />
        </Routes>
      </Box>
    </div>
  );
}

export default App;
