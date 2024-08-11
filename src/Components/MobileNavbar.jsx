// src/components/MobileNavbar.jsx
import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/InterviewAI_png2.png";
import OffCanvasMenu from "./OffCanvasMenu";

const MobileNavbar = () => {
  const [showOffCanvas, setShowOffCanvas] = useState(false);

  const handleToggleOffCanvas = () => setShowOffCanvas(!showOffCanvas);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <>
      <nav
        className="fixed left-0 top-0 py-3 w-full text-white flex justify-between items-center px-4"
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        <Link to="/dashboard" className="text-black flex items-center">
          <img alt="Logo" className="h-9" src={logo} />
        </Link>
        <button onClick={handleToggleOffCanvas} className="flex items-center">
          <i className="text-black fas fa-bars" />
        </button>
      </nav>

      <OffCanvasMenu show={showOffCanvas} onHide={handleToggleOffCanvas} />
    </>
  );
};

export default MobileNavbar;
