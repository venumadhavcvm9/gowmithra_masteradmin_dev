import { FiSearch } from "react-icons/fi";

export default function SearchBox() {
  return (
    <div className="header-left">
      <div className="search-box">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search farmers, doctors, medicines..."
        />
        <span className="search-shortcut">⌘K</span>
      </div>
    </div>
  );
}
