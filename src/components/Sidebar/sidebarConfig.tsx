import {
  FaHome,
  FaUsers,
  FaUserMd,
  FaChartLine,
  FaCapsules,
  FaClipboardList,
  FaClinicMedical,
  FaUserShield
} from "react-icons/fa";

export const menus = [
  {
    name: "Dashboard",
    icon: <FaHome />,
    path: "/dashboard",
  },
  {
    name: "Manage Team",
    icon: <FaUserShield />,
    path: "/team",
  },
  {
    name: "Sales",
    icon: <FaChartLine />,
    path: "/sales",
  },
  {
    name: "Users",
    icon: <FaUsers />,
    path: "/users",
  },
  {
    name: "Area Doctors",
    icon: <FaUserMd />,
    path: "/area-doctors",
  },
  {
    name: "Medicines",
    icon: <FaCapsules />,
    path: "/medicines",
  },
  {
    name: "Orders",
    icon: <FaClipboardList />,
    path: "/orders",
  },
  {
    name: "Vendors",
    icon: <FaClinicMedical />,
    path: "/vendors",
  },
];
