import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"
import Sidebar from "./SideBar"

// import Sidebar from "../components/core/Dashboard/Sidebar"
function Dashboard() {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar />
      <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto scrollable-container">
        <div className="mx-auto w-11/12 py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

