"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/useAuth";
import { api } from "@/lib/api";
import { LogOut, ChevronDown } from "lucide-react";

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0)?.toUpperCase() || "";
  const l = lastName?.charAt(0)?.toUpperCase() || "";
  return f + l || "U";
}

function roleBadgeColor(role: string): string {
  switch (role) {
    case "SUPER_ADMIN": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "BUS_OWNER": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "DRIVER": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "PASSENGER": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}

function roleLabel(role: string): string {
  return role.replace(/_/g, " ");
}

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await api.post("/auth/logout");
    } catch {
      // proceed even if API call fails
    }
    logout();
    router.push("/login");
  };

  if (!user) return null;

  const initials = getInitials(user.firstName, user.lastName);

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 10px",
          borderRadius: "8px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        {/* Avatar circle */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 12, fontWeight: 700,
          border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ textAlign: "left" }}>
          <p style={{ color: "white", fontSize: 12, fontWeight: 600, lineHeight: 1, margin: 0 }}>
            {user.firstName} {user.lastName}
          </p>
          <span style={{
            marginTop: 3, display: "inline-block", fontSize: 9,
            fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase",
            padding: "1px 5px", borderRadius: 4, border: "1px solid",
          }} className={roleBadgeColor(user.role)}>
            {roleLabel(user.role)}
          </span>
        </div>
        <ChevronDown style={{ width: 14, height: 14, color: "#71717a", marginLeft: 2, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)",
          width: 220, background: "#18181b", border: "1px solid #27272a",
          borderRadius: 10, boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          zIndex: 9999, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #27272a" }}>
            <p style={{ color: "white", fontSize: 13, fontWeight: 600, margin: 0 }}>
              {user.firstName} {user.lastName}
            </p>
            <p style={{ color: "#71717a", fontSize: 11, fontFamily: "monospace", margin: "2px 0 0" }}>
              {user.phone}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", background: "transparent", border: "none",
              color: "#f87171", fontSize: 13, cursor: "pointer", textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
