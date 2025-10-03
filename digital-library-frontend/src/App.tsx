import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

// ✅ import the real pages
import Login from "./pages/Login";
import MyNotes from "./pages/MyNotes";
import UploadNote from "./pages/UploadNote";
import Feed from "./pages/Feed";
import Admin from "./pages/Admin";
import StudentDashboard from "./pages/StudentDashboard";
import RoleProtected from "./auth/RoleProtected";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/notes" />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <MyNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadNote />
              </ProtectedRoute>
            }
          />

          <Route path="/feed" element={<Feed />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>}/>
          <Route path="/dashboard"element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}/>
          <Route path="*" element={<div className="page"><h1>Not found</h1></div>} />
          <Route path="/admin"element={<RoleProtected roles={["ADMIN"]}><Admin /></RoleProtected>}/>
          <Route path="/401" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
