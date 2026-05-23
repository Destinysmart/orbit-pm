"use client";
import { useState, useEffect, useRef } from "react";
import {
  ChevronRight, ChevronDown, Plus, Search, List, Columns,
  Bell, Zap, Settings, X, Check, ArrowRight, Sparkles, Hash,
  Activity, Home, Clock, Menu, Trash2, Edit3, Flag, User,
  Calendar, Tag, Send, MoreHorizontal, Circle, CheckCircle2,
  AlertCircle, LogOut, Briefcase, Save,
} from "lucide-react";

/* ─── MOBILE HOOK ─────────────────────────────────────────── */
function useIsMobile() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const c = () => setV(window.innerWidth < 768);
    c(); window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);
  return v;
}

/* ─── CONSTANTS ───────────────────────────────────────────── */
const STATUSES = [
  { id: "todo",       label: "To Do",       color: "#64748b", icon: Circle },
  { id: "inprogress", label: "In Progress",  color: "#6366f1", icon: AlertCircle },
  { id: "review",     label: "In Review",   color: "#f59e0b", icon: AlertCircle },
  { id: "done",       label: "Done",        color: "#10b981", icon: CheckCircle2 },
];
const PRIORITIES = [
  { id: "urgent", label: "Urgent", color: "#f43f5e" },
  { id: "high",   label: "High",   color: "#f97316" },
  { id: "normal", label: "Normal", color: "#6366f1" },
  { id: "low",    label: "Low",    color: "#475569" },
];
const SPACE_COLORS = ["#6366f1","#10b981","#f59e0b","#f43f5e","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];
const USE_CASES = [
  { id: "software",  emoji: "💻", label: "Software",   desc: "Sprints, bugs, features" },
  { id: "marketing", emoji: "📣", label: "Marketing",  desc: "Campaigns, content" },
  { id: "ops",       emoji: "⚙️",  label: "Operations", desc: "SOPs, logistics" },
  { id: "personal",  emoji: "🎯", label: "Personal",   desc: "Goals, tasks, habits" },
];
const INIT_DATA = {
  spaces: [
    { id:"s1", name:"Product", color:"#6366f1", expanded:true, lists:[
      { id:"l1", name:"Roadmap", tasks:[
        { id:"t1", title:"Design new onboarding flow", desc:"Redesign based on Q1 user research. Target time-to-value under 3 minutes.", status:"inprogress", priority:"high", assignee:"Alex K.", due:"2026-06-10", tags:["design","ux"], comments:[] },
        { id:"t2", title:"Build task detail panel", desc:"Slide-in panel showing full task metadata, comments and activity log.", status:"todo", priority:"normal", assignee:"Sam R.", due:"2026-06-15", tags:["frontend"], comments:[] },
        { id:"t3", title:"Performance audit — list view", desc:"Profile render performance on 200+ task lists. Target under 16ms per frame.", status:"review", priority:"urgent", assignee:"Jordan T.", due:"2026-05-30", tags:["perf"], comments:[] },
        { id:"t4", title:"Integrate notification engine", desc:"", status:"done", priority:"high", assignee:"Alex K.", due:"2026-05-20", tags:["backend"], comments:[] },
        { id:"t5", title:"Mobile responsiveness pass", desc:"Full audit on iOS Safari and Android Chrome.", status:"todo", priority:"normal", assignee:"Sam R.", due:"2026-06-20", tags:["mobile"], comments:[] },
      ]},
      { id:"l2", name:"Sprint 14", tasks:[
        { id:"t6", title:"Fix automation trigger edge case", desc:"Compound conditions fire twice on status change. Reproduce and patch.", status:"inprogress", priority:"urgent", assignee:"Jordan T.", due:"2026-05-28", tags:["bug"], comments:[] },
        { id:"t7", title:"Custom fields v1", desc:"", status:"todo", priority:"high", assignee:"Alex K.", due:"2026-06-25", tags:["feature"], comments:[] },
        { id:"t8", title:"API documentation", desc:"", status:"review", priority:"normal", assignee:"Sam R.", due:"2026-06-05", tags:["docs"], comments:[] },
      ]},
    ]},
    { id:"s2", name:"Marketing", color:"#10b981", expanded:false, lists:[
      { id:"l3", name:"Campaigns", tasks:[
        { id:"t9",  title:"Q2 social media calendar",  desc:"", status:"done",       priority:"normal", assignee:"Riley M.", due:"2026-05-15", tags:["social"],   comments:[] },
        { id:"t10", title:"Product launch email sequence", desc:"", status:"inprogress", priority:"high", assignee:"Morgan L.", due:"2026-06-01", tags:["email"], comments:[] },
        { id:"t11", title:"Blog: Why we built Orbit", desc:"", status:"todo", priority:"low", assignee:"Riley M.", due:"2026-06-30", tags:["content"], comments:[] },
      ]},
      { id:"l4", name:"Brand", tasks:[
        { id:"t12", title:"Logo refresh concepts",     desc:"", status:"inprogress", priority:"normal", assignee:"Morgan L.", due:"2026-06-10", tags:["design"], comments:[] },
        { id:"t13", title:"Update brand guidelines",   desc:"", status:"todo",       priority:"low",    assignee:"Riley M.", due:"2026-07-01", tags:["docs"],   comments:[] },
      ]},
    ]},
  ],
};
const INIT_NOTIFS = [
  { id:"n1", icon:"💬", text:'Alex K. mentioned you in "Design new onboarding flow"', time:"2m ago",  read:false },
  { id:"n2", icon:"⏰", text:'"Performance audit" is due in 2 days',                  time:"1h ago",  read:false },
  { id:"n3", icon:"👤", text:"Sam R. assigned you to Mobile responsiveness pass",      time:"3h ago",  read:true  },
  { id:"n4", icon:"✅", text:"Jordan T. completed Integrate notification engine",      time:"5h ago",  read:true  },
  { id:"n5", icon:"⚡", text:"Automation ran: Task done → Notify assignee (142×)",    time:"1d ago",  read:true  },
];
const INIT_AUTOS = [
  { id:"a1", trigger:"Task status → Done",      action:"Notify assignee",       active:true,  runs:142, last:"2m ago"  },
  { id:"a2", trigger:"Due date is tomorrow",    action:"Send reminder",         active:true,  runs:89,  last:"1h ago"  },
  { id:"a3", trigger:"Task created in Roadmap", action:"Set priority → Normal", active:false, runs:34,  last:"2d ago"  },
  { id:"a4", trigger:"Assignee field changes",  action:"Post update to Chat",   active:true,  runs:67,  last:"30m ago" },
];

/* ─── HELPERS ─────────────────────────────────────────────── */
const getSt = id => STATUSES.find(s => s.id === id) || STATUSES[0];
const getPr = id => PRIORITIES.find(p => p.id === id) || PRIORITIES[2];
const CYCLE = { todo:"inprogress", inprogress:"review", review:"done", done:"todo" };
const AVC   = ["#6366f1","#10b981","#f59e0b","#f43f5e","#3b82f6","#8b5cf6"];
const avc   = n => AVC[n.charCodeAt(0) % AVC.length];
const uid   = () => Math.random().toString(36).slice(2);
const now   = () => new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

function Avatar({ name, size=26 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", fontSize:size*0.38, background:avc(name), color:"#fff", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{name[0].toUpperCase()}</div>;
}
function Badge({ label, color }) {
  return <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, fontWeight:500, background:color+"22", color, border:`1px solid ${color}44`, whiteSpace:"nowrap" }}>{label}</span>;
}
function Chip({ label, onRemove }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, padding:"2px 8px", borderRadius:20, background:"rgba(99,102,241,0.12)", color:"#818cf8", border:"1px solid rgba(99,102,241,0.25)" }}>
    {label}{onRemove && <button onClick={onRemove} style={{ background:"none", border:"none", color:"#818cf8", cursor:"pointer", padding:0, lineHeight:1 }}>×</button>}
  </span>;
}

