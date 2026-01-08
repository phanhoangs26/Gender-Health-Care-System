import { Routes, Route } from "react-router-dom";

// Layouts
import { AppLayout, DashboardLayout } from "../components/layout";

// Pages
import {
  Home,
  Profile,
  Consultant,
  ConsultantBooking,
  TestServiceBooking,
  Dashboard,
  StaffDashboard,
  AdminDashboard,
  ConsultantDashboard,
  Blog,
  BlogDetails,
  Login,
  Register,
} from "../pages";

// Routes
import { ProtectedRoute } from "./";

function AppRoute() {
  return (
    <Routes basename={import.meta.env.BASE_URL}>
      <Route element={<DashboardLayout />}>
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={["STAFF"]}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consultant/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CONSULTANT"]}>
              <ConsultantDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/consultant" element={<Consultant />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/consultant-booking" element={<ConsultantBooking />} />
        <Route path="/test-booking" element={<TestServiceBooking />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default AppRoute;
