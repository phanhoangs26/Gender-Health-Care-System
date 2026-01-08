import { Outlet } from "react-router-dom";

export const DashboardLayout = () => (
  <div className="dashboard-layout">
    <main>
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout;
