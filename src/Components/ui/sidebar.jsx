import React, { useState, useEffect } from "react";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
  CDBSidebarFooter,
} from "cdbreact";
import avatar from "../../assets/boy.png";
import logo from "../../assets/InterviewAI_png2.png";
import { Link } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Handle collapse toggle
  const toggleCollapse = () => setCollapsed(!collapsed);

  // Function to handle logout
  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("email");
    navigate("/");

    // Close the modal programmatically
    const modalElement = document.getElementById("exampleModal");
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.hide();
    }
  };

  // Cleanup modal backdrop on unmount
  useEffect(() => {
    return () => {
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.remove();
      }
    };
  }, []);

  return (
    <div className="h-screen">
      <CDBSidebar
        className={`h-screen bg-black ${collapsed ? "collapsed" : ""}`}
        style={{
          borderTopRightRadius: "15px",
          borderBottomRightRadius: "15px",
        }}
      >
        {/* Sidebar Header */}
        <CDBSidebarHeader
          prefix={
            <i
              onClick={toggleCollapse}
              className={`${collapsed ? "fas fa-bars" : "fas fa-times mt-2"}`}
            />
          }
        >
          <img alt="Avatar" className="h-9 rounded-full" src={logo} />
        </CDBSidebarHeader>

        {/* Sidebar Content */}
        <CDBSidebarContent>
          <CDBSidebarMenu>
            <CDBSidebarMenuItem icon="th-large">Dashboard</CDBSidebarMenuItem>
            <CDBSidebarMenuItem icon="sticky-note">
              Components
            </CDBSidebarMenuItem>
            <CDBSidebarMenuItem icon="credit-card" iconType="solid">
              Metrics
            </CDBSidebarMenuItem>
          </CDBSidebarMenu>
        </CDBSidebarContent>

        {/* Profile Section */}
        <div className={`${collapsed ? "hidden" : ""}`}>
          <Link className="no-underline" to={"/profile"}>
            <div className="max-w-xs w-full px-4 -mb-6">
              <div
                style={{
                  backgroundImage:
                    "radial-gradient(88% 100% at top, hsla(0, 0%, 100%, .5), hsla(0, 0%, 100%, 0))",
                }}
                className="bg-indigo-800 overflow-hidden relative h-fit rounded-md max-w-sm mx-auto flex flex-col justify-between p-4"
              >
                <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
                <div className="flex items-center space-x-4 z-10 justify-center">
                  <img
                    height="70"
                    width="70"
                    alt="Avatar"
                    className="h-13 w-13 rounded-full"
                    src={avatar}
                  />
                </div>
                <div className="text content text-center">
                  <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
                    Jay Patel
                  </h1>
                  <p className="font-normal text-sm text-gray-50 relative -mb-px z-10">
                    jp0027006@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Section for Collapsed Sidebar */}
        <div className={`${collapsed ? "" : "hidden"}`}>
          <Link className="no-underline h-fit" to={"/profile"}>
            <div className="max-w-xs w-full px-3">
              <div className="flex items-center space-x-4 z-10 justify-center">
                <img
                  height="90"
                  width="90"
                  alt="Avatar"
                  className="h-12 w-12 rounded-full"
                  src={avatar}
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Sidebar Footer with Logout Button */}
        <CDBSidebarFooter style={{ textAlign: "center" }}>
          <div
            className={`${
              collapsed
                ? "sidebar-btn-wrapper px-3"
                : "sidebar-btn-wrapper px-4"
            }`}
            style={{ padding: "20px 5px" }}
          >
            <Button
              variant="danger"
              className={`bg-red-600 flex items-center justify-center relative group/btn block w-full text-white rounded-md h-10 font-medium ${
                collapsed ? "icon" : "text-and-icon mt-7"
              }`}
              type="button"
              data-bs-toggle="modal"
              data-bs-target="#exampleModal"
            >
              <span className="flex items-center justify-center">
                {!collapsed && "Logout"}
                <LuLogOut className={collapsed ? "" : "ms-2"} />
              </span>
            </Button>
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>

      {/* Logout Confirmation Modal */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{borderRadius:"7rem"}}>
            <div className="modal-body bg-black flex flex-column items-center justify-center text-white rounded-2xl">
              <i
                className="text-red-500 mb-3 fa fa-exclamation-triangle"
                aria-hidden="true"
                style={{ fontSize: "2rem" }}
              ></i>
              <h4>Are you sure you want to log out?</h4>
              <p className="text-natural-600 mt-1 mb-3 opacity-75">
                Logging out will return you to the login screen.
              </p>
              <div className="flex">
                <button
                  className="mr-4 btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <Button variant="danger" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
