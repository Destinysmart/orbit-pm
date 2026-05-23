"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight, ChevronDown, Plus, Search, List, Columns,
  Bell, Zap, Settings, X, Check, ArrowRight, Sparkles, Hash,
  Activity, Home, Clock, Menu,
} from "lucide-react";

/* ═══════════════════════ MOBILE HOOK ══════════════════════ */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

/* ═══════════════════════ CONSTANTS ════════════════════════ */
const STATUSES = [
  { id: "todo",       label: "To Do",      color: "#64748b" },
  { id: "inprogress", label: "In Progress", color: "#6366f1" },
  { id: "review",     label: "Review",     color: "#f59e0b" },
  { id: "done",       label: "Done",       color: "#10b981" },
];
const PRIORITIES = [
  { id: "urgent", label: "Urgent", color: "#f43f5e" },
  { id: "high",   label: "High",   color: "#f97316" },
  { id: "normal", label: "Normal", color: "#94a3b8" },
  { id: "low",    label: "Low",    color: "#475569" },
];
const USE_CASES = [
  { id: "software",  emoji: "💻", label: "Software",   desc: "Sprints, bugs, features" },
  { id: "marketing", emoji: "📣", label: "Marketing",  desc: "Campaigns, content" },
  { id: "ops",       emoji: "⚙️",  label: "Operations", desc: "SOPs, logistics" },
  { id: "personal",  emoji: "🎯", label: "Personal",   desc: "Goals, tasks, habits" },
];
const INITIAL = {
  spaces: [
    {
      id: "s1", name: "Product", color: "#6366f1", expanded: true,
      lists: [
        { id: "l1", name: "Roadmap", tasks: [
            { id: "t1", title: "Design new onboarding flow", description: "Redesign from scratch based on Q1 user research.", status: "inprogress", priority: "high",   assignee: "Alex",   due: "2026-05-28", tags: ["design","ux"] },
            { id: "t2", title: "Build task detail side panel", description: "",  status: "todo",       priority: "normal", assignee: "Sam",    due: "2026-06-01", tags: ["frontend"] },
            { id: "t3", title: "Performance audit — list view", description: "Profile large list lag.",  status: "review",     priority: "urgent", assignee: "Jordan", due: "2026-05-25", tags: ["perf"] },
            { id: "t4", title: "Integrate notification engine", description: "", status: "done",       priority: "high",   assignee: "Alex",   due: "2026-05-20", tags: ["backend"] },
            { id: "t5", title: "Mobile responsiveness pass",   description: "Full audit across iOS and Android.", status: "todo", priority: "normal", assignee: "Sam", due: "2026-06-05", tags: ["mobile"] },
          ]},
        { id: "l2", name: "Sprint 12", tasks: [
            { id: "t6", title: "Fix automation trigger edge case", description: "", status: "inprogress", priority: "urgent", assignee: "Jordan", due: "2026-05-24", tags: ["bug"] },
            { id: "t7", title: "Custom fields v1",                description: "", status: "todo",       priority: "high",   assignee: "Alex",   due: "2026-06-03", tags: ["feature"] },
            { id: "t8", title: "Write API documentation",         description: "", status: "review",     priority: "normal", assignee: "Sam",    due: "2026-05-30", tags: ["docs"] },
          ]},
      ],
    },
    {
      id: "s2", name: "Marketing", color: "#10b981", expanded: false,
      lists: [
        { id: "l3", name: "Campaigns", tasks: [
            { id: "t9",  title: "Q2 social media calendar", description: "", status: "done",       priority: "normal", assignee: "Riley",  due: "2026-05-15", tags: ["social"] },
            { id: "t10", title: "Launch email sequence",    description: "", status: "inprogress", priority: "high",   assignee: "Morgan", due: "2026-05-29", tags: ["email"] },
            { id: "t11", title: "Blog: Why we built Orbit", description: "", status: "todo",      priority: "low",    assignee: "Riley",  due: "2026-06-10", tags: ["content"] },
          ]},
        { id: "l4", name: "Brand Assets", tasks: [
            { id: "t12", title: "Logo refresh concepts",      description: "", status: "inprogress", priority: "normal", assignee: "Morgan", due: "2026-06-01", tags: ["design"] },
            { id: "t13", title: "Update brand guidelines doc",description: "", status: "todo",       priority: "low",    assignee: "Riley",  due: "2026-06-15", tags: ["docs"] },
          ]},
      ],
    },
  ],
};
const INIT_NOTIFS = [
  { id: "n1", icon: "💬", text: 'Alex mentioned you in "Design new onboarding flow"',  time: "2m ago",  read: false },
  { id: "n2", icon: "⏰", text: '"Performance audit" is due tomorrow',                  time: "1h ago",  read: false },
  { id: "n3", icon: "👤", text: "Sam assigned you to Mobile responsiveness pass",       time: "3h ago",  read: true  },
  { id: "n4", icon: "✅", text: "Jordan completed Integrate notification engine",       time: "5h ago",  read: true  },
  { id: "n5", icon: "⚡", text: "Automation ran: Task completed → Notify assignee",    time: "1d ago",  read: true  },
];
const INIT_AUTOS = [
  { id: "a1", trigger: "Task status → Done",       action: "Notify assignee",       active: true,  runs: 142, last: "2m ago"  },
  { id: "a2", trigger: "Due date is tomorrow",     action: "Send smart reminder",   active: true,  runs: 89,  last: "1h ago"  },
  { id: "a3", trigger: "Task created in Roadmap",  action: "Set priority → Normal", active: false, runs: 34,  last: "2d ago"  },
  { id: "a4", trigger: "Assignee field changes",   action: "Post update in Chat",   active: true,  runs: 67,  last: "30m ago" },
];

