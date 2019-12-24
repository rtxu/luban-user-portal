import Navbar from "../../components/Navbar";
import DefaultBg from "../../assets/default_bg.svg";

function IntroHeader() {
  return (
    <div
      className="mt-2 flex items-center justify-center w-full bg-cover"
      style={{
        minHeight: 620,
        marginBottom: 100,
        backgroundImage: `url(${DefaultBg})`
      }}
    >
      <div class="w-4/5 mb-32 text-center">
        {/* intro content container */}
        <div className="mb-12">
          <div className="mx-auto w-4/5 text-6xl text-white">
            快速构建内部工具
          </div>
          <div className="text-gray-100 text-base opacity-75">
            鲁班提供丰富易用的积木组件，以组装乐高的方式，助你轻松定制专属内部工具
          </div>
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
  return <div></div>;
}

function Container() {
  return (
    <div className="min-h-screen bg-gray-200">
      <Navbar />
      <IntroHeader />
    </div>
  );
}

export default Container;
