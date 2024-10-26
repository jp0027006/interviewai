import React, { useState, useContext } from "react";
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarFooter,
} from "cdbreact";
import avatar from "../../assets/boy.png";
import logo from "../../assets/InterviewAI_png2.png";
import { Link, NavLink } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { LuHistory } from "react-icons/lu";
import { TiHome } from "react-icons/ti";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { UserContext } from "../../context/UserContext.jsx";

const Sidebar = ({ collapsed, setCollapsed, isMobile }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { userData, logout } = useContext(UserContext);

  const toggleCollapse = () => setCollapsed(!collapsed);

  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("email");
    logout();
    navigate("/");
    setShowModal(false); // Close the modal
  };

  return (
    <div className="h-screen fixed transition-all duration-300">
      <CDBSidebar
        className={`transition-all duration-500 ease-in-out h-screen bg-white ${
          collapsed ? "collapsed" : ""
        }`}
        style={{
          boxShadow: "rgba(0, 0, 0, 0.20) 0px 5px 15px",
          borderTopRightRadius: "1rem",
          borderBottomRightRadius: "1rem",
          width: collapsed ? "80px" : "250px",
        }}
      >
        <CDBSidebarHeader
          prefix={
            <i
              onClick={toggleCollapse}
              className={`${
                collapsed
                  ? "fas fa-bars text-black"
                  : "fas fa-times mt-2 text-black"
              }`}
              style={{ transition: "transform 0.3s ease-in-out" }} // Smooth transition for the toggle icon
            />
          }
        >
          <img
            alt="Logo"
            className="h-9 rounded-full"
            src={logo}
            style={{ transition: "opacity 0.3s ease-in-out" }} // Smooth transition for logo visibility
          />
        </CDBSidebarHeader>

        <CDBSidebarContent>
          <CDBSidebarMenu>
            <div
              className={`${
                collapsed ? "px-3" : "px-4"
              } mb-32 flex flex-col space-y-4`}
            >
              <NavLink
                to="/dashboard"
                className={({ isActive, isPending }) =>
                  isPending
                    ? "text-black no-underline p-2 rounded-md deactivate"
                    : isActive
                    ? "text-white no-underline p-2 rounded-md active"
                    : "text-black no-underline p-2 rounded-md deactivate"
                }
              >
                <span className="flex items-center transition-all duration-300">
                  <span className="flex items-center justify-center">
                    {!collapsed && ""}
                    <TiHome className={collapsed ? "ms-1" : ""} size={"22px"} />
                  </span>
                  <span
                    className={`${
                      collapsed ? "d-none" : "ms-2 opacity-100"
                    } transition-opacity duration-300`}
                    style={{
                      transition: "opacity 0.3s ease-in-out",
                    }}
                  >
                    Dashboard
                  </span>
                </span>
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive, isPending }) =>
                  isPending
                    ? "text-black no-underline p-2 rounded-md deactivate"
                    : isActive
                    ? "text-white no-underline p-2 rounded-md active"
                    : "text-black no-underline p-2 rounded-md deactivate"
                }
              >
                <span className="flex items-center transition-all duration-300">
                  <span className="flex items-center justify-center">
                    {!collapsed && ""}
                    <LuHistory
                      className={collapsed ? "ms-1" : ""}
                      size={"22px"}
                    />
                  </span>
                  <span
                    className={`${
                      collapsed ? "d-none" : "ms-2 opacity-100"
                    } transition-opacity duration-300`}
                    style={{
                      transition: "opacity 0.3s ease-in-out",
                    }}
                  >
                    History
                  </span>
                </span>
              </NavLink>
            </div>
          </CDBSidebarMenu>
        </CDBSidebarContent>

        <div
          className={`${
            collapsed ? "opacity-0" : "opacity-100"
          } transition-all duration-500 ease-in-out`}
        >
          <Link className="no-underline" to={"/profile"}>
            <div className="max-w-xs w-full px-4 -mb-6">
              <div
                style={{
                  backgroundImage:
                    "radial-gradient(88% 100% at top, hsla(0, 0%, 100%, .5), hsla(0, 0%, 100%, 0))",
                }}
                className="bg-indigo-800 hover:bg-indigo-900 overflow-hidden relative h-fit rounded-md max-w-sm mx-auto flex flex-col justify-between p-4"
              >
                <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
                <div className="flex items-center space-x-4 z-10 justify-center">
                  <img
                    height="70"
                    width="70"
                    alt="Avatar"
                    className="h-13 w-13 rounded-full"
                    src={userData?.avatar || avatar}
                    style={{ transition: "opacity 0.3s ease-in-out" }} // Smooth transition for avatar visibility
                  />
                </div>
                <div className="text content text-center">
                  <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
                    {userData?.firstName || "Loading your data"}{" "}
                    {userData?.lastName || ""}
                  </h1>
                  <p className="font-normal overflow-hidden text-sm text-gray-50 relative -mb-px z-10">
                    {userData?.email || ""}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className={`${collapsed ? "" : "hidden"}`}>
          <Link className="no-underline h-fit" to={"/profile"}>
            <div className="max-w-xs w-full px-3">
              <div className="flex items-center space-x-4 z-10 justify-center">
                <img
                  height="90"
                  width="90"
                  alt="Avatar"
                  className="h-12 w-12 rounded-full"
                  src={userData?.avatar || avatar}
                  style={{ transition: "opacity 0.3s ease-in-out" }} // Smooth transition for avatar visibility
                />
              </div>
            </div>
          </Link>
        </div>

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
              className={`bg-red-600 flex items-center justify-center relative group/btn w-full text-white rounded-md h-10 font-medium ${
                collapsed ? "icon" : "text-and-icon mt-7"
              }`}
              type="button"
              onClick={() => setShowModal(true)}
              style={{ transition: "opacity 0.3s ease-in-out" }}
            >
              <span className="flex items-center justify-center">
                {!collapsed && "Logout"}
                <LuLogOut className={collapsed ? "" : "ms-2"} />
              </span>
            </Button>
          </div>
        </CDBSidebarFooter>
      </CDBSidebar>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="bg-white flex flex-column items-center justify-center rounded-md">
          <i
            className="text-red-500 mb-3 fa fa-exclamation-triangle"
            aria-hidden="true"
            style={{ fontSize: "2rem" }}
          ></i>
          <h4>Are you sure you want to log out?</h4>
          <p className="text-gray-600 mt-1 mb-3">
            Logging out will return you to the login screen.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="hover:bg-gray-300 bg-gray-200 rounded-md shadow-md w-20"
              type="reset"
            >
              Cancel
            </button>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      
    </div>
  );
};

export default Sidebar;
