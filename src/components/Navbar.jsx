import React, { useState } from "react";

import logo from "../assets/logo-name.svg";

function NavLink({ to, children }) {
  return (
    <a
      href={to}
      className="text-gray-400 hover:text-white px-4 py-1 rounded ml-2 first:ml-0"
    >
      {children}
    </a>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex items-center justify-between bg-gray-900 px-4 py-3">
      <div>
        <a href="/">
          <img className="h-8" src={logo} alt="luban" />
        </a>
      </div>
      <div>
        <nav className="hidden sm:flex">
          <NavLink to="#">文档</NavLink>
          <NavLink to="#">价格</NavLink>
          <NavLink to="#">登录</NavLink>
          <a
            href="#"
            className="ml-2 text-white bg-red-500 px-4 py-1 hover:text-gray-700 active:text-black rounded"
          >
            注册
          </a>
        </nav>
        <button
          type="button"
          class="sm:hidden block text-gray-500 hover:text-white focus:text-white focus:outline-none"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
            {isOpen ? (
              <path
                fill-rule="evenodd"
                d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
              />
            ) : (
              <path
                fill-rule="evenodd"
                d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
              />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}

Navbar.defaultProps = {};

export default Navbar;
