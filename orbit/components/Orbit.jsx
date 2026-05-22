"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  List,
  LayoutKanban,
  Bell,
  Zap,
  Settings,
  X,
  Check,
  ArrowRight,
  Sparkles,
  Hash,
  Activity,
  Home,
  Clock,
} from "lucide-react";

/* ═══════════════════════ CONSTANTS ════════════════════════ */

const STATUSES = [
  { id: "todo",       label: "To Do",       color: "#64748b" },
  { id: "inprogress", label: "In Progress",  color: "#6366f1" },
  { id: "review",     label: "Review",      color: "#f59e0b" },
  { id: "done",       label: "Done",        color: "#10b981" },
];

const PRIORITIES = [
  { id: "urgent", label: "Urgent", color: "#f43f5e" },
  { id: "high",   label: "High",   color: "#f97316" },
  { id: "normal", label: "Normal", color: "#94a3b8" },
  { id: "low",    label: "Low",    color: "#475569" },
];

const USE_CASES = [
  { id: "software",  emoji: "💻", label: "Software",    desc: "Sprints, bugs, features" },
  { id: "marketing", emoji: "📣", label: "Marketing",   desc: "Campaigns, content" },
  { id: "ops",       emoji: "⚙️",  label: "Operations",  desc: "SOPs, logistics" },
  { id: "personal",  emoji: "🎯", label: "Personal",    desc: "Goals, tasks, habits" },
];

const INITIAL = {
  spaces: [
    {
      id: "s1", name: "Product", color: "#6366f1", expanded: true,
      lists: [
        {
          id: "l1", name: "Roadmap",
          tasks: [
            { id: "t1", title: "Design new onboarding flow",        description: "Redesign from scratch based on Q1 user research. Focus on reducing time-to-value under 3 minutes.", status: "inprogress", priority: "high",   assignee: "Alex",   due: "2026-05-28", tags: ["design", "ux"] },
            { id: "t2", title: "Build task detail side panel",       description: "",                                                                                                   status: "todo",       priority: "normal", assignee: "Sam",    due: "2026-06-01", tags: ["frontend"] },
            { id: "t3", title: "Performance audit — list view",      description: "Profile why large lists (200+ tasks) lag on scroll. Target: < 16ms per frame.",                    status: "review",     priority: "urgent", assignee: "Jordan", due: "2026-05-25", tags: ["perf"] },
            { id: "t4", title: "Integrate smart notification engine",description: "",                                                                                                   status: "done",       priority: "high",   assignee: "Alex",   due: "2026-05-20", tags: ["backend"] },
            { id: "t5", title: "Mobile responsiveness pass",         description: "Full audit across iOS Safari and Android Chrome. Fix any layout regressions.",                     status: "todo",       priority: "normal", assignee: "Sam",    due: "2026-06-05", tags: ["mobile"] },
          ],
        },
        {
          id: "l2", name: "Sprint 12",
          tasks: [
            { id: "t6", title: "Fix automation trigger edge case", description: "Compound conditions fire twice on status change. Reproduce and patch.", status: "inprogress", priority: "urgent", assignee: "Jordan", due: "2026-05-24", tags: ["bug"] },
            { id: "t7", title: "Custom fields v1",                 description: "",                                                                       status: "todo",       priority: "high",   assignee: "Alex",   due: "2026-06-03", tags: ["feature"] },
            { id: "t8", title: "Write API documentation",          description: "",                                                                       status: "review",     priority: "normal", assignee: "Sam",    due: "2026-05-30", tags: ["docs"] },
          ],
        },
      ],
    },
    {
      id: "s2", name: "Marketing", color: "#10b981", expanded: false,
      lists: [
        {
          id: "l3", name: "Campaigns",
          tasks: [
            { id: "t9",  title: "Q2 social media calendar", description: "", status: "done",       priority: "normal", assignee: "Riley",  due: "2026-05-15", tags: ["social"] },
            { id: "t10", title: "Launch email sequence",     description: "", status: "inprogress", priority: "high",   assignee: "Morgan", due: "2026-05-29", tags: ["email"] },
            { id: "t11", title: "Blog: Why we built Orbit",  description: "", status: "todo",       priority: "low",    assignee: "Riley",  due: "2026-06-10", tags: ["content"] },
          ],
        },
        {
          id: "l4", name: "Brand Assets",
          tasks: [
            { id: "t12", title: "Logo refresh concepts",       description: "", status: "inprogress", priority: "normal", assignee: "Morgan", due: "2026-06-01", tags: ["design"] },
            { id: "t13", title: "Update brand guidelines doc", description: "", status: "todo",       priority: "low",    assignee: "Riley",  due: "2026-06-15", tags: ["docs"] },
          ],
        },
      ],
    },
  ],
};