/* ─── MODAL ───────────────────────────────────────────────── */
function Modal({ title, onClose, children, width=420 }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#161625", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, width:"100%", maxWidth:width, boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }} className="fade">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:15 }}>{title}</span>
          <button onClick={onClose} style={{ color:"#64748b", padding:4, background:"none", border:"none", cursor:"pointer", borderRadius:6 }}><X size={16}/></button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── FORM COMPONENTS ─────────────────────────────────────── */
const inp = { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 12px", color:"#e2e8f0", fontSize:14, outline:"none", fontFamily:"inherit" };
const sel = { ...inp, cursor:"pointer" };
function Label({ children }) {
  return <div style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>{children}</div>;
}
function FormField({ label, children }) {
  return <div style={{ marginBottom:14 }}><Label>{label}</Label>{children}</div>;
}
function PrimaryBtn({ children, onClick, disabled, fullWidth, size="md" }) {
  const pad = size === "sm" ? "7px 14px" : "10px 20px";
  const fs  = size === "sm" ? 13 : 14;
  return <button onClick={onClick} disabled={disabled} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:pad, background:disabled?"rgba(99,102,241,0.3)":"#6366f1", color:disabled?"rgba(255,255,255,0.4)":"#fff", border:"none", borderRadius:10, fontSize:fs, fontWeight:500, cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit", width:fullWidth?"100%":"auto", transition:"background 0.15s" }}>{children}</button>;
}
function GhostBtn({ children, onClick, color="#64748b", size="md" }) {
  const pad = size === "sm" ? "6px 12px" : "8px 16px";
  return <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:6, padding:pad, background:"rgba(255,255,255,0.05)", color, border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>{children}</button>;
}
function DangerBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", background:"rgba(244,63,94,0.1)", color:"#f43f5e", border:"1px solid rgba(244,63,94,0.25)", borderRadius:10, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>{children}</button>;
}

/* ─── ONBOARDING ──────────────────────────────────────────── */
function Onboarding({ step, wName, setWName, ucId, setUcId, spName, setSpName, onNext, onBack }) {
  const valid = [wName.trim().length>0, !!ucId, spName.trim().length>0][step-1];
  return (
    <div style={{ minHeight:"100dvh", background:"#09090f", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:40 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}><Sparkles size={20} color="#fff"/></div>
          <span style={{ color:"#fff", fontSize:26, fontWeight:700, letterSpacing:-1 }}>Orbit</span>
        </div>
        <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:32 }}>
          {[1,2,3].map(s=><div key={s} style={{ height:3, borderRadius:3, flex:1, maxWidth:60, background:s<=step?"#6366f1":"rgba(255,255,255,0.1)", transition:"background 0.3s" }}/>)}
        </div>
        <div style={{ background:"#111120", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"32px 28px" }} className="fade">
          {step===1&&<>
            <div style={{ color:"#fff", fontSize:22, fontWeight:700, marginBottom:8, letterSpacing:-0.5 }}>Name your workspace</div>
            <div style={{ color:"#64748b", fontSize:14, marginBottom:24, lineHeight:1.6 }}>Your team's home in Orbit. You can change this anytime.</div>
            <input style={inp} autoFocus value={wName} onChange={e=>setWName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&valid&&onNext()} placeholder="e.g. Acme Inc., My Startup…" onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
          </>}
          {step===2&&<>
            <div style={{ color:"#fff", fontSize:22, fontWeight:700, marginBottom:8, letterSpacing:-0.5 }}>What are you building?</div>
            <div style={{ color:"#64748b", fontSize:14, marginBottom:24, lineHeight:1.6 }}>Orbit configures smart defaults for your workflow.</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {USE_CASES.map(uc=>(
                <button key={uc.id} onClick={()=>setUcId(uc.id)} style={{ padding:"16px 14px", borderRadius:12, textAlign:"left", transition:"all 0.2s", cursor:"pointer", border:ucId===uc.id?"1px solid rgba(99,102,241,0.6)":"1px solid rgba(255,255,255,0.07)", background:ucId===uc.id?"rgba(99,102,241,0.12)":"rgba(255,255,255,0.03)", fontFamily:"inherit" }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{uc.emoji}</div>
                  <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:14 }}>{uc.label}</div>
                  <div style={{ color:"#64748b", fontSize:12, marginTop:3 }}>{uc.desc}</div>
                </button>
              ))}
            </div>
          </>}
          {step===3&&<>
            <div style={{ color:"#fff", fontSize:22, fontWeight:700, marginBottom:8, letterSpacing:-0.5 }}>Create your first Space</div>
            <div style={{ color:"#64748b", fontSize:14, marginBottom:24, lineHeight:1.6 }}>Spaces are where your team's Lists and tasks live.</div>
            <input style={inp} autoFocus value={spName} onChange={e=>setSpName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&valid&&onNext()} placeholder="e.g. Product, Marketing, Engineering…" onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
            <div style={{ marginTop:14, padding:"14px 16px", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", borderRadius:12, display:"flex", gap:10, alignItems:"flex-start" }}>
              <Sparkles size={15} color="#818cf8" style={{ marginTop:2, flexShrink:0 }}/>
              <div><div style={{ color:"#818cf8", fontSize:13, fontWeight:600 }}>Orbit AI prepares your workspace</div><div style={{ color:"rgba(129,140,248,0.6)", fontSize:12, marginTop:3 }}>Smart statuses, views, and templates based on your use case.</div></div>
            </div>
          </>}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20 }}>
          {step>1?<GhostBtn onClick={onBack}>← Back</GhostBtn>:<div/>}
          <PrimaryBtn onClick={onNext} disabled={!valid}>{step===3?"Launch Orbit →":"Continue →"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

/* ─── SIDEBAR ─────────────────────────────────────────────── */
function SideItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"7px 10px", borderRadius:8, background:active?"rgba(99,102,241,0.15)":"transparent", color:active?"#818cf8":"#64748b", fontSize:13, fontWeight:active?500:400, transition:"all 0.1s", border:"none", cursor:"pointer", fontFamily:"inherit" }} className={active?"":"hov-side"}>
      {icon}<span style={{ flex:1, textAlign:"left" }}>{label}</span>
      {badge>0&&<span style={{ background:"#6366f1", color:"#fff", fontSize:10, fontWeight:700, borderRadius:10, padding:"1px 6px", minWidth:18, textAlign:"center" }}>{badge}</span>}
    </button>
  );
}

