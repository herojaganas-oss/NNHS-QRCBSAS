import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import TeacherDashboard from "./pages/TeacherDashboard";
import Scanner from "./pages/Scanner";
import AttendanceRecords from "./pages/AttendanceRecords";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/admin/settings",
    Component: AdminSettings,
  },
  {
    path: "/teacher",
    Component: TeacherDashboard,
  },
  {
    path: "/teacher/scanner",
    Component: Scanner,
  },
  {
    path: "/teacher/attendance",
    Component: AttendanceRecords,
  },
]);