/* ═══════════════════════ HELPERS ══════════════════════════ */
const getSt = (id) => STATUSES.find((s) => s.id === id)   || STATUSES[0];
const getPr = (id) => PRIORITIES.find((p) => p.id === id) || PRIORITIES[2];
const CYCLE = { todo: "inprogress", inprogress: "review", review: "done", done: "todo" };
const AVC = ["#6366f1","#10b981","#f59e0b","#f43f5e","#3b82f6","#8b5cf6"];
const avc = (n) => AVC[n.charCodeAt(0) % AVC.length];

function Avatar({ name, size = 26 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", fontSize: size * 0.38, background: avc(name), color: "#fff", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {name[0].toUpperCase()}
    </div>
  );
}
function Chip({ label }) {
  return <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>{label}</span>;
}
function Lbl({ children }) {
  return <div style={{ color: "#475569", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{children}</div>;
}
function PropRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 62, color: "#475569", fontSize: 12, flexShrink: 0 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

/* ═══════════════════════ ONBOARDING ═══════════════════════ */
function Onboarding({ step, wName, setWName, ucId, setUcId, spName, setSpName, onNext, onBack }) {
  const valid = [wName.trim().length > 0, !!ucId, spName.trim().length > 0][step - 1];
  const inp = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px", color: "#e2e8f0", fontSize: 15 };
  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 36 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={17} color="#fff" />
          </div>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>Orbit</span>
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
          {[1,2,3].map(s => <div key={s} style={{ width: 40, height: 3, borderRadius: 3, background: s <= step ? "#6366f1" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />)}
        </div>
        <div style={{ background: "#111119", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "28px 24px" }} className="fade">
          {step === 1 && <>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Name your workspace</div>
            <div style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Your team's home. Change anytime.</div>
            <input autoFocus value={wName} onChange={e => setWName(e.target.value)} onKeyDown={e => e.key === "Enter" && valid && onNext()} placeholder="e.g. Acme Inc., My Startup…" style={inp} onFocus={e => e.target.style.borderColor="#6366f1"} onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.08)"} />
          </>}
          {step === 2 && <>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>What kind of work?</div>
            <div style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Orbit sets smart defaults for your workflow.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {USE_CASES.map(uc => (
                <button key={uc.id} onClick={() => setUcId(uc.id)} style={{ padding: "12px 14px", borderRadius: 12, textAlign: "left", transition: "all 0.2s", border: ucId === uc.id ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.06)", background: ucId === uc.id ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{uc.emoji}</div>
                  <div style={{ color: "#e2e8f0", fontWeight: 500, fontSize: 13 }}>{uc.label}</div>
                  <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{uc.desc}</div>
                </button>
              ))}
            </div>
          </>}
          {step === 3 && <>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Create your first Space</div>
            <div style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>Spaces group related Lists and work.</div>
            <input autoFocus value={spName} onChange={e => setSpName(e.target.value)} onKeyDown={e => e.key === "Enter" && valid && onNext()} placeholder="e.g. Product, Marketing…" style={inp} onFocus={e => e.target.style.borderColor="#6366f1"} onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.08)"} />
            <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Sparkles size={14} color="#818cf8" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ color: "#818cf8", fontSize: 13, fontWeight: 500 }}>Orbit AI sets this up for you</div>
                <div style={{ color: "rgba(99,102,241,0.6)", fontSize: 12, marginTop: 3 }}>Smart templates matched to your use case.</div>
              </div>
            </div>
          </>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
          {step > 1 ? <button onClick={onBack} style={{ color: "#64748b", fontSize: 14, padding: "8px 12px" }}>← Back</button> : <div />}
          <button onClick={onNext} disabled={!valid} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: valid ? "#6366f1" : "rgba(99,102,241,0.2)", color: valid ? "#fff" : "rgba(255,255,255,0.3)", transition: "all 0.2s", cursor: valid ? "pointer" : "not-allowed" }}>
            {step === 3 ? "Launch Orbit" : "Continue"} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ SIDEBAR (desktop) ════════════════ */
function SideItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: active ? "rgba(99,102,241,0.15)" : "transparent", color: active ? "#818cf8" : "#64748b", fontSize: 13, transition: "background 0.1s", position: "relative" }} className={active ? "" : "hov-side"}>
      {icon}<span>{label}</span>
      {badge > 0 && <span style={{ marginLeft: "auto", background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 5px" }}>{badge}</span>}
    </button>
  );
}

function Sidebar({ spaces, activeSpaceId, activeListId, setActiveSpaceId, setActiveListId, toggleSpace, page, setPage, unread, showNotifs, setShowNotifs, setActiveTask, wName }) {
  return (
    <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", background: "#0d0d16", borderRight: "1px solid rgba(255,255,255,0.05)", overflowY: "auto" }}>
      <div style={{ padding: "16px 14px 8px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={13} color="#fff" /></div>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 16, letterSpacing: -0.3 }}>Orbit</span>
      </div>
      <div style={{ margin: "0 10px 12px", padding: "5px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
        <div style={{ color: "#64748b", fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{wName || "My Workspace"}</div>
      </div>
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        <SideItem icon={<Home size={14} />} label="Home" active={page === "home" && !showNotifs} onClick={() => { setPage("home"); setShowNotifs(false); }} />
        <SideItem icon={<Bell size={14} />} label="Notifications" active={showNotifs} onClick={() => { setShowNotifs(s => !s); setActiveTask(null); }} badge={unread} />
        <SideItem icon={<Zap size={14} />} label="Automations" active={page === "automations" && !showNotifs} onClick={() => { setPage("automations"); setShowNotifs(false); }} />
      </div>
      <div style={{ padding: "16px 8px 0", flex: 1 }}>
        <div style={{ color: "#334155", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, padding: "0 8px", marginBottom: 8 }}>Spaces</div>
        {spaces.map(space => (
          <div key={space.id}>
            <button onClick={() => toggleSpace(space.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, background: "transparent" }} className="hov-side">
              <div style={{ width: 10, height: 10, borderRadius: 3, background: space.color, flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: "left", color: "#cbd5e1", fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{space.name}</span>
              {space.expanded ? <ChevronDown size={12} color="#475569" /> : <ChevronRight size={12} color="#475569" />}
            </button>
            {space.expanded && (
              <div style={{ marginLeft: 14, marginTop: 1, marginBottom: 4 }}>
                {space.lists.map(list => {
                  const active = activeListId === list.id && page === "tasks" && !showNotifs;
                  return (
                    <button key={list.id} onClick={() => { setActiveSpaceId(space.id); setActiveListId(list.id); setPage("tasks"); setShowNotifs(false); setActiveTask(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 7, background: active ? "rgba(99,102,241,0.15)" : "transparent", color: active ? "#818cf8" : "#64748b" }} className={active ? "" : "hov-side"}>
                      <Hash size={11} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, textAlign: "left", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{list.name}</span>
                      <span style={{ fontSize: 10, color: "#334155" }}>{list.tasks.length}</span>
                    </button>
                  );
                })}
                <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 7, color: "#334155", fontSize: 12, background: "transparent" }} className="hov-side"><Plus size={11} /> New List</button>
              </div>
            )}
          </div>
        ))}
        <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 8, color: "#334155", fontSize: 13, marginTop: 4, background: "transparent" }} className="hov-side"><Plus size={13} /> Add Space</button>
      </div>
      <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <SideItem icon={<Settings size={14} />} label="Settings" active={false} onClick={() => {}} />
      </div>
    </div>
  );
}

/* ═══════════════════════ BOTTOM NAV (mobile) ══════════════ */
function BottomNav({ page, setPage, showNotifs, setShowNotifs, setActiveTask, unread, showSpaces, setShowSpaces }) {
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0d0d16", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
      {[
        { icon: <Home size={20} />, label: "Home", key: "home", action: () => { setPage("home"); setShowNotifs(false); setActiveTask(null); setShowSpaces(false); } },
        { icon: <List size={20} />, label: "Tasks", key: "tasks", action: () => { setPage("tasks"); setShowNotifs(false); setActiveTask(null); setShowSpaces(false); } },
        { icon: <Bell size={20} />, label: "Inbox", key: "notifs", action: () => { setShowNotifs(s => !s); setActiveTask(null); setShowSpaces(false); }, badge: unread },
        { icon: <Zap size={20} />, label: "Autos", key: "automations", action: () => { setPage("automations"); setShowNotifs(false); setActiveTask(null); setShowSpaces(false); } },
        { icon: <Menu size={20} />, label: "Spaces", key: "spaces", action: () => { setShowSpaces(s => !s); setShowNotifs(false); } },
      ].map(item => {
        const isActive = item.key === "notifs" ? showNotifs : item.key === "spaces" ? showSpaces : page === item.key && !showNotifs && !showSpaces;
        return (
          <button key={item.key} onClick={item.action} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 4px 8px", background: "transparent", color: isActive ? "#818cf8" : "#475569", position: "relative" }}>
            {item.icon}
            <span style={{ fontSize: 10 }}>{item.label}</span>
            {item.badge > 0 && <div style={{ position: "absolute", top: 8, right: "50%", transform: "translateX(8px)", background: "#6366f1", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 8, padding: "1px 4px" }}>{item.badge}</div>}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════ SPACES DRAWER (mobile) ══════════ */
function SpacesDrawer({ spaces, activeSpaceId, activeListId, setActiveSpaceId, setActiveListId, toggleSpace, setPage, setShowSpaces, setActiveTask, wName }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={() => setShowSpaces(false)} style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} />
      <div style={{ background: "#0d0d16", borderRadius: "20px 20px 0 0", padding: "20px 16px 100px", maxHeight: "70vh", overflowY: "auto" }} className="slide-up">
        <div style={{ width: 36, height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{wName || "My Workspace"}</div>
        {spaces.map(space => (
          <div key={space.id}>
            <button onClick={() => toggleSpace(space.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderRadius: 10, background: "transparent" }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: space.color, flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: "left", color: "#cbd5e1", fontSize: 15, fontWeight: 500 }}>{space.name}</span>
              {space.expanded ? <ChevronDown size={14} color="#475569" /> : <ChevronRight size={14} color="#475569" />}
            </button>
            {space.expanded && (
              <div style={{ marginLeft: 22, marginBottom: 8 }}>
                {space.lists.map(list => (
                  <button key={list.id} onClick={() => { setActiveSpaceId(space.id); setActiveListId(list.id); setPage("tasks"); setShowSpaces(false); setActiveTask(null); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 8px", borderRadius: 8, background: activeListId === list.id ? "rgba(99,102,241,0.15)" : "transparent", color: activeListId === list.id ? "#818cf8" : "#64748b" }}>
                    <Hash size={13} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, textAlign: "left", fontSize: 14 }}>{list.name}</span>
                    <span style={{ fontSize: 12, color: "#334155" }}>{list.tasks.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ TASK ROW ══════════════════════════ */
function TaskRow({ task, onClick, cycleStatus, isMobile }) {
  const s = getSt(task.status); const p = getPr(task.priority); const done = task.status === "done";
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: isMobile ? "12px 14px" : "10px 14px", cursor: "pointer" }} className="hov-row">
      <button onClick={e => { e.stopPropagation(); cycleStatus(task.id, CYCLE[task.status]); }} style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${s.color}`, background: done ? s.color : "transparent", flexShrink: 0, transition: "all 0.2s" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isMobile ? 14 : 14, fontWeight: 500, color: done ? "#475569" : "#e2e8f0", textDecoration: done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, fontWeight: 500, background: s.color + "22", color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>
          {!isMobile && task.tags.slice(0, 1).map(t => <Chip key={t} label={t} />)}
          {isMobile && <span style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.label}</span>}
        </div>
      </div>
      {!isMobile && (
        <>
          <div style={{ width: 60, display: "flex", justifyContent: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.label}</span>
          </div>
          <div style={{ width: 26, display: "flex", justifyContent: "center" }}><Avatar name={task.assignee} size={22} /></div>
          <div style={{ width: 72, textAlign: "right" }}>
            <span style={{ fontSize: 12, color: "#475569" }}>{task.due ? task.due.slice(5).replace("-", "/") : "—"}</span>
          </div>
        </>
      )}
      {isMobile && <Avatar name={task.assignee} size={28} />}
    </div>
  );
}

/* ═══════════════════════ LIST VIEW ════════════════════════ */
function ListView({ tasks, onTask, cycleStatus, showNew, setShowNew, newTitle, setNewTitle, addTask, isMobile }) {
  return (
    <div style={{ padding: isMobile ? "0 14px 24px" : "0 24px 24px" }}>
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", padding: "4px 14px", marginBottom: 4, gap: 10 }}>
          <span style={{ flex: 1, fontSize: 10, color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Task</span>
          <span style={{ width: 60, textAlign: "center", fontSize: 10, color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Priority</span>
          <span style={{ width: 26 }} />
          <span style={{ width: 72, textAlign: "right", fontSize: 10, color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Due</span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tasks.map(t => <TaskRow key={t.id} task={t} onClick={() => onTask(t)} cycleStatus={cycleStatus} isMobile={isMobile} />)}
      </div>
      {showNew ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, background: "#161622", border: "1px solid rgba(99,102,241,0.35)", borderRadius: 12, padding: "12px 14px" }}>
          <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addTask(); if (e.key === "Escape") { setShowNew(false); setNewTitle(""); } }} placeholder="Task title…" style={{ flex: 1, background: "transparent", color: "#e2e8f0", fontSize: 14, border: "none", fontSize: 16 }} />
          <button onClick={addTask} style={{ color: "#6366f1", padding: 4 }}><Check size={15} /></button>
          <button onClick={() => { setShowNew(false); setNewTitle(""); }} style={{ color: "#475569", padding: 4 }}><X size={15} /></button>
        </div>
      ) : (
        <button onClick={() => setShowNew(true)} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "10px 14px", borderRadius: 10, color: "#475569", fontSize: 14, width: "100%", background: "transparent" }} className="hov-side">
          <Plus size={15} /> Add task
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════ BOARD VIEW ═══════════════════════ */
function BoardView({ tasks, onTask, isMobile }) {
  return (
    <div style={{ padding: isMobile ? "0 14px 24px" : "0 24px 24px", display: "flex", gap: 12, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      {STATUSES.map(status => {
        const col = tasks.filter(t => t.status === status.id);
        return (
          <div key={status.id} style={{ flexShrink: 0, width: isMobile ? "80vw" : 238, maxWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: status.color }} />
              <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>{status.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#334155", background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 10 }}>{col.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {col.map(task => (
                <div key={task.id} onClick={() => onTask(task)} style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px", cursor: "pointer" }} className="hov-card">
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", lineHeight: 1.4, marginBottom: 10 }}>{task.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {task.tags.slice(0, 1).map(t => <Chip key={t} label={t} />)}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: getPr(task.priority).color, fontWeight: 600 }}>{getPr(task.priority).label}</span>
                    <Avatar name={task.assignee} size={22} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════ TASK DETAIL ══════════════════════ */
function TaskDetail({ task, onClose, cycleStatus, isMobile }) {
  const p = getPr(task.priority);
  const style = isMobile
    ? { position: "fixed", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", background: "#0d0d16" }
    : { width: 320, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.05)", background: "#0d0d16", display: "flex", flexDirection: "column" };
  return (
    <div style={style} className="slide">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingTop: isMobile ? "max(14px, env(safe-area-inset-top))" : 14 }}>
        <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>Task detail</span>
        <button onClick={onClose} style={{ color: "#475569", padding: 8 }}><X size={18} /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 18, paddingBottom: isMobile ? "80px" : 18 }}>
        <h3 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 600, lineHeight: 1.4 }}>{task.title}</h3>
        <div>
          <Lbl>Status</Lbl>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STATUSES.map(st => (
              <button key={st.id} onClick={() => cycleStatus(task.id, st.id)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, fontWeight: 500, background: task.status === st.id ? st.color + "33" : "transparent", color: task.status === st.id ? st.color : "#475569", border: `1px solid ${task.status === st.id ? st.color + "66" : "rgba(255,255,255,0.08)"}` }}>{st.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <PropRow label="Priority"><span style={{ fontSize: 14, fontWeight: 600, color: p.color }}>{p.label}</span></PropRow>
          <PropRow label="Assignee"><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={task.assignee} size={24} /><span style={{ color: "#cbd5e1", fontSize: 14 }}>{task.assignee}</span></div></PropRow>
          <PropRow label="Due date"><span style={{ color: "#94a3b8", fontSize: 14 }}>{task.due || "—"}</span></PropRow>
          {task.tags.length > 0 && <PropRow label="Tags"><div style={{ display: "flex", gap: 4 }}>{task.tags.map(t => <Chip key={t} label={t} />)}</div></PropRow>}
        </div>
        <div>
          <Lbl>Description</Lbl>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px", minHeight: 72, fontSize: 14, color: task.description ? "#94a3b8" : "#334155", lineHeight: 1.6 }}>{task.description || "Add a description…"}</div>
        </div>
        <div>
          <Lbl>Activity</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[{ user: "Alex", action: "moved this to In Progress", time: "2h ago" }, { user: "Sam", action: "was assigned to this task", time: "1d ago" }].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Avatar name={a.user} size={24} />
                <div><span style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 500 }}>{a.user}</span><span style={{ color: "#475569", fontSize: 13 }}> {a.action}</span><div style={{ color: "#334155", fontSize: 11, marginTop: 3 }}>{a.time}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <input placeholder="Add a comment…" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", color: "#94a3b8", fontSize: 14 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════ NOTIFICATIONS ════════════════════ */
function NotifPanel({ notifs, onClose, markAllRead, isMobile }) {
  const unread = notifs.filter(n => !n.read).length;
  const style = isMobile
    ? { position: "fixed", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", background: "#0d0d16" }
    : { width: 300, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.05)", background: "#0d0d16", display: "flex", flexDirection: "column" };
  return (
    <div style={style} className="slide">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingTop: isMobile ? "max(14px, env(safe-area-inset-top))" : 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>Notifications</span>
          {unread > 0 && <span style={{ background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>{unread}</span>}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {unread > 0 && <button onClick={markAllRead} style={{ fontSize: 13, color: "#6366f1" }}>Mark all read</button>}
          <button onClick={onClose} style={{ color: "#475569", padding: 4 }}><X size={18} /></button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: isMobile ? 80 : 0 }}>
        {notifs.map(n => (
          <div key={n.id} style={{ display: "flex", gap: 14, padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: n.read ? 0.45 : 1, cursor: "pointer" }} className="hov-notif">
            <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>{n.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.5 }}>{n.text}</div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{n.time}</div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: 12, color: "#334155" }}>⚡ Smart grouping · Only critical alerts pushed</div>
    </div>
  );
}

/* ═══════════════════════ AUTOMATIONS ══════════════════════ */
function AutomationsPage({ autos, toggle, isMobile }) {
  const totalRuns = autos.reduce((a, b) => a + b.runs, 0);
  const activeCount = autos.filter(a => a.active).length;
  return (
    <div style={{ padding: isMobile ? "20px 16px 100px" : 32, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Automations</h1>
          <p style={{ color: "#64748b", fontSize: 13 }}>Trigger → action rules that run automatically.</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "#6366f1", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 500, flexShrink: 0 }}><Plus size={14} /> New</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total runs", value: totalRuns, icon: <Activity size={14} color="#6366f1" /> },
          { label: "Active", value: activeCount, icon: <Zap size={14} color="#10b981" /> },
          { label: "Remaining", value: "1,847", icon: <Clock size={14} color="#f59e0b" /> },
        ].map((s, i) => (
          <div key={i} style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 11, marginBottom: 6 }}>{s.icon} {s.label}</div>
            <div style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 600 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {autos.map(auto => (
          <div key={auto.id} style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px" }} className="hov-auto">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isMobile ? 10 : 0 }}>
              <button onClick={() => toggle(auto.id)} style={{ width: 36, height: 22, borderRadius: 11, background: auto.active ? "#6366f1" : "rgba(255,255,255,0.08)", flexShrink: 0, position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", width: 16, height: 16, background: "#fff", borderRadius: "50%", top: 3, left: auto.active ? 17 : 3, transition: "left 0.2s" }} />
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isMobile ? (
                  <div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>⚡ {auto.trigger}</div>
                    <div style={{ fontSize: 13, color: "#818cf8" }}>→ {auto.action}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ padding: "5px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>⚡ {auto.trigger}</div>
                    <ArrowRight size={13} color="#334155" style={{ flexShrink: 0 }} />
                    <div style={{ padding: "5px 12px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 8, fontSize: 13, color: "#818cf8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>→ {auto.action}</div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{auto.runs}</div>
                <div style={{ fontSize: 10, color: "#334155" }}>{auto.last}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: "16px", background: "#161622", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Sparkles size={15} color="#818cf8" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Orbit AI writes automations for you</div>
          <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>Just describe in plain English what you want to automate.</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ HOME ══════════════════════════════ */
function HomePage({ data, notifs, isMobile }) {
  const all = data.spaces.flatMap(s => s.lists.flatMap(l => l.tasks));
  const bySt = id => all.filter(t => t.status === id).length;
  const urgent = all.filter(t => t.priority === "urgent" && t.status !== "done");
  const unread = notifs.filter(n => !n.read);
  return (
    <div style={{ padding: isMobile ? "20px 16px 100px" : 32, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ color: "#f1f5f9", fontSize: isMobile ? 20 : 22, fontWeight: 600, marginBottom: 4 }}>Good morning 👋</h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Here's everything across your workspace.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
        {STATUSES.map(s => (
          <div key={s.id} style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: s.color, marginBottom: 4 }}>{bySt(s.id)}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 14 }}>🚨 Urgent ({urgent.length})</div>
          {urgent.length === 0 ? <div style={{ fontSize: 13, color: "#475569" }}>No urgent tasks — great work!</div> :
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {urgent.slice(0, 4).map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f43f5e", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#cbd5e1", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                  <Avatar name={t.assignee} size={22} />
                </div>
              ))}
            </div>}
        </div>
        <div style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 14 }}>🔔 New activity ({unread.length})</div>
          {unread.length === 0 ? <div style={{ fontSize: 13, color: "#475569" }}>You're all caught up!</div> :
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {unread.map(n => (
                <div key={n.id} style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{n.icon}</span>
                  <div><div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.4 }}>{n.text}</div><div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{n.time}</div></div>
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ ROOT ═════════════════════════════ */
export default function Orbit() {
  const isMobile = useIsMobile();
  const [step,   setStep]   = useState(1);
  const [wName,  setWName]  = useState("");
  const [ucId,   setUcId]   = useState("");
  const [spName, setSpName] = useState("");
  const [data,          setData]          = useState(INITIAL);
  const [activeSpaceId, setActiveSpaceId] = useState("s1");
  const [activeListId,  setActiveListId]  = useState("l1");
  const [view,          setView]          = useState("list");
  const [page,          setPage]          = useState("tasks");
  const [activeTask,    setActiveTask]    = useState(null);
  const [showNotifs,    setShowNotifs]    = useState(false);
  const [showSpaces,    setShowSpaces]    = useState(false);
  const [notifs,        setNotifs]        = useState(INIT_NOTIFS);
  const [autos,         setAutos]         = useState(INIT_AUTOS);
  const [query,         setQuery]         = useState("");
  const [showNew,       setShowNew]       = useState(false);
  const [newTitle,      setNewTitle]      = useState("");

  const activeSpace = data.spaces.find(s => s.id === activeSpaceId);
  const activeList  = activeSpace?.lists.find(l => l.id === activeListId);
  const tasks       = activeList?.tasks || [];
  const filtered    = query ? tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())) : tasks;
  const unread      = notifs.filter(n => !n.read).length;

  const toggleSpace = id => setData(d => ({ ...d, spaces: d.spaces.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s) }));
  const cycleStatus = (tid, status) => {
    setData(d => ({ ...d, spaces: d.spaces.map(sp => ({ ...sp, lists: sp.lists.map(li => ({ ...li, tasks: li.tasks.map(t => t.id === tid ? { ...t, status } : t) })) })) }));
    setActiveTask(prev => prev?.id === tid ? { ...prev, status } : prev);
  };
  const addTask = () => {
    if (!newTitle.trim()) return;
    const t = { id: "t" + Date.now(), title: newTitle, description: "", status: "todo", priority: "normal", assignee: "You", due: "", tags: [] };
    setData(d => ({ ...d, spaces: d.spaces.map(sp => sp.id === activeSpaceId ? { ...sp, lists: sp.lists.map(li => li.id === activeListId ? { ...li, tasks: [...li.tasks, t] } : li) } : sp) }));
    setNewTitle(""); setShowNew(false);
  };
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const toggleAuto  = id => setAutos(a => a.map(x => x.id === id ? { ...x, active: !x.active } : x));

  if (step !== null) return <Onboarding step={step} wName={wName} setWName={setWName} ucId={ucId} setUcId={setUcId} spName={spName} setSpName={setSpName} onNext={() => step < 3 ? setStep(step + 1) : setStep(null)} onBack={() => setStep(step - 1)} />;

  return (
    <div style={{ display: "flex", height: "100vh", height: "100dvh", background: "#09090f", color: "#e2e8f0", overflow: "hidden", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {!isMobile && (
        <Sidebar spaces={data.spaces} activeSpaceId={activeSpaceId} activeListId={activeListId} setActiveSpaceId={setActiveSpaceId} setActiveListId={setActiveListId} toggleSpace={toggleSpace} page={page} setPage={setPage} unread={unread} showNotifs={showNotifs} setShowNotifs={setShowNotifs} setActiveTask={setActiveTask} wName={wName} />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: isMobile ? 56 : 52, display: "flex", alignItems: "center", padding: isMobile ? "0 14px" : "0 24px", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={12} color="#fff" /></div>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Orbit</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "7px 12px", flex: 1 }}>
            <Search size={13} color="#475569" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks…" style={{ background: "transparent", color: "#cbd5e1", fontSize: isMobile ? 16 : 13, width: "100%", border: "none" }} />
          </div>
          {page === "tasks" && !isMobile && (
            <div style={{ display: "flex", gap: 2 }}>
              <button onClick={() => setView("list")} style={{ padding: "6px 8px", borderRadius: 8, background: view === "list" ? "rgba(99,102,241,0.2)" : "transparent", color: view === "list" ? "#818cf8" : "#475569" }}><List size={15} /></button>
              <button onClick={() => setView("board")} style={{ padding: "6px 8px", borderRadius: 8, background: view === "board" ? "rgba(99,102,241,0.2)" : "transparent", color: view === "board" ? "#818cf8" : "#475569" }}><Columns size={15} /></button>
            </div>
          )}
          {page === "tasks" && isMobile && (
            <div style={{ display: "flex", gap: 2 }}>
              <button onClick={() => setView("list")} style={{ padding: "6px 8px", borderRadius: 8, background: view === "list" ? "rgba(99,102,241,0.2)" : "transparent", color: view === "list" ? "#818cf8" : "#475569" }}><List size={17} /></button>
              <button onClick={() => setView("board")} style={{ padding: "6px 8px", borderRadius: 8, background: view === "board" ? "rgba(99,102,241,0.2)" : "transparent", color: view === "board" ? "#818cf8" : "#475569" }}><Columns size={17} /></button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", WebkitOverflowScrolling: "touch" }}>
          {page === "tasks" && !activeTask && !showNotifs && (
            <div style={{ height: "100%" }}>
              <div style={{ padding: isMobile ? "14px 16px 8px" : "18px 24px 10px", display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                <span style={{ color: activeSpace?.color, fontWeight: 500, fontSize: isMobile ? 13 : 14 }}>{activeSpace?.name}</span>
                <ChevronRight size={12} color="#334155" />
                <span style={{ color: "#cbd5e1", fontWeight: 500, fontSize: isMobile ? 13 : 14 }}>{activeList?.name}</span>
                <span style={{ marginLeft: 6, fontSize: 11, color: "#334155", background: "rgba(255,255,255,0.04)", padding: "2px 7px", borderRadius: 20 }}>{tasks.length}</span>
              </div>
              {view === "list"
                ? <ListView tasks={filtered} onTask={t => { setActiveTask(t); setShowNotifs(false); }} cycleStatus={cycleStatus} showNew={showNew} setShowNew={setShowNew} newTitle={newTitle} setNewTitle={setNewTitle} addTask={addTask} isMobile={isMobile} />
                : <BoardView tasks={filtered} onTask={t => { setActiveTask(t); setShowNotifs(false); }} isMobile={isMobile} />}
            </div>
          )}
          {page === "tasks" && !isMobile && activeTask && !showNotifs && (
            <div style={{ display: "flex", height: "100%" }}>
              <div style={{ flex: 1, overflow: "auto" }}>
                <div style={{ padding: "18px 24px 10px", display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <span style={{ color: activeSpace?.color, fontWeight: 500 }}>{activeSpace?.name}</span>
                  <ChevronRight size={12} color="#334155" />
                  <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{activeList?.name}</span>
                </div>
                {view === "list"
                  ? <ListView tasks={filtered} onTask={t => setActiveTask(t)} cycleStatus={cycleStatus} showNew={showNew} setShowNew={setShowNew} newTitle={newTitle} setNewTitle={setNewTitle} addTask={addTask} isMobile={false} />
                  : <BoardView tasks={filtered} onTask={t => setActiveTask(t)} isMobile={false} />}
              </div>
              <TaskDetail task={activeTask} onClose={() => setActiveTask(null)} cycleStatus={cycleStatus} isMobile={false} />
            </div>
          )}
          {page === "automations" && !showNotifs && <AutomationsPage autos={autos} toggle={toggleAuto} isMobile={isMobile} />}
          {page === "home" && !showNotifs && <HomePage data={data} notifs={notifs} isMobile={isMobile} />}
        </div>
      </div>

      {/* Mobile overlays */}
      {isMobile && activeTask && <TaskDetail task={activeTask} onClose={() => setActiveTask(null)} cycleStatus={cycleStatus} isMobile={true} />}
      {showNotifs && <NotifPanel notifs={notifs} onClose={() => setShowNotifs(false)} markAllRead={markAllRead} isMobile={isMobile} />}
      {isMobile && showSpaces && <SpacesDrawer spaces={data.spaces} activeSpaceId={activeSpaceId} activeListId={activeListId} setActiveSpaceId={setActiveSpaceId} setActiveListId={setActiveListId} toggleSpace={toggleSpace} setPage={setPage} setShowSpaces={setShowSpaces} setActiveTask={setActiveTask} wName={wName} />}
      {isMobile && <BottomNav page={page} setPage={setPage} showNotifs={showNotifs} setShowNotifs={setShowNotifs} setActiveTask={setActiveTask} unread={unread} showSpaces={showSpaces} setShowSpaces={setShowSpaces} />}
    </div>
  );
}