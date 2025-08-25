import React, { useState } from "react";
import { mainGenres, subGenres, demographics, format, other } from "../constants/categories";

const allGenres: string[] = [
  ...mainGenres,
  ...subGenres,
  ...demographics,
  ...format,
  ...other,
];

export type AdvancedSearchBarProps = {
  onSearch: (filters: { genres: string[] }) => void;
};

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({ onSearch }) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [genres, setGenres] = useState<string[]>([]);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!openDropdown) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  const handleGenreChange = (g: string) => {
    setGenres(genres.includes(g) ? genres.filter((x: string) => x !== g) : [...genres, g]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ genres });
  };

  React.useEffect(() => {
    if (!openDropdown) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  return (
    <form
      className="advancedsearch-bar"
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 0,
        background: "var(--color-bg)",
        borderRadius: 5,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: "3px 4px",
        flexWrap: "wrap",
        position: "relative",
        border: "1px solid var(--color-border)",
        fontSize: "11px",
        width: "100%",
        maxWidth: "100%"
      }}
    >
      {/* Genre Dropdown Button */}
      <div style={{ minWidth: 70, maxWidth: 150, marginRight: 10 }}>
        <button
          ref={buttonRef}
          type="button"
          className="dropdown-toggle"
          onClick={() => setOpenDropdown((v) => !v)}
          style={{
            width: "100%",
            cursor: "pointer",
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "5px 10px",
            fontWeight: 600,
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: openDropdown ? "0 2px 8px rgba(0,0,0,0.10)" : undefined,
            letterSpacing: 0.5,
            transition: "box-shadow 0.2s"
          }}
        >
          Genre
          <span id="filtercount" style={{ color: "#0070f3", marginLeft: 8, fontWeight: 700 }}>
            {genres.length === 0 ? "All" : genres.length + " Selected"}
          </span>
          <i className="fa fa-angle-down" />
        </button>
      </div>
      {/* Genre Dropdown Menu (matches searchbar width) */}
      {openDropdown && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            zIndex: 20,
            background: "var(--color-bg)",
            border: "0.5px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            borderRadius: 8,
            padding: 7,
            minWidth: "100%",
            width: "100%",
            maxWidth: "100%",
            left: 0,
            top: 34,
            maxHeight: 220,
            overflowY: "auto",
            display: "grid",
            gap: 4,
            gridTemplateColumns:
              typeof window !== "undefined" && window.innerWidth > 600
                ? "repeat(8, 1fr)"
                : "repeat(auto-fit, minmax(120px, 1fr))"
          }}
        >
          {allGenres.map((g: string) => {
            const selected = genres.includes(g);
            return (
              <label
                key={g}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: selected ? "var(--color-accent)" : "var(--color-bg-hover)",
                  color: selected ? "#fff" : "var(--color-text)",
                  borderRadius: 6,
                  padding: "2px 5px",
                  cursor: "pointer",
                  border: selected ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                  fontSize: "11px",
                  fontWeight: 500,
                  boxShadow: selected ? "0 1px 4px rgba(0,0,0,0.08)" : undefined,
                  transition: "background 0.2s, border 0.2s, box-shadow 0.2s"
                }}
              >
                <input
                  className="genre-item"
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleGenreChange(g)}
                  style={{ marginRight: 6, width: 14, height: 14, accentColor: "var(--color-accent)" }}
                />
                {g}
              </label>
            );
          })}
        </div>
      )}
      {/* Search Button */}
      <div className="filter submit" style={{ marginLeft: "auto" }}>
        <button
          type="submit"
          className="btn btn-custom-search"
          style={{
            cursor: "pointer",
            padding: "5px 10px",
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: "11px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            display: "flex",
            alignItems: "center",
            letterSpacing: 0.5,
            transition: "background 0.2s"
          }}
        >
          <i className="fa fa-search" style={{ marginRight: 5, fontSize: 15 }} /> Filter
        </button>
      </div>
    </form>
  );
}