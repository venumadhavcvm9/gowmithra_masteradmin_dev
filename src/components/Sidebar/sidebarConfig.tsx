import {
  FaHome,
  FaUsers,
  FaUserMd,
  FaChartLine,
  FaCapsules,
  FaClipboardList,
  FaClinicMedical,
  FaUserShield,
  FaStore,
  FaMoneyBillWave
} from "react-icons/fa";

export const menus = [
  {
    name: "Dashboard",
    icon: <FaHome />,
    path: "/dashboard",
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
    name: "Area Doctors",
    icon: <FaUserMd />,
    path: "/area-doctors",
  },
  {
    name: "Sales",
    icon: <FaChartLine />,
    path: "/sales",
  },
  {
    name: "Manage Team",
    icon: <FaUserShield />,
    path: "/team",
  },
  {
    name: "Stores",
    icon: <FaStore />,
    path: "/stores",
  },
  {
    name: "Users",
    icon: <FaUsers />,
    path: "/users",
  },
  {
    name: "Vendors",
    icon: <FaClinicMedical />,
    path: "/vendors",
  },
  {
    name: "Settlements",
    icon: <FaMoneyBillWave />,
    path: "/pharmacy-settlements",
  },
];
