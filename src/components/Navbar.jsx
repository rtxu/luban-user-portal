import React, { useState } from "react";

import { ReactComponent as Logo } from "../assets/logo-name.svg";

function NavLink({ to, children, className }) {
  return (
    <a
      href={to}
      className={
        "text-white text-base font-medium hover:text-gray-400 px-4 py-1 rounded ml-2 " +
        className
      }
    >
      {children}
    </a>
  );
}

function Navbar({ contentClassName }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-gray-900">
      <div
        className={
          "px-4 py-3 h-16 flex items-center justify-between " + contentClassName
        }
      >
        <div>
          <a href="/">
            <Logo className="h-8" />
          </a>
        </div>
        <div>
          <nav className="hidden sm:flex">
            <NavLink to="#">文档</NavLink>
            <NavLink to="#">价格</NavLink>
            <NavLink to="/login">登录</NavLink>
            <NavLink to="/signup" className="bg-red-500">
              注册
            </NavLink>
          </nav>
          <button
            type="button"
            className="sm:hidden block text-gray-500 hover:text-white focus:text-white focus:outline-none"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              {isOpen ? (
                <path
                  fillRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

Navbar.defaultProps = {};

export default Navbar;
