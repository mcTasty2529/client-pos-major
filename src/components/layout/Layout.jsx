import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default Layout;
