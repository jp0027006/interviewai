import React, { useContext, useState } from "react";
import { Offcanvas, Button, Modal } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { LuHistory } from "react-icons/lu";
import { TiHome } from "react-icons/ti";
import { UserContext } from "../context/UserContext";
import avatar from "../assets/boy.png";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const OffCanvasMenu = ({ show, onHide }) => {
  const navigate = useNavigate();
  const { userData, logout } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    Cookies.remove("authToken");
    Cookies.remove("email");
    logout();
    navigate("/");
    setShowModal(false); // Close the modal
  };

  return (
    <>
      <Offcanvas
        show={show}
        onHide={onHide}
        placement="start"
        style={{
          width: "70%",
          borderTopRightRadius: "15px",
          borderBottomRightRadius: "15px",
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          display: "flex",
          flexDirection: "column", // Use column layout
        }}
      >
        <Offcanvas.Body className="d-flex flex-column flex-grow-1">
          <div>
            <NavLink className="no-underline" to={"/profile"}>
              <div className="w-full -mb-6">
                <div
                  style={{
                    backgroundImage:
                      "radial-gradient(88% 100% at top, hsla(0, 0%, 100%, .5), hsla(0, 0%, 100%, 0))",
                  }}
                  className="bg-indigo-800 overflow-hidden h-fit rounded-md mx-auto flex flex-col justify-between p-4"
                >
                  <div className="flex items-center space-x-4 z-10 justify-center">
                    <img
                      height="70"
                      width="70"
                      alt="Avatar"
                      className="h-13 w-13 rounded-full"
                      src={userData?.avatar || avatar}
                    />
                  </div>
                  <div className="text content text-center">
                    <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
                      {userData?.firstName || "User"} {userData?.lastName || ""}
                    </h1>
                    <p className="font-normal overflow-hidden text-sm text-gray-50 relative -mb-px z-10">
                      {userData?.email || "Email not available"}
                    </p>
                  </div>
                </div>
              </div>
            </NavLink>
          </div>
          <div className="mt-5 flex flex-col space-y-5">
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
                  <TiHome size={"22px"} />
                </span>
                <span
                  className="ms-2 opacity-100 transition-opacity duration-300"
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
                  <LuHistory size={"22px"} />
                </span>
                <span
                  className="ms-2 opacity-100 transition-opacity duration-300"
                  style={{
                    transition: "opacity 0.3s ease-in-out",
                  }}
                >
                  History
                </span>
              </span>
            </NavLink>
          </div>
          <div className="mt-auto mb-3">
            <Button
              variant="danger"
              className="bg-red-600 flex items-center justify-center relative group/btn w-full text-white rounded-md h-11 font-medium text-and-icon"
              type="button"
              onClick={() => setShowModal(true)}
            >
              <span className="flex items-center justify-center">
                Logout
                <LuLogOut className="ms-2" />
              </span>
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body
          className="rounded-md flex flex-column items-center justify-center"
          style={{ boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px" }}
        >
          <i
            className="text-red-500 mb-3 fa fa-exclamation-triangle"
            aria-hidden="true"
            style={{ fontSize: "2rem" }}
          ></i>
          <h4>Are you sure you want to log out?</h4>
          <p className="text-gray-600 mt-1 mb-3 opacity-75">
            Logging out will return you to the login screen.
          </p>
          <div className="flex">
            <Button
              variant="outline-dark"
              onClick={() => setShowModal(false)}
              className="mr-4"
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OffCanvasMenu;
