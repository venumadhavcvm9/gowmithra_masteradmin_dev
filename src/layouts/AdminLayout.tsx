import "./layout.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function AdminLayout({ children }: any) {
  return (
    <div className="layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="layout-main">
        
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="layout-content">
          {children}
        </div>

        {/* Footer */}
        <Footer />

      </div>
    </div>
  );
}