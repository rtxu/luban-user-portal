import Navbar from "../components/Navbar";
import DefaultBg from "../assets/default_bg.svg";

import { Icon } from "antd";

function IntroHeader() {
  return (
    <div
      className="flex items-center justify-center bg-cover bg-gray-600 mb-1"
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
            鲁班提供简单易用的积木组件
            <span className="hidden sm:inline">，</span>
            <br className="sm:hidden" />
            以组装乐高的方式<span className="hidden sm:inline">，</span>
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

function Paragraph({ className, children }) {
  return <p className={className + " leading-tight text-black"}>{children}</p>;
}

function Text({ className, children }) {
  return (
    <span className={className + " leading-tight text-black"}>{children}</span>
  );
}

function IntroDetail() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="sm:mx-10">
        <div className="grid-columns-1 grid-row-gap-20 sm:grid-columns-1-2 sm:grid-column-gap-20 mt-16">
          <div className="mx-5 sm:mx-0 grid-row-2 sm:grid-row-1 sm:grid-column-1 flex items-center">
            <div>
              <h2 className="text-gray-800 text-lg font-bold">组件库</h2>
              <Paragraph className="mt-2">
                在开发应用的过程中，一些通用的组件被反复使用：表格、按钮、文本输入框等
              </Paragraph>
              <Paragraph className="mt-2">
                我们实现了一套简单易用的组件库，内含丰富组件，可以覆盖绝大多数应用场景
              </Paragraph>
              <Paragraph className="my-4">
                <Text>缺少组件？</Text>
                <button type="button" className="bg-gray-900 px-5 py-2 rounded">
                  <a
                    href="#"
                    className="text-white hover:text-gray-400 tracking-wider"
                  >
                    提交需求
                  </a>
                </button>
              </Paragraph>
            </div>
          </div>
          <img
            src={DefaultBg}
            alt=""
            className="grid-row-1 sm:grid-row-1 sm:grid-column-2 h-64 w-full object-cover"
          ></img>
        </div>
        <div className="grid-columns-1 grid-row-gap-20 sm:grid-columns-2-1 sm:grid-column-gap-20 mt-16">
          <div className="mx-5 sm:mx-0 grid-row-2 sm:grid-row-1 sm:grid-column-2 flex items-center">
            <div>
              <h2 className="text-gray-800 text-lg font-bold">编辑器</h2>
              <Paragraph className="mt-2">
                我们提供了一个简单直觉的编辑器
              </Paragraph>
              <Paragraph className="mt-2">
                以<Text className="font-bold">拖拽</Text>的方式布局组件
              </Paragraph>
              <Paragraph className="mt-2">
                组件级别的<Text className="font-bold">配置面板</Text>
                ，轻松定制组件的界面、数据和交互行为
              </Paragraph>
              <Paragraph className="mt-2">
                组件间<Text className="font-bold">数据流打通</Text>
                ，用户数据在应用内无缝共享
              </Paragraph>
            </div>
          </div>
          <img
            src={DefaultBg}
            alt=""
            className="grid-row-1 sm:grid-row-1 sm:grid-column-1 h-64 w-full object-cover"
          ></img>
        </div>
        <div className="grid-columns-1 grid-row-gap-20 sm:grid-columns-1-2 sm:grid-column-gap-20 mt-16">
          <div className="mx-5 sm:mx-0 grid-row-2 sm:grid-row-1 sm:grid-column-1 flex items-center">
            <div>
              <h2 className="text-gray-800 text-lg font-bold">数据源</h2>
              <Paragraph className="mt-2">
                <Text className="font-bold">数据私有</Text>
                ，我们仅对数据进行加工与处理
              </Paragraph>
              <Paragraph className="mt-2">
                多种数据源支持，以及基于 HTTP 的 API，实现数据的无缝接入
              </Paragraph>
              <Paragraph className="mt-2">
                我们负责读取和写回数据，助你快速搭建 UI，
                <Text className="font-bold">你只需完成专属于你的业务逻辑</Text>
              </Paragraph>
              <Paragraph className="my-4">
                <Text>缺少数据源？</Text>
                <button type="button" className="bg-gray-900 px-5 py-2 rounded">
                  <a
                    href="#"
                    className="text-white hover:text-gray-400 tracking-wider"
                  >
                    提交需求
                  </a>
                </button>
              </Paragraph>
            </div>
          </div>
          <img
            src={DefaultBg}
            alt=""
            className="grid-row-1 sm:grid-row-1 sm:grid-column-2 h-64 w-full object-cover"
          ></img>
        </div>
      </div>
    </div>
  );
}

function IntroSummary() {
  return (
    <div className="py-10 flex flex-wrap">
      <div className="mb-10 flex-basis-full sm:flex-basis-1/2 flex items-center justify-center">
        <div style={{ minWidth: 240 }}>
          <Icon type="stop" theme="filled" style={{ fontSize: "2rem" }} />
          <h3 className="mt-2 text-2xl font-bold">快速构建</h3>
          <p className="text-lg">
            {/*简单易用的组件库，高效直觉的编辑器，支持多种数据源*/}
            组件库/编辑器/数据源
          </p>
        </div>
      </div>
      <div className="mb-10 flex-basis-full sm:flex-basis-1/2 flex items-center justify-center">
        <div style={{ minWidth: 240 }}>
          <Icon type="stop" theme="filled" style={{ fontSize: "2rem" }} />
          <h3 className="mt-2 text-2xl font-bold">访问控制</h3>
          <p className="text-lg">仅内部用户可访问</p>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <>
      <Navbar contentClassName="max-w-6xl mx-auto" />
      <main className="min-h-screen">
        <section>
          <IntroHeader />
        </section>
        <section className="max-w-6xl bg-white mx-auto">
          <IntroSummary />
        </section>
        <section className="max-w-6xl bg-white mx-auto">
          <IntroDetail />
        </section>
      </main>
      <footer className="h-32 px-10 mt-20 bg-gray-200 flex items-center justify-center">
        <p className="text-center">
          Copyright © 2019 luban, Inc. All rights reserved.
        </p>
      </footer>
    </>
  );
}

export default Container;
