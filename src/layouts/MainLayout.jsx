import { Outlet } from 'react-router-dom';
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="pt-24 px-4 sm:px-8 w-full max-w-[1600px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
