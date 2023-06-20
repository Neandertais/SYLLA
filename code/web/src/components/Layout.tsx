import { Outlet } from "react-router-dom";

import Header from "@components/Header";
//import SideBar from "@components/SideBar"

export default function Layout() {
  return (
    <>
      <Header />
      <main className="px-8 max-w-6xl mx-auto">
        <Outlet />
      </main>
    </>
  );
}
