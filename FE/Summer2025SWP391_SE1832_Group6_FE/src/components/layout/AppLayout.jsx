import { Outlet } from "react-router-dom";
import Navbar from "../../components/bar/Navbar";
import Footer from "../../components/bar/Footer";

const AppLayout = () => (
  <>
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
);

export default AppLayout;
