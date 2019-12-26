import Navbar from "../../components/Navbar";
import DefaultBg from "../../assets/default_bg.svg";

function IntroHeader() {
  return (
    <div
      className="flex items-center justify-center w-full bg-cover bg-gray-600 mb-1"
      style={{
        minHeight: 620
      }}
    >
      <div class="w-4/5 mb-32 text-center">
        {/* intro content container */}
        <div className="mb-12">
          <h1 className="mx-auto w-4/5 text-5xl sm:text-6xl text-white">
            快速构建
            <br className="sm:hidden" />
            内部工具
          </h1>
          <p className="text-gray-100 text-sm sm:text-base opacity-75">
            鲁班提供简单易用的积木组件<span className="hidden">，</span>
            <br className="sm:hidden" />
            以组装乐高的方式<span className="hidden">，</span>
            <br className="sm:hidden" />
            助你轻松定制专属内部工具 <br />
            随时修改，快速迭代，不惧需求变更
          </p>
        </div>
        <button
          type="button"
          className="text-gray-900 text-base tracking-wider bg-gray-100 px-10 py-2 rounded"
        >
          <a href="#">试用</a>
        </button>
      </div>
    </div>
  );
}

function Body() {
  return (
    <div className="max-w-6xl mx-auto mt-40 mb-56">
      <div className="sm:mx-10">
        <div className="grid-columns-1 grid-row-gap-20 sm:grid-columns-1-2 sm:grid-column-gap-20 mt-16">
          <div className="mx-5 sm:mx-0 grid-row-2 sm:grid-row-1 sm:grid-column-1">
            <h2 className="text-gray-800 text-lg font-bold">
              Lorem ipsum dolor sit
            </h2>
            <p className="mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            </p>
          </div>
          <img
            src={DefaultBg}
            alt=""
            className="grid-row-1 sm:grid-row-1 sm:grid-column-2 h-64 w-full object-cover"
          ></img>
        </div>
        <div className="grid-columns-1 grid-row-gap-20 sm:grid-columns-2-1 sm:grid-column-gap-20 mt-16">
          <div className="mx-5 sm:mx-0 grid-row-2 sm:grid-row-1 sm:grid-column-2">
            <h2 className="text-gray-800 text-lg font-bold">
              Lorem ipsum dolor sit
            </h2>
            <p className="mt-2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
            </p>
          </div>
          <img
            src={DefaultBg}
            alt=""
            className="grid-row-1 sm:grid-row-1 sm:grid-column-1 h-64 w-full object-cover"
          ></img>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="min-h-screen bg-gray-200 mx-auto antialiased">
      <Navbar />
      <IntroHeader />
      <Body />
    </div>
  );
}

export default Container;
