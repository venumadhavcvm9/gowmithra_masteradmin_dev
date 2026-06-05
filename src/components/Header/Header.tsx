// src/components/Header/Header.tsx

import "./header.css";
import SearchBox from "./components/SearchBox";
import NotificationsDropdown from "./components/NotificationsDropdown";
import UserProfile from "./components/UserProfile";
import LogoutButton from "./components/LogoutButton";

export default function Header() {
  return (
    <header className="header">
      {/* SEARCH BOX */}
      <SearchBox />

      {/* RIGHT ACTIONS */}
      <div className="header-right">
        {/* NOTIFICATIONS DROPDOWN */}
        <NotificationsDropdown />

        {/* PROFILE SECTION */}
        <UserProfile />

        <div className="divider-vertical"></div>

        {/* LOGOUT */}
        <LogoutButton />
      </div>
    </header>
  );
}