function Sidebar({ data, setData, activeSpaceId, activeListId, setActiveSpaceId, setActiveListId, page, setPage, unread, showNotifs, setShowNotifs, setActiveTask, wName, setPage2 }) {
  const [newListFor, setNewListFor] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [showAddSpace, setShowAddSpace] = useState(false);
  const [newSpace, setNewSpace] = useState({ name:"", color:SPACE_COLORS[0] });

  const addList = spaceId => {
    if (!newListName.trim()) return;
    setData(d=>({ ...d, spaces:d.spaces.map(s=>s.id===spaceId?{ ...s, lists:[...s.lists,{ id:uid(), name:newListName, tasks:[] }] }:s) }));
    setNewListName(""); setNewListFor(null);
  };
  const addSpace = () => {
    if (!newSpace.name.trim()) return;
    const s = { id:uid(), name:newSpace.name, color:newSpace.color, expanded:true, lists:[{ id:uid(), name:"Tasks", tasks:[] }] };
    setData(d=>({ ...d, spaces:[...d.spaces, s] }));
    setNewSpace({ name:"", color:SPACE_COLORS[0] }); setShowAddSpace(false);
  };
  const toggleSpace = id => setData(d=>({ ...d, spaces:d.spaces.map(s=>s.id===id?{ ...s, expanded:!s.expanded }:s) }));

  return (
    <>
    <div style={{ width:228, flexShrink:0, display:"flex", flexDirection:"column", background:"#0d0d18", borderRight:"1px solid rgba(255,255,255,0.06)", overflowY:"auto" }}>
      <div style={{ padding:"18px 14px 10px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}><Sparkles size={14} color="#fff"/></div>
        <div>
          <div style={{ color:"#fff", fontWeight:700, fontSize:15, letterSpacing:-0.3 }}>Orbit</div>
          <div style={{ color:"#475569", fontSize:11 }}>{wName||"My Workspace"}</div>
        </div>
      </div>
      <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"4px 0" }}/>
      <div style={{ padding:"8px 8px 0", display:"flex", flexDirection:"column", gap:1 }}>
        <SideItem icon={<Home size={14}/>} label="Home" active={page==="home"&&!showNotifs} onClick={()=>{ setPage("home"); setShowNotifs(false); }}/>
        <SideItem icon={<Bell size={14}/>} label="Notifications" active={showNotifs} onClick={()=>{ setShowNotifs(s=>!s); setActiveTask(null); }} badge={unread}/>
        <SideItem icon={<Zap size={14}/>} label="Automations" active={page==="automations"&&!showNotifs} onClick={()=>{ setPage("automations"); setShowNotifs(false); }}/>
        <SideItem icon={<Settings size={14}/>} label="Settings" active={page==="settings"&&!showNotifs} onClick={()=>{ setPage("settings"); setShowNotifs(false); }}/>
      </div>
      <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"8px 0" }}/>
      <div style={{ padding:"0 8px", flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"2px 6px 6px" }}>
          <span style={{ color:"#334155", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Spaces</span>
          <button onClick={()=>setShowAddSpace(true)} style={{ color:"#475569", background:"none", border:"none", cursor:"pointer", padding:2, borderRadius:4 }} title="Add Space"><Plus size={13}/></button>
        </div>
        {data.spaces.map(space=>(
          <div key={space.id}>
            <button onClick={()=>toggleSpace(space.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"6px 10px", borderRadius:8, background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit" }} className="hov-side">
              <div style={{ width:9, height:9, borderRadius:2, background:space.color, flexShrink:0 }}/>
              <span style={{ flex:1, textAlign:"left", color:"#cbd5e1", fontSize:13, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{space.name}</span>
              {space.expanded?<ChevronDown size={12} color="#475569"/>:<ChevronRight size={12} color="#475569"/>}
            </button>
            {space.expanded&&(
              <div style={{ marginLeft:16, marginBottom:4 }}>
                {space.lists.map(list=>{
                  const active=activeListId===list.id&&page==="tasks"&&!showNotifs;
                  return (
                    <button key={list.id} onClick={()=>{ setActiveSpaceId(space.id); setActiveListId(list.id); setPage("tasks"); setShowNotifs(false); setActiveTask(null); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"inherit", background:active?"rgba(99,102,241,0.15)":"transparent", color:active?"#818cf8":"#64748b" }} className={active?"":"hov-side"}>
                      <Hash size={11} style={{ flexShrink:0 }}/><span style={{ flex:1, textAlign:"left", fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{list.name}</span>
                      <span style={{ fontSize:10, color:"#334155" }}>{list.tasks.length}</span>
                    </button>
                  );
                })}
                {newListFor===space.id?(
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 6px", marginTop:2 }}>
                    <input autoFocus value={newListName} onChange={e=>setNewListName(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter")addList(space.id); if(e.key==="Escape"){ setNewListFor(null); setNewListName(""); }}} placeholder="List name…" style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(99,102,241,0.4)", borderRadius:7, padding:"5px 8px", color:"#e2e8f0", fontSize:12, outline:"none", fontFamily:"inherit" }}/>
                    <button onClick={()=>addList(space.id)} style={{ color:"#6366f1", background:"none", border:"none", cursor:"pointer" }}><Check size={13}/></button>
                    <button onClick={()=>{ setNewListFor(null); setNewListName(""); }} style={{ color:"#475569", background:"none", border:"none", cursor:"pointer" }}><X size={13}/></button>
                  </div>
                ):(
                  <button onClick={()=>setNewListFor(space.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:7, color:"#334155", fontSize:12, background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit" }} className="hov-side"><Plus size={11}/> New List</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    {showAddSpace&&(
      <Modal title="New Space" onClose={()=>setShowAddSpace(false)}>
        <FormField label="Space name"><input style={inp} autoFocus value={newSpace.name} onChange={e=>setNewSpace(s=>({ ...s, name:e.target.value }))} onKeyDown={e=>e.key==="Enter"&&addSpace()} placeholder="e.g. Engineering, Design…" onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/></FormField>
        <FormField label="Color">
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {SPACE_COLORS.map(c=><button key={c} onClick={()=>setNewSpace(s=>({ ...s, color:c }))} style={{ width:28, height:28, borderRadius:"50%", background:c, border:newSpace.color===c?"3px solid #fff":"3px solid transparent", cursor:"pointer" }}/>)}
          </div>
        </FormField>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:4 }}>
          <GhostBtn onClick={()=>setShowAddSpace(false)}>Cancel</GhostBtn>
          <PrimaryBtn onClick={addSpace} disabled={!newSpace.name.trim()}>Create Space</PrimaryBtn>
        </div>
      </Modal>
    )}
    </>
  );
}

/* ─── BOTTOM NAV (mobile) ─────────────────────────────────── */
function BottomNav({ page, setPage, showNotifs, setShowNotifs, setActiveTask, unread, showSpaces, setShowSpaces }) {
  const tabs = [
    { icon:<Home size={21}/>, label:"Home",  key:"home",        action:()=>{ setPage("home"); setShowNotifs(false); setActiveTask(null); setShowSpaces(false); } },
    { icon:<List size={21}/>, label:"Tasks", key:"tasks",       action:()=>{ setPage("tasks"); setShowNotifs(false); setActiveTask(null); setShowSpaces(false); } },
    { icon:<Bell size={21}/>, label:"Inbox", key:"notifs",      action:()=>{ setShowNotifs(s=>!s); setActiveTask(null); setShowSpaces(false); }, badge:unread },
    { icon:<Zap size={21}/>,  label:"Autos", key:"automations", action:()=>{ setPage("automations"); setShowNotifs(false); setActiveTask(null); setShowSpaces(false); } },
    { icon:<Menu size={21}/>, label:"Menu",  key:"spaces",      action:()=>{ setShowSpaces(s=>!s); setShowNotifs(false); } },
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#0d0d18", borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom)" }}>
      {tabs.map(t=>{
        const active = t.key==="notifs"?showNotifs : t.key==="spaces"?showSpaces : page===t.key&&!showNotifs&&!showSpaces;
        return (
          <button key={t.key} onClick={t.action} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"10px 4px 8px", background:"transparent", border:"none", cursor:"pointer", color:active?"#818cf8":"#475569", position:"relative", fontFamily:"inherit" }}>
            {t.icon}<span style={{ fontSize:10 }}>{t.label}</span>
            {t.badge>0&&<div style={{ position:"absolute", top:7, right:"50%", transform:"translateX(10px)", background:"#6366f1", color:"#fff", fontSize:9, fontWeight:700, borderRadius:8, padding:"1px 4px" }}>{t.badge}</div>}
          </button>
        );
      })}
    </div>
  );
}

/* ─── SPACES DRAWER (mobile) ──────────────────────────────── */
function SpacesDrawer({ data, setData, activeSpaceId, activeListId, setActiveSpaceId, setActiveListId, setPage, setShowSpaces, setActiveTask, wName }) {
  const toggleSpace = id => setData(d=>({ ...d, spaces:d.spaces.map(s=>s.id===id?{ ...s, expanded:!s.expanded }:s) }));
  return (
    <div style={{ position:"fixed", inset:0, zIndex:90, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div onClick={()=>setShowSpaces(false)} style={{ flex:1, background:"rgba(0,0,0,0.55)" }}/>
      <div style={{ background:"#0d0d18", borderRadius:"20px 20px 0 0", padding:"20px 16px 100px", maxHeight:"70vh", overflowY:"auto" }}>
        <div style={{ width:36, height:4, background:"rgba(255,255,255,0.15)", borderRadius:2, margin:"0 auto 20px" }}/>
        <div style={{ color:"#475569", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:14 }}>{wName||"My Workspace"}</div>
        {data.spaces.map(space=>(
          <div key={space.id}>
            <button onClick={()=>toggleSpace(space.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 8px", borderRadius:10, background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
              <div style={{ width:11, height:11, borderRadius:3, background:space.color, flexShrink:0 }}/>
              <span style={{ flex:1, textAlign:"left", color:"#cbd5e1", fontSize:15, fontWeight:500 }}>{space.name}</span>
              {space.expanded?<ChevronDown size={14} color="#475569"/>:<ChevronRight size={14} color="#475569"/>}
            </button>
            {space.expanded&&(
              <div style={{ marginLeft:22, marginBottom:6 }}>
                {space.lists.map(list=>(
                  <button key={list.id} onClick={()=>{ setActiveSpaceId(space.id); setActiveListId(list.id); setPage("tasks"); setShowSpaces(false); setActiveTask(null); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"10px 8px", borderRadius:8, background:activeListId===list.id?"rgba(99,102,241,0.15)":"transparent", color:activeListId===list.id?"#818cf8":"#64748b", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                    <Hash size={13} style={{ flexShrink:0 }}/><span style={{ flex:1, textAlign:"left", fontSize:14 }}>{list.name}</span>
                    <span style={{ fontSize:12, color:"#334155" }}>{list.tasks.length}</span>
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

/* ─── TASK ROW ────────────────────────────────────────────── */
function TaskRow({ task, onClick, cycleStatus, isMobile }) {
  const s=getSt(task.status), p=getPr(task.priority), done=task.status==="done";
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:12, background:"#141422", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:isMobile?"13px 14px":"10px 16px", cursor:"pointer", transition:"all 0.1s" }} className="hov-row">
      <button onClick={e=>{ e.stopPropagation(); cycleStatus(task.id, CYCLE[task.status]); }} style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${s.color}`, background:done?s.color:"transparent", flexShrink:0, cursor:"pointer", transition:"all 0.2s" }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:500, color:done?"#475569":"#e2e8f0", textDecoration:done?"line-through":"none", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:isMobile?4:0 }}>{task.title}</div>
        {isMobile&&<div style={{ display:"flex", alignItems:"center", gap:6 }}><Badge label={s.label} color={s.color}/><span style={{ fontSize:11, color:p.color, fontWeight:600 }}>{p.label}</span></div>}
      </div>
      {!isMobile&&<>
        <Badge label={s.label} color={s.color}/>
        <div style={{ width:56, display:"flex", justifyContent:"center" }}><span style={{ fontSize:12, fontWeight:600, color:p.color }}>{p.label}</span></div>
        <div style={{ width:28 }}><Avatar name={task.assignee} size={24}/></div>
        <div style={{ width:68, textAlign:"right" }}><span style={{ fontSize:12, color:"#475569" }}>{task.due?task.due.slice(5).replace("-","/"):"—"}</span></div>
      </>}
      {isMobile&&<Avatar name={task.assignee} size={30}/>}
    </div>
  );
}

/* ─── LIST VIEW ───────────────────────────────────────────── */
function ListView({ tasks, onTask, cycleStatus, showNew, setShowNew, newTitle, setNewTitle, addTask, isMobile }) {
  return (
    <div style={{ padding:isMobile?"0 14px 24px":"0 24px 24px" }}>
      {!isMobile&&(
        <div style={{ display:"flex", alignItems:"center", padding:"4px 16px", marginBottom:4, gap:12 }}>
          <div style={{ flex:1, fontSize:10, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Task</div>
          <div style={{ width:90, fontSize:10, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Status</div>
          <div style={{ width:56, textAlign:"center", fontSize:10, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Priority</div>
          <div style={{ width:28 }}/>
          <div style={{ width:68, textAlign:"right", fontSize:10, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Due</div>
        </div>
      )}
      {tasks.length===0&&!showNew&&(
        <div style={{ textAlign:"center", padding:"48px 20px" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
          <div style={{ color:"#e2e8f0", fontSize:15, fontWeight:600, marginBottom:6 }}>No tasks yet</div>
          <div style={{ color:"#475569", fontSize:13, marginBottom:20 }}>Add your first task to get started</div>
          <PrimaryBtn onClick={()=>setShowNew(true)} size="sm"><Plus size={13}/> Add task</PrimaryBtn>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {tasks.map(t=><TaskRow key={t.id} task={t} onClick={()=>onTask(t)} cycleStatus={cycleStatus} isMobile={isMobile}/>)}
      </div>
      {showNew?(
        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8, background:"#141422", border:"1px solid rgba(99,102,241,0.4)", borderRadius:10, padding:"11px 14px" }}>
          <input autoFocus value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter")addTask(); if(e.key==="Escape"){ setShowNew(false); setNewTitle(""); }}} placeholder="Task name…" style={{ flex:1, background:"transparent", color:"#e2e8f0", fontSize:14, border:"none", outline:"none", fontFamily:"inherit" }}/>
          <button onClick={addTask} style={{ color:"#6366f1", background:"none", border:"none", cursor:"pointer", padding:4 }}><Check size={16}/></button>
          <button onClick={()=>{ setShowNew(false); setNewTitle(""); }} style={{ color:"#475569", background:"none", border:"none", cursor:"pointer", padding:4 }}><X size={16}/></button>
        </div>
      ):(
        tasks.length>0&&<button onClick={()=>setShowNew(true)} style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, padding:"9px 14px", borderRadius:10, color:"#475569", fontSize:13, width:"100%", background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit" }} className="hov-side"><Plus size={14}/> Add task</button>
      )}
    </div>
  );
}

/* ─── BOARD VIEW ──────────────────────────────────────────── */
function BoardView({ tasks, onTask, isMobile }) {
  return (
    <div style={{ padding:isMobile?"0 14px 24px":"0 24px 24px", display:"flex", gap:14, overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
      {STATUSES.map(status=>{
        const col=tasks.filter(t=>t.status===status.id);
        return (
          <div key={status.id} style={{ flexShrink:0, width:isMobile?"80vw":250, maxWidth:300 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, padding:"0 2px" }}>
              <div style={{ width:9, height:9, borderRadius:"50%", background:status.color }}/>
              <span style={{ color:"#94a3b8", fontSize:13, fontWeight:600 }}>{status.label}</span>
              <span style={{ marginLeft:"auto", fontSize:11, color:"#334155", background:"rgba(255,255,255,0.05)", padding:"1px 7px", borderRadius:10 }}>{col.length}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {col.map(task=>(
                <div key={task.id} onClick={()=>onTask(task)} style={{ background:"#141422", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"13px 14px", cursor:"pointer" }} className="hov-card">
                  <div style={{ fontSize:13, fontWeight:500, color:"#e2e8f0", lineHeight:1.5, marginBottom:10 }}>{task.title}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:11, color:getPr(task.priority).color, fontWeight:600 }}>{getPr(task.priority).label}</span>
                    {task.tags.slice(0,1).map(t=><Chip key={t} label={t}/>)}
                    <div style={{ marginLeft:"auto" }}><Avatar name={task.assignee} size={22}/></div>
                  </div>
                </div>
              ))}
              {col.length===0&&<div style={{ border:"1px dashed rgba(255,255,255,0.08)", borderRadius:10, padding:"20px", textAlign:"center", color:"#334155", fontSize:12 }}>No tasks</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── TASK DETAIL ─────────────────────────────────────────── */
function TaskDetail({ task, onClose, updateTask, deleteTask, isMobile }) {
  const [editing, setEditing] = useState({ title:task.title, desc:task.desc, assignee:task.assignee, due:task.due, status:task.status, priority:task.priority });
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [comments, setComments] = useState(task.comments||[]);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(()=>{ setEditing({ title:task.title, desc:task.desc, assignee:task.assignee, due:task.due, status:task.status, priority:task.priority }); setComments(task.comments||[]); },[task.id]);

  const save = () => { updateTask(task.id, { ...editing, comments }); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const addComment = () => { if(!comment.trim()) return; const c={ id:uid(), user:"You", text:comment, time:now() }; const nc=[...comments,c]; setComments(nc); updateTask(task.id,{ ...editing, comments:nc }); setComment(""); };
  const addTag = () => { if(!tagInput.trim()||task.tags.includes(tagInput.trim())) return; const t=tagInput.trim(); updateTask(task.id,{ ...task, tags:[...task.tags,t] }); setTagInput(""); };
  const removeTag = tag => updateTask(task.id,{ ...task, tags:task.tags.filter(t=>t!==tag) });

  const wrapStyle = isMobile
    ? { position:"fixed", inset:0, zIndex:80, display:"flex", flexDirection:"column", background:"#0d0d18" }
    : { width:340, flexShrink:0, borderLeft:"1px solid rgba(255,255,255,0.07)", background:"#0d0d18", display:"flex", flexDirection:"column" };

  const inpSm = { ...inp, fontSize:13, padding:"8px 10px" };

  return (
    <>
    <div style={wrapStyle} className="slide">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", paddingTop:isMobile?"max(14px,env(safe-area-inset-top))":14, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:"#64748b", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>Task</span>
          {saved&&<span style={{ fontSize:11, color:"#10b981", background:"rgba(16,185,129,0.1)", padding:"2px 8px", borderRadius:10 }}>✓ Saved</span>}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={()=>setShowDelete(true)} style={{ color:"#475569", background:"none", border:"none", cursor:"pointer", padding:6, borderRadius:7 }} title="Delete task"><Trash2 size={14}/></button>
          <button onClick={save} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:8, color:"#818cf8", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}><Save size={12}/> Save</button>
          <button onClick={onClose} style={{ color:"#475569", background:"none", border:"none", cursor:"pointer", padding:6, borderRadius:7 }}><X size={16}/></button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:16, paddingBottom:isMobile?"90px":16 }}>
        {/* Title */}
        <textarea value={editing.title} onChange={e=>setEditing(v=>({ ...v, title:e.target.value }))} style={{ ...inp, fontSize:16, fontWeight:600, resize:"none", lineHeight:1.4, minHeight:60, padding:"10px 12px" }} placeholder="Task title"/>

        {/* Status */}
        <div>
          <Label>Status</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {STATUSES.map(st=>(
              <button key={st.id} onClick={()=>setEditing(v=>({ ...v, status:st.id }))} style={{ fontSize:12, padding:"5px 12px", borderRadius:20, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:editing.status===st.id?st.color+"25":"transparent", color:editing.status===st.id?st.color:"#475569", border:`1px solid ${editing.status===st.id?st.color+"55":"rgba(255,255,255,0.08)"}` }}>{st.label}</button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <Label>Priority</Label>
          <div style={{ display:"flex", gap:6 }}>
            {PRIORITIES.map(p=>(
              <button key={p.id} onClick={()=>setEditing(v=>({ ...v, priority:p.id }))} style={{ fontSize:12, padding:"5px 10px", borderRadius:8, fontWeight:500, cursor:"pointer", fontFamily:"inherit", background:editing.priority===p.id?p.color+"20":"transparent", color:editing.priority===p.id?p.color:"#475569", border:`1px solid ${editing.priority===p.id?p.color+"55":"rgba(255,255,255,0.08)"}` }}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Assignee & Due */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div>
            <Label>Assignee</Label>
            <input style={inpSm} value={editing.assignee} onChange={e=>setEditing(v=>({ ...v, assignee:e.target.value }))} placeholder="Name…"/>
          </div>
          <div>
            <Label>Due date</Label>
            <input type="date" style={{ ...inpSm, colorScheme:"dark" }} value={editing.due} onChange={e=>setEditing(v=>({ ...v, due:e.target.value }))}/>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
            {task.tags.map(t=><Chip key={t} label={t} onRemove={()=>removeTag(t)}/>)}
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); addTag(); }}} placeholder="Add tag…" style={{ ...inpSm, flex:1 }}/>
            <button onClick={addTag} style={{ padding:"8px 12px", background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", borderRadius:10, color:"#818cf8", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>Add</button>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <textarea value={editing.desc} onChange={e=>setEditing(v=>({ ...v, desc:e.target.value }))} placeholder="Add a description…" style={{ ...inp, resize:"vertical", minHeight:88, lineHeight:1.6, fontSize:13 }}/>
        </div>

        {/* Comments */}
        <div>
          <Label>Comments ({comments.length})</Label>
          {comments.length===0&&<div style={{ color:"#334155", fontSize:13, marginBottom:10 }}>No comments yet.</div>}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:12 }}>
            {comments.map(c=>(
              <div key={c.id} style={{ display:"flex", gap:10 }}>
                <Avatar name={c.user} size={26}/>
                <div style={{ flex:1, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ color:"#cbd5e1", fontSize:12, fontWeight:600 }}>{c.user}</span>
                    <span style={{ color:"#475569", fontSize:11 }}>{c.time}</span>
                  </div>
                  <div style={{ color:"#94a3b8", fontSize:13, lineHeight:1.5 }}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addComment()} placeholder="Add a comment…" style={{ ...inpSm, flex:1 }}/>
            <button onClick={addComment} style={{ padding:"8px 12px", background:comment.trim()?"#6366f1":"rgba(255,255,255,0.05)", border:"none", borderRadius:10, color:comment.trim()?"#fff":"#475569", cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit" }}><Send size={14}/></button>
          </div>
        </div>
      </div>
    </div>

    {showDelete&&(
      <Modal title="Delete task?" onClose={()=>setShowDelete(false)} width={360}>
        <div style={{ color:"#94a3b8", fontSize:14, lineHeight:1.6, marginBottom:20 }}>
          Are you sure you want to delete <strong style={{ color:"#e2e8f0" }}>"{task.title}"</strong>? This cannot be undone.
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <GhostBtn onClick={()=>setShowDelete(false)}>Cancel</GhostBtn>
          <DangerBtn onClick={()=>{ deleteTask(task.id); setShowDelete(false); onClose(); }}><Trash2 size={13}/> Delete</DangerBtn>
        </div>
      </Modal>
    )}
    </>
  );
}

/* ─── NOTIFICATIONS ───────────────────────────────────────── */
function NotifPanel({ notifs, setNotifs, onClose, isMobile }) {
  const unread = notifs.filter(n=>!n.read).length;
  const markAllRead = () => setNotifs(n=>n.map(x=>({ ...x, read:true })));
  const markRead = id => setNotifs(n=>n.map(x=>x.id===id?{ ...x, read:true }:x));
  const dismiss = id => setNotifs(n=>n.filter(x=>x.id!==id));

  const style = isMobile
    ? { position:"fixed", inset:0, zIndex:80, display:"flex", flexDirection:"column", background:"#0d0d18" }
    : { width:320, flexShrink:0, borderLeft:"1px solid rgba(255,255,255,0.07)", background:"#0d0d18", display:"flex", flexDirection:"column" };

  return (
    <div style={style} className="slide">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", paddingTop:isMobile?"max(14px,env(safe-area-inset-top))":14, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:"#f1f5f9", fontSize:14, fontWeight:600 }}>Notifications</span>
          {unread>0&&<span style={{ background:"#6366f1", color:"#fff", fontSize:10, fontWeight:700, borderRadius:10, padding:"1px 7px" }}>{unread}</span>}
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {unread>0&&<button onClick={markAllRead} style={{ fontSize:12, color:"#6366f1", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Mark all read</button>}
          <button onClick={onClose} style={{ color:"#475569", background:"none", border:"none", cursor:"pointer", padding:4 }}><X size={16}/></button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", paddingBottom:isMobile?80:0 }}>
        {notifs.length===0&&<div style={{ textAlign:"center", padding:"40px 20px", color:"#475569" }}><div style={{ fontSize:32, marginBottom:12 }}>🎉</div>You're all caught up!</div>}
        {notifs.map(n=>(
          <div key={n.id} onClick={()=>markRead(n.id)} style={{ display:"flex", gap:12, padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.05)", opacity:n.read?0.45:1, cursor:"pointer", transition:"opacity 0.2s", position:"relative" }} className="hov-notif">
            <span style={{ fontSize:20, flexShrink:0, lineHeight:1, marginTop:1 }}>{n.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.5 }}>{n.text}</div>
              <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>{n.time}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end" }}>
              {!n.read&&<div style={{ width:8, height:8, borderRadius:"50%", background:"#6366f1", flexShrink:0 }}/>}
              <button onClick={e=>{ e.stopPropagation(); dismiss(n.id); }} style={{ color:"#334155", background:"none", border:"none", cursor:"pointer", padding:2 }}><X size={12}/></button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:"10px 16px", borderTop:"1px solid rgba(255,255,255,0.07)", textAlign:"center", fontSize:11, color:"#334155" }}>⚡ Smart grouping · Only critical alerts pushed</div>
    </div>
  );
}

/* ─── AUTOMATIONS ─────────────────────────────────────────── */
function AutomationsPage({ autos, setAutos, isMobile }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ trigger:"", action:"" });
  const toggle = id => setAutos(a=>a.map(x=>x.id===id?{ ...x, active:!x.active }:x));
  const deleteAuto = id => setAutos(a=>a.filter(x=>x.id!==id));
  const addAuto = () => {
    if(!form.trigger.trim()||!form.action.trim()) return;
    setAutos(a=>[...a,{ id:uid(), trigger:form.trigger, action:form.action, active:true, runs:0, last:"Never" }]);
    setForm({ trigger:"", action:"" }); setShowNew(false);
  };
  const totalRuns=autos.reduce((a,b)=>a+b.runs,0), activeCount=autos.filter(a=>a.active).length;

  return (
    <>
    <div style={{ padding:isMobile?"20px 16px 100px":32, maxWidth:720, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ color:"#f1f5f9", fontSize:20, fontWeight:700, marginBottom:6, letterSpacing:-0.5 }}>Automations</h1>
          <p style={{ color:"#64748b", fontSize:13, lineHeight:1.5 }}>Rules that run your workflow automatically — no manual work.</p>
        </div>
        <PrimaryBtn onClick={()=>setShowNew(true)} size="sm"><Plus size={13}/> New Rule</PrimaryBtn>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
        {[{ label:"Total runs", value:totalRuns, color:"#6366f1", icon:<Activity size={14}/> },{ label:"Active rules", value:activeCount, color:"#10b981", icon:<Zap size={14}/> },{ label:"Actions left", value:"1,847", color:"#f59e0b", icon:<Clock size={14}/> }].map((s,i)=>(
          <div key={i} style={{ background:"#141422", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, color:"#64748b", fontSize:11, marginBottom:8 }}><span style={{ color:s.color }}>{s.icon}</span>{s.label}</div>
            <div style={{ color:"#f1f5f9", fontSize:24, fontWeight:700 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {autos.map(auto=>(
          <div key={auto.id} style={{ background:"#141422", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" }} className="hov-auto">
            <div style={{ display:"flex", alignItems:isMobile?"flex-start":"center", gap:14 }}>
              <button onClick={()=>toggle(auto.id)} style={{ width:40, height:24, borderRadius:12, background:auto.active?"#6366f1":"rgba(255,255,255,0.1)", flexShrink:0, position:"relative", transition:"background 0.25s", border:"none", cursor:"pointer" }}>
                <div style={{ position:"absolute", width:18, height:18, background:"#fff", borderRadius:"50%", top:3, left:auto.active?19:3, transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.4)" }}/>
              </button>
              <div style={{ flex:1, minWidth:0 }}>
                {isMobile?(
                  <div>
                    <div style={{ fontSize:13, color:"#94a3b8", marginBottom:4 }}>⚡ {auto.trigger}</div>
                    <div style={{ fontSize:13, color:"#818cf8" }}>→ {auto.action}</div>
                  </div>
                ):(
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:13, color:"#94a3b8", background:"rgba(255,255,255,0.05)", padding:"5px 12px", borderRadius:8 }}>⚡ {auto.trigger}</span>
                    <ArrowRight size={13} color="#334155" style={{ flexShrink:0 }}/>
                    <span style={{ fontSize:13, color:"#818cf8", background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)", padding:"5px 12px", borderRadius:8 }}>→ {auto.action}</span>
                  </div>
                )}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{auto.runs.toLocaleString()}</div>
                  <div style={{ fontSize:10, color:"#334155" }}>{auto.last}</div>
                </div>
                <button onClick={()=>deleteAuto(auto.id)} style={{ color:"#334155", background:"none", border:"none", cursor:"pointer", padding:4, borderRadius:6 }} className="hov-side"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
        {autos.length===0&&<div style={{ textAlign:"center", padding:"40px", color:"#475569", border:"1px dashed rgba(255,255,255,0.08)", borderRadius:12 }}>No automations yet. Create your first rule above.</div>}
      </div>
      <div style={{ marginTop:20, padding:"16px 18px", background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))", border:"1px solid rgba(99,102,241,0.15)", borderRadius:12, display:"flex", gap:12, alignItems:"flex-start" }}>
        <Sparkles size={15} color="#818cf8" style={{ marginTop:2, flexShrink:0 }}/>
        <div>
          <div style={{ color:"#fff", fontSize:14, fontWeight:600, marginBottom:4 }}>Orbit AI writes automations for you</div>
          <div style={{ color:"#64748b", fontSize:13, lineHeight:1.5 }}>Describe in plain English: "When a task is 2 days overdue, notify the assignee and flag it as urgent."</div>
        </div>
      </div>
    </div>
    {showNew&&(
      <Modal title="New Automation Rule" onClose={()=>setShowNew(false)}>
        <FormField label="When this happens (trigger)">
          <input style={inp} value={form.trigger} onChange={e=>setForm(f=>({ ...f, trigger:e.target.value }))} placeholder='e.g. "Task status → Done"' onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
        </FormField>
        <FormField label="Do this (action)">
          <input style={inp} value={form.action} onChange={e=>setForm(f=>({ ...f, action:e.target.value }))} placeholder='e.g. "Notify assignee"' onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
        </FormField>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:4 }}>
          <GhostBtn onClick={()=>setShowNew(false)}>Cancel</GhostBtn>
          <PrimaryBtn onClick={addAuto} disabled={!form.trigger.trim()||!form.action.trim()}><Zap size={13}/> Create Rule</PrimaryBtn>
        </div>
      </Modal>
    )}
    </>
  );
}

/* ─── HOME ────────────────────────────────────────────────── */
function HomePage({ data, notifs, isMobile, setActiveListId, setActiveSpaceId, setPage, setShowNotifs }) {
  const all=data.spaces.flatMap(s=>s.lists.flatMap(l=>l.tasks));
  const bySt=id=>all.filter(t=>t.status===id).length;
  const urgent=all.filter(t=>t.priority==="urgent"&&t.status!=="done");
  const unread=notifs.filter(n=>!n.read);
  const overdue=all.filter(t=>t.due&&new Date(t.due)<new Date()&&t.status!=="done");

  return (
    <div style={{ padding:isMobile?"20px 16px 100px":32, maxWidth:860, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ color:"#f1f5f9", fontSize:isMobile?20:24, fontWeight:700, marginBottom:4, letterSpacing:-0.5 }}>Good morning 👋</h1>
        <p style={{ color:"#64748b", fontSize:14 }}>Here's what's happening across your workspace.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:20 }}>
        {STATUSES.map(s=>(
          <div key={s.id} style={{ background:"#141422", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"16px 18px", cursor:"pointer" }} className="hov-card">
            <div style={{ fontSize:32, fontWeight:700, color:s.color, marginBottom:4, letterSpacing:-1 }}>{bySt(s.id)}</div>
            <div style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {urgent.length>0&&(
          <div style={{ background:"#141422", border:"1px solid rgba(244,63,94,0.2)", borderRadius:14, padding:18 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#f1f5f9", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>🚨 Urgent <span style={{ background:"rgba(244,63,94,0.15)", color:"#f43f5e", fontSize:11, padding:"2px 7px", borderRadius:10 }}>{urgent.length}</span></div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {urgent.slice(0,4).map(t=>(
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#f43f5e", flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:"#cbd5e1", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</span>
                  <Avatar name={t.assignee} size={22}/>
                </div>
              ))}
            </div>
          </div>
        )}
        {overdue.length>0&&(
          <div style={{ background:"#141422", border:"1px solid rgba(245,158,11,0.2)", borderRadius:14, padding:18 }}>
            <div style={{ fontSize:14, fontWeight:600, color:"#f1f5f9", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>⏰ Overdue <span style={{ background:"rgba(245,158,11,0.15)", color:"#f59e0b", fontSize:11, padding:"2px 7px", borderRadius:10 }}>{overdue.length}</span></div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {overdue.slice(0,3).map(t=>(
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <Calendar size={13} color="#f59e0b" style={{ flexShrink:0 }}/>
                  <span style={{ fontSize:13, color:"#cbd5e1", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.title}</span>
                  <span style={{ fontSize:11, color:"#f59e0b" }}>{t.due}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ background:"#141422", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:18 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#f1f5f9", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
            🔔 Unread <span style={{ background:"rgba(99,102,241,0.15)", color:"#818cf8", fontSize:11, padding:"2px 7px", borderRadius:10 }}>{unread.length}</span>
            <button onClick={()=>setShowNotifs(true)} style={{ marginLeft:"auto", fontSize:12, color:"#6366f1", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>View all →</button>
          </div>
          {unread.length===0?<div style={{ fontSize:13, color:"#475569" }}>All caught up!</div>:
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {unread.slice(0,3).map(n=>(
                <div key={n.id} style={{ display:"flex", gap:10 }}>
                  <span style={{ fontSize:18 }}>{n.icon}</span>
                  <div><div style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.4 }}>{n.text}</div><div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{n.time}</div></div>
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div>
  );
}

/* ─── SETTINGS ────────────────────────────────────────────── */
function SettingsPage({ wName, setWName, isMobile }) {
  const [name, setName] = useState(wName);
  const [saved, setSaved] = useState(false);
  const save = () => { setWName(name); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  return (
    <div style={{ padding:isMobile?"20px 16px 100px":32, maxWidth:560, margin:"0 auto" }}>
      <h1 style={{ color:"#f1f5f9", fontSize:20, fontWeight:700, marginBottom:4, letterSpacing:-0.5 }}>Settings</h1>
      <p style={{ color:"#64748b", fontSize:13, marginBottom:28 }}>Manage your workspace preferences.</p>
      <div style={{ background:"#141422", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"20px" }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}><Briefcase size={14} color="#6366f1"/> Workspace</div>
        <FormField label="Workspace name">
          <input style={inp} value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} placeholder="Workspace name" onFocus={e=>e.target.style.borderColor="#6366f1"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>
        </FormField>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <PrimaryBtn onClick={save} size="sm"><Save size={13}/> Save changes</PrimaryBtn>
          {saved&&<span style={{ fontSize:12, color:"#10b981" }}>✓ Saved</span>}
        </div>
      </div>
      <div style={{ background:"#141422", border:"1px solid rgba(244,63,94,0.15)", borderRadius:14, padding:"20px", marginTop:14 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#f43f5e", marginBottom:10 }}>Danger zone</div>
        <div style={{ fontSize:13, color:"#64748b", marginBottom:14 }}>These actions are permanent and cannot be undone.</div>
        <DangerBtn onClick={()=>alert("This would delete the workspace in production.")}><Trash2 size={13}/> Delete workspace</DangerBtn>
      </div>
    </div>
  );
}

/* ─── ROOT ────────────────────────────────────────────────── */
export default function Orbit() {
  const isMobile = useIsMobile();
  const [step,   setStep]   = useState(1);
  const [wName,  setWName]  = useState("");
  const [ucId,   setUcId]   = useState("");
  const [spName, setSpName] = useState("");
  const [data,          setData]          = useState(INIT_DATA);
  const [activeSpaceId, setActiveSpaceId] = useState("s1");
  const [activeListId,  setActiveListId]  = useState("l1");
  const [view,          setView]          = useState("list");
  const [page,          setPage]          = useState("home");
  const [activeTask,    setActiveTask]    = useState(null);
  const [showNotifs,    setShowNotifs]    = useState(false);
  const [showSpaces,    setShowSpaces]    = useState(false);
  const [notifs,        setNotifs]        = useState(INIT_NOTIFS);
  const [autos,         setAutos]         = useState(INIT_AUTOS);
  const [query,         setQuery]         = useState("");
  const [showNew,       setShowNew]       = useState(false);
  const [newTitle,      setNewTitle]      = useState("");

  const activeSpace = data.spaces.find(s=>s.id===activeSpaceId);
  const activeList  = activeSpace?.lists.find(l=>l.id===activeListId);
  const tasks       = activeList?.tasks||[];
  const filtered    = query?tasks.filter(t=>t.title.toLowerCase().includes(query.toLowerCase())):tasks;
  const unread      = notifs.filter(n=>!n.read).length;

  const updateTask = (tid, updates) => {
    setData(d=>({ ...d, spaces:d.spaces.map(sp=>({ ...sp, lists:sp.lists.map(li=>({ ...li, tasks:li.tasks.map(t=>t.id===tid?{ ...t, ...updates }:t) })) })) }));
    setActiveTask(prev=>prev?.id===tid?{ ...prev, ...updates }:prev);
  };
  const deleteTask = tid => {
    setData(d=>({ ...d, spaces:d.spaces.map(sp=>({ ...sp, lists:sp.lists.map(li=>({ ...li, tasks:li.tasks.filter(t=>t.id!==tid) })) })) }));
  };
  const cycleStatus = (tid,status) => updateTask(tid,{ status });
  const addTask = () => {
    if(!newTitle.trim()) return;
    const t={ id:uid(), title:newTitle, desc:"", status:"todo", priority:"normal", assignee:"You", due:"", tags:[], comments:[] };
    setData(d=>({ ...d, spaces:d.spaces.map(sp=>sp.id===activeSpaceId?{ ...sp, lists:sp.lists.map(li=>li.id===activeListId?{ ...li, tasks:[...li.tasks,t] }:li) }:sp) }));
    setNewTitle(""); setShowNew(false);
  };

  if(step!==null) return <Onboarding step={step} wName={wName} setWName={setWName} ucId={ucId} setUcId={setUcId} spName={spName} setSpName={setSpName} onNext={()=>step<3?setStep(step+1):setStep(null)} onBack={()=>setStep(step-1)}/>;

  const showDetail = activeTask&&!showNotifs;

  return (
    <div style={{ display:"flex", height:"100dvh", background:"#09090f", color:"#e2e8f0", overflow:"hidden", fontFamily:"'Outfit',system-ui,sans-serif" }}>
      {!isMobile&&<Sidebar data={data} setData={setData} activeSpaceId={activeSpaceId} activeListId={activeListId} setActiveSpaceId={setActiveSpaceId} setActiveListId={setActiveListId} page={page} setPage={setPage} unread={unread} showNotifs={showNotifs} setShowNotifs={setShowNotifs} setActiveTask={setActiveTask} wName={wName}/>}

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ height:isMobile?56:52, display:"flex", alignItems:"center", padding:isMobile?"0 14px":"0 24px", gap:12, borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0, background:"rgba(9,9,15,0.8)", backdropFilter:"blur(8px)" }}>
          {isMobile&&<div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}><Sparkles size={13} color="#fff"/></div>
            <span style={{ color:"#fff", fontWeight:700, fontSize:15 }}>Orbit</span>
          </div>}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"7px 12px", flex:1, maxWidth:isMobile?"100%":320 }}>
            <Search size={13} color="#475569"/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks…" style={{ background:"transparent", color:"#cbd5e1", fontSize:isMobile?16:13, width:"100%", border:"none", outline:"none", fontFamily:"inherit" }}/>
            {query&&<button onClick={()=>setQuery("")} style={{ color:"#475569", background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:1 }}><X size={12}/></button>}
          </div>
          {page==="tasks"&&(
            <div style={{ display:"flex", gap:2, marginLeft:"auto" }}>
              <button onClick={()=>setView("list")} style={{ padding:"6px 8px", borderRadius:8, background:view==="list"?"rgba(99,102,241,0.2)":"transparent", color:view==="list"?"#818cf8":"#475569", border:"none", cursor:"pointer" }}><List size={16}/></button>
              <button onClick={()=>setView("board")} style={{ padding:"6px 8px", borderRadius:8, background:view==="board"?"rgba(99,102,241,0.2)":"transparent", color:view==="board"?"#818cf8":"#475569", border:"none", cursor:"pointer" }}><Columns size={16}/></button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex:1, overflow:"auto", WebkitOverflowScrolling:"touch" }}>
          {page==="tasks"&&(
            <div style={{ display:"flex", height:"100%" }}>
              <div style={{ flex:1, overflow:"auto" }}>
                <div style={{ padding:isMobile?"14px 16px 10px":"16px 24px 10px", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:activeSpace?.color, fontWeight:600, fontSize:13 }}>{activeSpace?.name}</span>
                  <ChevronRight size={12} color="#334155"/>
                  <span style={{ color:"#cbd5e1", fontWeight:600, fontSize:13 }}>{activeList?.name}</span>
                  <span style={{ marginLeft:6, fontSize:11, color:"#475569", background:"rgba(255,255,255,0.05)", padding:"2px 8px", borderRadius:20 }}>{tasks.length} tasks</span>
                  {query&&<span style={{ fontSize:11, color:"#6366f1", background:"rgba(99,102,241,0.1)", padding:"2px 8px", borderRadius:20 }}>"{query}" — {filtered.length} results</span>}
                </div>
                {view==="list"
                  ?<ListView tasks={filtered} onTask={t=>{ setActiveTask(t); setShowNotifs(false); }} cycleStatus={cycleStatus} showNew={showNew} setShowNew={setShowNew} newTitle={newTitle} setNewTitle={setNewTitle} addTask={addTask} isMobile={isMobile}/>
                  :<BoardView tasks={filtered} onTask={t=>{ setActiveTask(t); setShowNotifs(false); }} isMobile={isMobile}/>}
              </div>
              {!isMobile&&showDetail&&<TaskDetail task={activeTask} onClose={()=>setActiveTask(null)} updateTask={updateTask} deleteTask={deleteTask} isMobile={false}/>}
            </div>
          )}
          {page==="automations"&&!showNotifs&&<AutomationsPage autos={autos} setAutos={setAutos} isMobile={isMobile}/>}
          {page==="home"&&!showNotifs&&<HomePage data={data} notifs={notifs} isMobile={isMobile} setActiveListId={setActiveListId} setActiveSpaceId={setActiveSpaceId} setPage={setPage} setShowNotifs={setShowNotifs}/>}
          {page==="settings"&&!showNotifs&&<SettingsPage wName={wName} setWName={setWName} isMobile={isMobile}/>}
        </div>
      </div>

      {/* Right panels (desktop) */}
      {!isMobile&&showNotifs&&<NotifPanel notifs={notifs} setNotifs={setNotifs} onClose={()=>setShowNotifs(false)} isMobile={false}/>}

      {/* Mobile overlays */}
      {isMobile&&showDetail&&<TaskDetail task={activeTask} onClose={()=>setActiveTask(null)} updateTask={updateTask} deleteTask={deleteTask} isMobile={true}/>}
      {isMobile&&showNotifs&&<NotifPanel notifs={notifs} setNotifs={setNotifs} onClose={()=>setShowNotifs(false)} isMobile={true}/>}
      {isMobile&&showSpaces&&<SpacesDrawer data={data} setData={setData} activeSpaceId={activeSpaceId} activeListId={activeListId} setActiveSpaceId={setActiveSpaceId} setActiveListId={setActiveListId} setPage={setPage} setShowSpaces={setShowSpaces} setActiveTask={setActiveTask} wName={wName}/>}
      {isMobile&&<BottomNav page={page} setPage={setPage} showNotifs={showNotifs} setShowNotifs={setShowNotifs} setActiveTask={setActiveTask} unread={unread} showSpaces={showSpaces} setShowSpaces={setShowSpaces}/>}
    </div>
  );
}