const INIT_NOTIFS = [
  { id: "n1", icon: "💬", text: 'Alex mentioned you in "Design new onboarding flow"',  time: "2m ago", read: false },
  { id: "n2", icon: "⏰", text: '"Performance audit" is due tomorrow',                  time: "1h ago", read: false },
  { id: "n3", icon: "👤", text: "Sam assigned you to Mobile responsiveness pass",       time: "3h ago", read: true  },
  { id: "n4", icon: "✅", text: "Jordan completed Integrate smart notification engine", time: "5h ago", read: true  },
  { id: "n5", icon: "⚡", text: "Automation ran: Task completed → Notify assignee",    time: "1d ago", read: true  },
];

const INIT_AUTOS = [
  { id: "a1", trigger: "Task status → Done",        action: "Notify assignee",       active: true,  runs: 142, last: "2m ago"  },
  { id: "a2", trigger: "Due date is tomorrow",      action: "Send smart reminder",   active: true,  runs: 89,  last: "1h ago"  },
  { id: "a3", trigger: "Task created in Roadmap",   action: "Set priority → Normal", active: false, runs: 34,  last: "2d ago"  },
  { id: "a4", trigger: "Assignee field changes",    action: "Post update in Chat",   active: true,  runs: 67,  last: "30m ago" },
];

/* ═══════════════════════ HELPERS ══════════════════════════ */

const getSt = (id) => STATUSES.find((s) => s.id === id)   || STATUSES[0];
const getPr = (id) => PRIORITIES.find((p) => p.id === id) || PRIORITIES[2];
const CYCLE = { todo: "inprogress", inprogress: "review", review: "done", done: "todo" };

const AV_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#3b82f6", "#8b5cf6"];
const avColor = (name) => AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];

function Avatar({ name, size = 26 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", fontSize: size * 0.38,
        background: avColor(name), color: "#fff", fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      {name[0].toUpperCase()}
    </div>
  );
}

function Chip({ label }) {
  return (
    <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
      {label}
    </span>
  );
}

