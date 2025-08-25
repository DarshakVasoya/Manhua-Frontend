import React, { useState } from "react";
import {
  mainGenres,
  subGenres,
  demographics,
  format,
  other,
} from "../constants/categories";

const categoryGroups = [
  { label: "Main Genres", categories: mainGenres },
  { label: "Subgenres", categories: subGenres },
  { label: "Demographics", categories: demographics },
  { label: "Format", categories: format },
  { label: "Other", categories: other },
];

export type CategorySelectorProps = {
  selected: string[];
  onChange: (selected: string[]) => void;
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onChange }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = categoryGroups[activeTab].categories.filter((cat) =>
    cat.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCategory = (cat: string) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <div style={{ display: "flex", marginBottom: 8 }}>
        {categoryGroups.map((group, idx) => (
          <button
            key={group.label}
            onClick={() => setActiveTab(idx)}
            style={{
              flex: 1,
              padding: "8px 0",
              background: idx === activeTab ? "#eee" : "#fff",
              border: "none",
              borderBottom: idx === activeTab ? "2px solid #0070f3" : "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            {group.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: 8, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
      />
      <div style={{ maxHeight: 250, overflowY: "auto", border: "1px solid #eee", borderRadius: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 12, color: "#888" }}>No categories found.</div>
        ) : (
          filtered.map((cat) => (
            <label
              key={cat}
              style={{
                display: "block",
                padding: "6px 12px",
                cursor: "pointer",
                background: selected.includes(cat) ? "#e0f7fa" : "#fff",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(cat)}
                onChange={() => toggleCategory(cat)}
                style={{ marginRight: 8 }}
              />
              {cat}
            </label>
          ))
        )}
      </div>
    </div>
  );
};
