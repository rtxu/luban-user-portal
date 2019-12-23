import React, { useState } from "react";

import logo from "../assets/logo-name.svg";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-200">
      <header className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <div>
          <img className="h-8" src={logo} alt="luban" />
        </div>
        <div>
          <div className="flex ">
            <a
              href="#"
              className="text-white px-4 py-1 rounded hover:bg-gray-800 focus:bg-gray-700"
            >
              文档
            </a>
            <a
              href="#"
              className="ml-2 text-white px-4 py-1 rounded hover:bg-gray-800 focus:bg-gray-700"
            >
              价格
            </a>
            <a
              href="#"
              className="ml-2 text-white px-4 py-1 rounded hover:bg-gray-800 focus:bg-gray-700"
            >
              登录
            </a>
            <a
              href="#"
              className="ml-2 text-white px-4 py-1 hover:bg-gray-800 focus:bg-gray-700 border-solid border border-white rounded"
            >
              注册
            </a>
          </div>
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
    </div>
  );
}

Navbar.defaultProps = {};

export default Navbar;