function Label({ children }) {
  return (
    <div style={{ color: "#475569", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function PropRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 62, color: "#475569", fontSize: 12, flexShrink: 0 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function ViewBtn({ icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 8px", borderRadius: 8,
        background: active ? "rgba(99,102,241,0.2)" : "transparent",
        color: active ? "#818cf8" : "#475569",
        transition: "all 0.15s",
      }}
    >
      {icon}
    </button>
  );
}

/* ═══════════════════════ ONBOARDING ═══════════════════════ */

function Onboarding({ step, wName, setWName, ucId, setUcId, spName, setSpName, onNext, onBack }) {
  const valid = [wName.trim().length > 0, !!ucId, spName.trim().length > 0][step - 1];
  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
    padding: "12px 16px", color: "#e2e8f0", fontSize: 15,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={17} color="#fff" />
          </div>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 600, letterSpacing: -0.5 }}>Orbit</span>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ width: 40, height: 3, borderRadius: 3, background: s <= step ? "#6366f1" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "#111119", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 36 }} className="fade">
          {step === 1 && (
            <>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Name your workspace</div>
              <div style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Your team's home. You can change this anytime.</div>
              <input
                autoFocus value={wName} onChange={(e) => setWName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && valid && onNext()}
                placeholder="e.g. Acme Inc., My Startup…"
                style={inputStyle}
              />
            </>
          )}
          {step === 2 && (
            <>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>What kind of work?</div>
              <div style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Orbit configures smart defaults based on your workflow.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {USE_CASES.map((uc) => (
                  <button
                    key={uc.id} onClick={() => setUcId(uc.id)}
                    style={{
                      padding: "14px 16px", borderRadius: 12, textAlign: "left", transition: "all 0.2s",
                      border: ucId === uc.id ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.06)",
                      background: ucId === uc.id ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{uc.emoji}</div>
                    <div style={{ color: "#e2e8f0", fontWeight: 500, fontSize: 14 }}>{uc.label}</div>
                    <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>{uc.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Create your first Space</div>
              <div style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Spaces group related Lists and work by team or project area.</div>
              <input
                autoFocus value={spName} onChange={(e) => setSpName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && valid && onNext()}
                placeholder="e.g. Product, Marketing, Engineering…"
                style={inputStyle}
              />
              <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Sparkles size={14} color="#818cf8" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ color: "#818cf8", fontSize: 13, fontWeight: 500 }}>Orbit AI sets this up for you</div>
                  <div style={{ color: "rgba(99,102,241,0.6)", fontSize: 12, marginTop: 3 }}>Smart templates, statuses, and views — matched to your use case.</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
          {step > 1
            ? <button onClick={onBack} style={{ color: "#64748b", fontSize: 14, padding: "8px 12px" }}>← Back</button>
            : <div />}
          <button
            onClick={onNext} disabled={!valid}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 500,
              background: valid ? "#6366f1" : "rgba(99,102,241,0.2)",
              color: valid ? "#fff" : "rgba(255,255,255,0.3)",
              transition: "all 0.2s", cursor: valid ? "pointer" : "not-allowed",
            }}
          >
            {step === 3 ? "Launch Orbit" : "Continue"}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ SIDEBAR ══════════════════════════ */

function SideItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8,
        background: active ? "rgba(99,102,241,0.15)" : "transparent",
        color: active ? "#818cf8" : "#64748b", fontSize: 13, transition: "background 0.1s",
      }}
      className={active ? "" : "hov-side"}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Sidebar({ spaces, activeSpaceId, activeListId, setActiveSpaceId, setActiveListId, toggleSpace, page, setPage, unread, showNotifs, setShowNotifs, setActiveTask, wName }) {
  return (
    <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", background: "#0d0d16", borderRight: "1px solid rgba(255,255,255,0.05)", overflowY: "auto" }}>
      <div style={{ padding: "16px 14px 8px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={13} color="#fff" />
        </div>
        <span style={{ color: "#fff", fontWeight: 600, fontSize: 16, letterSpacing: -0.3 }}>Orbit</span>
      </div>

      <div style={{ margin: "0 10px 12px", padding: "5px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
        <div style={{ color: "#64748b", fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {wName || "My Workspace"}
        </div>
      </div>

      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        <SideItem icon={<Home size={14} />} label="Home" active={page === "home" && !showNotifs} onClick={() => { setPage("home"); setShowNotifs(false); }} />
        <div style={{ position: "relative" }}>
          <SideItem icon={<Bell size={14} />} label="Notifications" active={showNotifs} onClick={() => { setShowNotifs((s) => !s); setActiveTask(null); }} />
          {unread > 0 && (
            <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 5px", pointerEvents: "none" }}>
              {unread}
            </div>
          )}
        </div>
        <SideItem icon={<Zap size={14} />} label="Automations" active={page === "automations" && !showNotifs} onClick={() => { setPage("automations"); setShowNotifs(false); }} />
      </div>

      <div style={{ padding: "16px 8px 0", flex: 1 }}>
        <div style={{ color: "#334155", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, padding: "0 8px", marginBottom: 8 }}>Spaces</div>
        {spaces.map((space) => (
          <div key={space.id}>
            <button
              onClick={() => toggleSpace(space.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 8, transition: "background 0.1s", background: "transparent" }}
              className="hov-side"
            >
              <div style={{ width: 10, height: 10, borderRadius: 3, background: space.color, flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: "left", color: "#cbd5e1", fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {space.name}
              </span>
              {space.expanded ? <ChevronDown size={12} color="#475569" /> : <ChevronRight size={12} color="#475569" />}
            </button>
            {space.expanded && (
              <div style={{ marginLeft: 14, marginTop: 1, marginBottom: 4 }}>
                {space.lists.map((list) => {
                  const active = activeListId === list.id && page === "tasks" && !showNotifs;
                  return (
                    <button
                      key={list.id}
                      onClick={() => { setActiveSpaceId(space.id); setActiveListId(list.id); setPage("tasks"); setShowNotifs(false); setActiveTask(null); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 7, transition: "all 0.1s", background: active ? "rgba(99,102,241,0.15)" : "transparent", color: active ? "#818cf8" : "#64748b" }}
                      className={active ? "" : "hov-side"}
                    >
                      <Hash size={11} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, textAlign: "left", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{list.name}</span>
                      <span style={{ fontSize: 10, color: "#334155" }}>{list.tasks.length}</span>
                    </button>
                  );
                })}
                <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 7, color: "#334155", fontSize: 12, background: "transparent" }} className="hov-side">
                  <Plus size={11} /> New List
                </button>
              </div>
            )}
          </div>
        ))}
        <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 8, color: "#334155", fontSize: 13, marginTop: 4, background: "transparent" }} className="hov-side">
          <Plus size={13} /> Add Space
        </button>
      </div>

      <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <SideItem icon={<Settings size={14} />} label="Settings" active={false} onClick={() => {}} />
      </div>
    </div>
  );
}

/* ═══════════════════════ LIST VIEW ════════════════════════ */

function TaskRow({ task, onClick, cycleStatus }) {
  const s    = getSt(task.status);
  const p    = getPr(task.priority);
  const done = task.status === "done";
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "10px 14px", cursor: "pointer" }} className="hov-row">
      <button
        onClick={(e) => { e.stopPropagation(); cycleStatus(task.id, CYCLE[task.status]); }}
        style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${s.color}`, background: done ? s.color : "transparent", flexShrink: 0, transition: "all 0.2s" }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: done ? "#475569" : "#e2e8f0", textDecoration: done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {task.title}
        </div>
        {task.tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
            {task.tags.slice(0, 2).map((t) => <Chip key={t} label={t} />)}
          </div>
        )}
      </div>
      <div style={{ width: 90, display: "flex", justifyContent: "center" }}>
        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: s.color + "22", color: s.color, whiteSpace: "nowrap" }}>{s.label}</span>
      </div>
      <div style={{ width: 60, display: "flex", justifyContent: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.label}</span>
      </div>
      <div style={{ width: 26, display: "flex", justifyContent: "center" }}><Avatar name={task.assignee} size={22} /></div>
      <div style={{ width: 72, textAlign: "right" }}>
        <span style={{ fontSize: 12, color: "#475569" }}>{task.due ? task.due.slice(5).replace("-", "/") : "—"}</span>
      </div>
    </div>
  );
}

function ListView({ tasks, onTask, cycleStatus, showNew, setShowNew, newTitle, setNewTitle, addTask }) {
  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "4px 14px", marginBottom: 4, gap: 10 }}>
        <span style={{ flex: 1, fontSize: 10, color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Task</span>
        <span style={{ width: 90, textAlign: "center", fontSize: 10, color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Status</span>
        <span style={{ width: 60, textAlign: "center", fontSize: 10, color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Priority</span>
        <span style={{ width: 26 }} />
        <span style={{ width: 72, textAlign: "right", fontSize: 10, color: "#334155", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Due</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {tasks.map((t) => <TaskRow key={t.id} task={t} onClick={() => onTask(t)} cycleStatus={cycleStatus} />)}
      </div>
      {showNew ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, background: "#161622", border: "1px solid rgba(99,102,241,0.35)", borderRadius: 12, padding: "10px 14px" }}>
          <input
            autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addTask(); if (e.key === "Escape") { setShowNew(false); setNewTitle(""); } }}
            placeholder="Task title…"
            style={{ flex: 1, background: "transparent", color: "#e2e8f0", fontSize: 14, border: "none" }}
          />
          <button onClick={addTask} style={{ color: "#6366f1", padding: 4 }}><Check size={15} /></button>
          <button onClick={() => { setShowNew(false); setNewTitle(""); }} style={{ color: "#475569", padding: 4 }}><X size={15} /></button>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, padding: "8px 14px", borderRadius: 10, color: "#475569", fontSize: 13, width: "100%", background: "transparent" }}
          className="hov-side"
        >
          <Plus size={14} /> Add task
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════ BOARD VIEW ═══════════════════════ */

function BoardView({ tasks, onTask }) {
  return (
    <div style={{ padding: "0 24px 24px", display: "flex", gap: 14, overflowX: "auto" }}>
      {STATUSES.map((status) => {
        const col = tasks.filter((t) => t.status === status.id);
        return (
          <div key={status.id} style={{ flexShrink: 0, width: 238 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "0 2px" }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: status.color }} />
              <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>{status.label}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#334155", background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: 10 }}>{col.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {col.map((task) => (
                <div
                  key={task.id} onClick={() => onTask(task)}
                  style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px", cursor: "pointer" }}
                  className="hov-card"
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", lineHeight: 1.4, marginBottom: 10 }}>{task.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {task.tags.slice(0, 1).map((t) => <Chip key={t} label={t} />)}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: getPr(task.priority).color, fontWeight: 600 }}>{getPr(task.priority).label}</span>
                    <Avatar name={task.assignee} size={20} />
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

function TaskDetail({ task, onClose, cycleStatus }) {
  const p = getPr(task.priority);
  return (
    <div style={{ width: 320, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.05)", background: "#0d0d16", display: "flex", flexDirection: "column" }} className="slide">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>Task detail</span>
        <button onClick={onClose} style={{ color: "#475569", padding: 4 }}><X size={15} /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
        <h3 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>{task.title}</h3>
        <div>
          <Label>Status</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STATUSES.map((st) => (
              <button
                key={st.id} onClick={() => cycleStatus(task.id, st.id)}
                style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500, transition: "all 0.15s",
                  background: task.status === st.id ? st.color + "33" : "transparent",
                  color: task.status === st.id ? st.color : "#475569",
                  border: `1px solid ${task.status === st.id ? st.color + "66" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <PropRow label="Priority"><span style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.label}</span></PropRow>
          <PropRow label="Assignee">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={task.assignee} size={22} />
              <span style={{ color: "#cbd5e1", fontSize: 13 }}>{task.assignee}</span>
            </div>
          </PropRow>
          <PropRow label="Due date"><span style={{ color: "#94a3b8", fontSize: 13 }}>{task.due || "—"}</span></PropRow>
          {task.tags.length > 0 && <PropRow label="Tags"><div style={{ display: "flex", gap: 4 }}>{task.tags.map((t) => <Chip key={t} label={t} />)}</div></PropRow>}
        </div>
        <div>
          <Label>Description</Label>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 12px", minHeight: 64, fontSize: 13, color: task.description ? "#94a3b8" : "#334155", lineHeight: 1.6 }}>
            {task.description || "Add a description…"}
          </div>
        </div>
        <div>
          <Label>Activity</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { user: "Alex", action: "moved this to In Progress", time: "2h ago" },
              { user: "Sam",  action: "was assigned to this task",  time: "1d ago" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Avatar name={a.user} size={22} />
                <div>
                  <span style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 500 }}>{a.user}</span>
                  <span style={{ color: "#475569", fontSize: 12 }}> {a.action}</span>
                  <div style={{ color: "#334155", fontSize: 11, marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <input placeholder="Add a comment…" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "8px 12px", color: "#94a3b8", fontSize: 13 }} />
      </div>
    </div>
  );
}

/* ═══════════════════════ NOTIFICATIONS ════════════════════ */

function NotifPanel({ notifs, onClose, markAllRead }) {
  const unread = notifs.filter((n) => !n.read).length;
  return (
    <div style={{ width: 300, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.05)", background: "#0d0d16", display: "flex", flexDirection: "column" }} className="slide">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>Notifications</span>
          {unread > 0 && <span style={{ background: "#6366f1", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>{unread}</span>}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {unread > 0 && <button onClick={markAllRead} style={{ fontSize: 12, color: "#6366f1" }}>Mark all read</button>}
          <button onClick={onClose} style={{ color: "#475569", padding: 4 }}><X size={15} /></button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {notifs.map((n) => (
          <div key={n.id} style={{ display: "flex", gap: 12, padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: n.read ? 0.45 : 1, cursor: "pointer" }} className="hov-notif">
            <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1, marginTop: 1 }}>{n.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>{n.time}</div>
            </div>
            {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366f1", flexShrink: 0, marginTop: 5 }} />}
          </div>
        ))}
      </div>
      <div style={{ padding: "10px 18px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: 11, color: "#334155" }}>
        ⚡ Smart grouping active · Only critical alerts pushed
      </div>
    </div>
  );
}

/* ═══════════════════════ AUTOMATIONS ══════════════════════ */

function AutomationsPage({ autos, toggle }) {
  const totalRuns   = autos.reduce((a, b) => a + b.runs, 0);
  const activeCount = autos.filter((a) => a.active).length;
  return (
    <div style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Automations</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Trigger → action rules that run your workflow automatically.</p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#6366f1", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 500 }}>
          <Plus size={14} /> New Automation
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total runs this month", value: totalRuns,   icon: <Activity size={14} color="#6366f1" /> },
          { label: "Active automations",    value: activeCount, icon: <Zap size={14} color="#10b981" /> },
          { label: "Actions remaining",     value: "1,847",     icon: <Clock size={14} color="#f59e0b" /> },
        ].map((s, i) => (
          <div key={i} style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 12, marginBottom: 8 }}>{s.icon} {s.label}</div>
            <div style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 600 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {autos.map((auto) => (
          <div key={auto.id} style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, transition: "border-color 0.15s" }} className="hov-auto">
            <button
              onClick={() => toggle(auto.id)}
              style={{ width: 36, height: 22, borderRadius: 11, background: auto.active ? "#6366f1" : "rgba(255,255,255,0.08)", flexShrink: 0, position: "relative", transition: "background 0.2s" }}
            >
              <div style={{ position: "absolute", width: 16, height: 16, background: "#fff", borderRadius: "50%", top: 3, left: auto.active ? 17 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
            </button>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div style={{ padding: "5px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
                ⚡ {auto.trigger}
              </div>
              <ArrowRight size={13} color="#334155" style={{ flexShrink: 0 }} />
              <div style={{ padding: "5px 12px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 8, fontSize: 13, color: "#818cf8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
                → {auto.action}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{auto.runs} runs</div>
              <div style={{ fontSize: 11, color: "#334155" }}>last {auto.last}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: "16px 18px", background: "#161622", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Sparkles size={15} color="#818cf8" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Orbit AI can write automations for you</div>
          <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>Describe in plain English: "When a task is 2 days overdue, notify the assignee and escalate to their manager."</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ HOME PAGE ════════════════════════ */

function HomePage({ data, notifs }) {
  const all    = data.spaces.flatMap((s) => s.lists.flatMap((l) => l.tasks));
  const bySt   = (id) => all.filter((t) => t.status === id).length;
  const urgent = all.filter((t) => t.priority === "urgent" && t.status !== "done");
  const unread = notifs.filter((n) => !n.read);

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Good morning 👋</h1>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Here's everything happening across your workspace.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {STATUSES.map((s) => (
          <div key={s.id} style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: s.color, marginBottom: 4 }}>{bySt(s.id)}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>🚨 Urgent ({urgent.length})</div>
          {urgent.length === 0
            ? <div style={{ fontSize: 13, color: "#475569" }}>No urgent tasks — great work!</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {urgent.slice(0, 4).map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f43f5e", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#cbd5e1", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                    <Avatar name={t.assignee} size={20} />
                  </div>
                ))}
              </div>}
        </div>
        <div style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>🔔 New activity ({unread.length})</div>
          {unread.length === 0
            ? <div style={{ fontSize: 13, color: "#475569" }}>You're all caught up!</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {unread.map((n) => (
                  <div key={n.id} style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{n.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.4 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{n.time}</div>
                    </div>
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
  const [notifs,        setNotifs]        = useState(INIT_NOTIFS);
  const [autos,         setAutos]         = useState(INIT_AUTOS);
  const [query,         setQuery]         = useState("");
  const [showNew,       setShowNew]       = useState(false);
  const [newTitle,      setNewTitle]      = useState("");

  const activeSpace = data.spaces.find((s) => s.id === activeSpaceId);
  const activeList  = activeSpace?.lists.find((l) => l.id === activeListId);
  const tasks       = activeList?.tasks || [];
  const filtered    = query ? tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase())) : tasks;
  const unread      = notifs.filter((n) => !n.read).length;

  const toggleSpace = (id) => setData((d) => ({ ...d, spaces: d.spaces.map((s) => s.id === id ? { ...s, expanded: !s.expanded } : s) }));

  const cycleStatus = (tid, status) => {
    setData((d) => ({ ...d, spaces: d.spaces.map((sp) => ({ ...sp, lists: sp.lists.map((li) => ({ ...li, tasks: li.tasks.map((t) => t.id === tid ? { ...t, status } : t) })) })) }));
    setActiveTask((prev) => prev?.id === tid ? { ...prev, status } : prev);
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const t = { id: "t" + Date.now(), title: newTitle, description: "", status: "todo", priority: "normal", assignee: "You", due: "", tags: [] };
    setData((d) => ({ ...d, spaces: d.spaces.map((sp) => sp.id === activeSpaceId ? { ...sp, lists: sp.lists.map((li) => li.id === activeListId ? { ...li, tasks: [...li.tasks, t] } : li) } : sp) }));
    setNewTitle("");
    setShowNew(false);
  };

  const markAllRead = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  const toggleAuto  = (id) => setAutos((a) => a.map((x) => x.id === id ? { ...x, active: !x.active } : x));

  if (step !== null) {
    return (
      <Onboarding
        step={step} wName={wName} setWName={setWName} ucId={ucId} setUcId={setUcId}
        spName={spName} setSpName={setSpName}
        onNext={() => (step < 3 ? setStep(step + 1) : setStep(null))}
        onBack={() => setStep(step - 1)}
      />
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#09090f", color: "#e2e8f0", overflow: "hidden", fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <Sidebar
        spaces={data.spaces} activeSpaceId={activeSpaceId} activeListId={activeListId}
        setActiveSpaceId={setActiveSpaceId} setActiveListId={setActiveListId}
        toggleSpace={toggleSpace} page={page} setPage={setPage}
        unread={unread} showNotifs={showNotifs} setShowNotifs={setShowNotifs}
        setActiveTask={setActiveTask} wName={wName}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "6px 12px", maxWidth: 280, flex: 1 }}>
            <Search size={13} color="#475569" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks…"
              style={{ background: "transparent", color: "#cbd5e1", fontSize: 13, width: "100%", border: "none" }} />
          </div>
          {page === "tasks" && (
            <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
              <ViewBtn icon={<List size={15} />}         active={view === "list"}  onClick={() => setView("list")} />
              <ViewBtn icon={<LayoutKanban size={15} />} active={view === "board"} onClick={() => setView("board")} />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {page === "tasks" && (
            <div style={{ display: "flex", height: "100%" }}>
              <div style={{ flex: 1, overflow: "auto" }}>
                <div style={{ padding: "18px 24px 10px", display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <span style={{ color: activeSpace?.color, fontWeight: 500 }}>{activeSpace?.name}</span>
                  <ChevronRight size={14} color="#334155" />
                  <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{activeList?.name}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: "#334155", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 20 }}>{tasks.length} tasks</span>
                </div>
                {view === "list"
                  ? <ListView tasks={filtered} onTask={(t) => { setActiveTask(t); setShowNotifs(false); }} cycleStatus={cycleStatus} showNew={showNew} setShowNew={setShowNew} newTitle={newTitle} setNewTitle={setNewTitle} addTask={addTask} />
                  : <BoardView tasks={filtered} onTask={(t) => { setActiveTask(t); setShowNotifs(false); }} />}
              </div>
              {activeTask && !showNotifs && <TaskDetail task={activeTask} onClose={() => setActiveTask(null)} cycleStatus={cycleStatus} />}
            </div>
          )}
          {page === "automations" && <AutomationsPage autos={autos} toggle={toggleAuto} />}
          {page === "home" && <HomePage data={data} notifs={notifs} />}
        </div>
      </div>

      {showNotifs && <NotifPanel notifs={notifs} onClose={() => setShowNotifs(false)} markAllRead={markAllRead} />}
    </div>
  );
}
