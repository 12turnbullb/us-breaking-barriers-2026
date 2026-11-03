import type { ReactNode } from "react"
import type { FacultyUser, Role } from "../types"
import { BrandMark, Icon, initials, type Page } from "./ui"
import { getNavigation, getRoute } from "../routes"

export interface LayoutProps {
  user: FacultyUser
  role: Role
  page: Page
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  navigate: (page: Page) => void
  onLogout: () => void
  children: ReactNode
  toast?: string
}

export function Layout({ user, role, page, menuOpen, setMenuOpen, navigate, onLogout, children, toast }: LayoutProps) {
  const nav = getNavigation(role)
  const active = page === "progress" ? "upload" : page
  const current = getRoute(page).label
  const groups = [...new Set(nav.map((item) => item.group).filter(Boolean))]

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand"><BrandMark /><div><b>PHACT</b><span>Curriculum studio</span></div></div>
        <button className="mobile-close icon-button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="close" /></button>
        <div className="role-label">{role === "admin" ? "ASPPH administration" : "Faculty workspace"}</div>
        <nav aria-label="Primary navigation">
          {groups.map((group) => (
            <div className="nav-group" key={group}>
              <span className="nav-group-label">{group}</span>
              {nav.filter((item) => item.group === group).map((item) => (
                <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => navigate(item.id)} aria-current={active === item.id ? "page" : undefined}>
                  <Icon name={item.icon || "file"} /><span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-chip"><span>{initials(user.displayName)}</span><div><b>{user.displayName}</b><small>{role === "admin" ? "ASPPH Administrator" : user.title}</small></div></div>
          <button className="text-button" onClick={onLogout}>Sign out</button>
        </div>
      </aside>
      {menuOpen && <button className="scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
      <main className="main" id="main-content">
        <header className="topbar">
          <button className="menu-button icon-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <div className="breadcrumb"><span>PHACT</span><Icon name="arrow" size={13} /><b>{current}</b></div>
          <span className="role-switcher"><span>Data mode</span><strong>{import.meta.env.VITE_DATA_MODE === "live" ? "Live API" : "Mock"}</strong></span>
        </header>
        <div className="content page-enter" key={`${page}-${role}`}>{children}</div>
        <footer><span>PHACT prototype · Data mode is explicitly labeled</span><span><button onClick={() => navigate("privacy")}>Privacy Policy</button><button onClick={() => navigate("terms")}>Terms of Service</button></span></footer>
      </main>
      {toast && <div className="toast" role="status"><Icon name="check" />{toast}</div>}
    </div>
  )
}
