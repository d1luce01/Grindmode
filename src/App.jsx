import { useState, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://fnieoceytooqadgxgfgl.supabase.co",
  "sb_publishable_0nhf8tnHDwsFKVLYo_8INQ_cfPai586"
);

const CATEGORIES = {
  fitness: { icon: "⚡", label: "FITNESS", color: "#FF4D00" },
  work: { icon: "🎯", label: "WORK", color: "#00C2FF" },
  habits: { icon: "🔥", label: "HABITS", color: "#FFD600" },
};

const DIFFICULTY_XP = { EASY: 50, MEDIUM: 100, HARD: 200 };

const DEFAULT_TASKS = [
  { id: 1, text: "Morning workout — 30 min", category: "fitness", xp: 150, streak: 0, completed: false, difficulty: "HARD" },
  { id: 2, text: "Cold shower", category: "habits", xp: 75, streak: 0, completed: false, difficulty: "MEDIUM" },
  { id: 3, text: "Deep work block — 2 hrs", category: "work", xp: 200, streak: 0, completed: false, difficulty: "HARD" },
  { id: 4, text: "No phone before 9am", category: "habits", xp: 100, streak: 0, completed: false, difficulty: "MEDIUM" },
  { id: 5, text: "Read 20 pages", category: "work", xp: 80, streak: 0, completed: false, difficulty: "EASY" },
  { id: 6, text: "Hit daily steps — 10k", category: "fitness", xp: 120, streak: 0, completed: false, difficulty: "MEDIUM" },
];

const CHALLENGES = [
  { id: 1, title: "THE IRON WEEK", desc: "Complete all fitness tasks 7 days straight", reward: 500, progress: 4, total: 7, expires: "3d 14h" },
  { id: 2, title: "MONK MODE", desc: "No phone before 9am for 30 days", reward: 1000, progress: 0, total: 30, expires: "18d" },
  { id: 3, title: "OUTPUT MACHINE", desc: "Log 10 deep work blocks this month", reward: 750, progress: 0, total: 10, expires: "22d" },
];

const LEVEL_NAMES = ["ROOKIE","GRINDER","IRON","STEEL","BRONZE","SILVER","GOLD","PLATINUM","DIAMOND","APEX"];

function getLevel(xp) { return Math.min(Math.floor(xp / 1000) + 1, 99); }
function getLevelName(xp) { return LEVEL_NAMES[Math.min(Math.floor(xp / 2000), LEVEL_NAMES.length - 1)]; }

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    width: "100%", padding: "14px 16px",
    background: "#111", border: "1px solid #222", borderRadius: 4,
    color: "#e0e0e0", fontSize: 14, fontFamily: "'Barlow', sans-serif",
    outline: "none", marginBottom: 10,
  };

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        if (!username.trim()) { setError("Username required"); setLoading(false); return; }
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: username.trim().toUpperCase().replace(/\s+/g, "_"),
            xp: 0, streak: 0,
          });
          onAuth(data.user);
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onAuth(data.user);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#080808", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px", margin:0 }}>
      <div style={{ marginBottom:40, textAlign:"center" }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:5, color:"#FF4D00", marginBottom:8 }}>⚡ WELCOME TO</div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:48, fontWeight:900, letterSpacing:4, color:"#fff", lineHeight:1 }}>GRIND<span style={{ color:"#FF4D00" }}>MODE</span></div>
        <div style={{ fontSize:12, color:"#444", marginTop:8, letterSpacing:1 }}>YOUR LIFE IS THE GAME</div>
      </div>
      <div style={{ width:"100%", maxWidth:360 }}>
        <div style={{ display:"flex", background:"#111", borderRadius:4, border:"1px solid #222", marginBottom:20, overflow:"hidden" }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"12px", background:mode===m?"#FF4D00":"transparent", border:"none", cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, letterSpacing:3, color:mode===m?"#000":"#555", textTransform:"uppercase", transition:"all 0.2s ease" }}>
              {m === "login" ? "LOG IN" : "SIGN UP"}
            </button>
          ))}
        </div>
        {mode === "signup" && <input style={inputStyle} placeholder="USERNAME" value={username} onChange={e => setUsername(e.target.value)} />}
        <input style={inputStyle} placeholder="EMAIL" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={inputStyle} placeholder="PASSWORD" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div style={{ color:"#FF4D00", fontSize:12, marginBottom:10, letterSpacing:1 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", padding:"16px", background:loading?"#333":"linear-gradient(90deg,#FF4D00,#FFD600)", border:"none", borderRadius:4, cursor:loading?"not-allowed":"pointer", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, letterSpacing:4, fontWeight:700, color:"#000", textTransform:"uppercase", marginTop:4, boxShadow:loading?"none":"0 0 20px rgba(255,77,0,0.4)" }}>
          {loading ? "..." : mode === "login" ? "ENTER THE GRIND" : "CREATE ACCOUNT"}
        </button>
      </div>
    </div>
  );
}

function XPBar({ xp }) {
  const level = getLevel(xp);
  const levelXP = (level - 1) * 1000;
  const nextXP = level * 1000;
  const pct = ((xp - levelXP) / (nextXP - levelXP)) * 100;
  return (
    <div style={{ width:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:3, color:"#888" }}>XP PROGRESS</span>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:2, color:"#FF4D00" }}>{xp.toLocaleString()} / {nextXP.toLocaleString()}</span>
      </div>
      <div style={{ height:6, background:"#1a1a1a", borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#FF4D00,#FFD600)", borderRadius:3, transition:"width 0.8s cubic-bezier(0.4,0,0.2,1)", boxShadow:"0 0 12px rgba(255,77,0,0.6)" }} />
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete }) {
  const [animating, setAnimating] = useState(false);
  const cat = CATEGORIES[task.category];
  const handleToggle = () => { setAnimating(true); setTimeout(() => setAnimating(false), 400); onToggle(task.id); };
  return (
    <div style={{ position:"relative", marginBottom:6 }}>
      <div onClick={handleToggle} style={{ background:task.completed?"rgba(255,77,0,0.04)":"#111", border:task.completed?"1px solid rgba(255,77,0,0.3)":"1px solid #222", borderRadius:4, padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, transition:"all 0.25s ease", transform:animating?"scale(0.98)":"scale(1)", position:"relative", overflow:"hidden" }}>
        {task.completed && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"linear-gradient(180deg,#FF4D00,#FFD600)" }} />}
        <div style={{ width:22, height:22, borderRadius:3, border:task.completed?"none":"2px solid #333", background:task.completed?"linear-gradient(135deg,#FF4D00,#FFD600)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.25s ease", boxShadow:task.completed?"0 0 10px rgba(255,77,0,0.4)":"none" }}>
          {task.completed && <span style={{ fontSize:12, color:"#000" }}>✓</span>}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, letterSpacing:1, color:task.completed?"#666":"#e8e8e8", textDecoration:task.completed?"line-through":"none", marginBottom:4, textTransform:"uppercase" }}>{task.text}</div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:10, letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif", color:cat.color, textTransform:"uppercase" }}>{cat.icon} {cat.label}</span>
            <span style={{ fontSize:10, letterSpacing:2, fontFamily:"'Barlow Condensed',sans-serif", color:task.difficulty==="HARD"?"#FF4D00":task.difficulty==="MEDIUM"?"#FFD600":"#888", marginLeft:"auto" }}>{task.difficulty}</span>
          </div>
        </div>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, letterSpacing:2, fontWeight:700, color:task.completed?"#444":"#FF4D00", textAlign:"right", minWidth:52 }}>
          +{task.xp}<div style={{ fontSize:9, letterSpacing:3, color:"#555", marginTop:1 }}>XP</div>
        </div>
      </div>
      {task.custom && (
        <button onClick={() => onDelete(task.id)} style={{ position:"absolute", top:8, right:8, background:"none", border:"none", color:"#333", cursor:"pointer", fontSize:14, lineHeight:1, padding:4 }}>✕</button>
      )}
    </div>
  );
}

function AddTaskModal({ onAdd, onClose }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("habits");
  const [difficulty, setDifficulty] = useState("MEDIUM");

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd({
      id: Date.now(),
      text: text.trim(),
      category,
      difficulty,
      xp: DIFFICULTY_XP[difficulty],
      streak: 0,
      completed: false,
      custom: true,
    });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:500, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:"100%", background:"#111", borderRadius:"12px 12px 0 0", padding:"28px 24px 48px", border:"1px solid #222" }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, letterSpacing:4, color:"#FF4D00", marginBottom:20 }}>+ NEW TASK</div>

        <input
          placeholder="TASK NAME"
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
          style={{ width:"100%", padding:"14px 16px", background:"#0d0d0d", border:"1px solid #333", borderRadius:4, color:"#e0e0e0", fontSize:14, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1, outline:"none", marginBottom:16, textTransform:"uppercase" }}
        />

        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:3, color:"#555", marginBottom:10 }}>CATEGORY</div>
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button key={key} onClick={() => setCategory(key)} style={{ flex:1, padding:"10px 6px", background:category===key?"rgba(255,77,0,0.1)":"transparent", border:category===key?`1px solid ${cat.color}`:"1px solid #222", borderRadius:4, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:2, color:category===key?cat.color:"#555", textTransform:"uppercase" }}>
              {cat.icon}<br/>{cat.label}
            </button>
          ))}
        </div>

        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:3, color:"#555", marginBottom:10 }}>DIFFICULTY</div>
        <div style={{ display:"flex", gap:8, marginBottom:24 }}>
          {["EASY","MEDIUM","HARD"].map(d => (
            <button key={d} onClick={() => setDifficulty(d)} style={{ flex:1, padding:"10px 6px", background:difficulty===d?"rgba(255,77,0,0.1)":"transparent", border:difficulty===d?"1px solid #FF4D00":"1px solid #222", borderRadius:4, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:2, color:difficulty===d?"#FF4D00":"#555", textTransform:"uppercase" }}>
              {d}<br/><span style={{ fontSize:9, color:difficulty===d?"#FFD600":"#444" }}>+{DIFFICULTY_XP[d]} XP</span>
            </button>
          ))}
        </div>

        <button onClick={handleAdd} style={{ width:"100%", padding:"16px", background:"linear-gradient(90deg,#FF4D00,#FFD600)", border:"none", borderRadius:4, cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, letterSpacing:4, fontWeight:700, color:"#000", textTransform:"uppercase", boxShadow:"0 0 20px rgba(255,77,0,0.4)" }}>
          ADD TASK
        </button>
      </div>
    </div>
  );
}
export default function GrindMode() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [tab, setTab] = useState("today");
  const [filter, setFilter] = useState("all");
  const [xpPop, setXpPop] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
    });
    supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      else { setUser(null); setProfile(null); }
    });
  }, []);

  const loadProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setProfile(data);
  };

  const loadLeaderboard = async () => {
    setLoadingBoard(true);
    const { data } = await supabase.from("profiles").select("username,xp,streak").order("xp", { ascending:false }).limit(10);
    if (data) setLeaderboard(data);
    setLoadingBoard(false);
  };

  useEffect(() => { if (tab === "leaderboard") loadLeaderboard(); }, [tab]);

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    const wasCompleted = task.completed;
    const xpDelta = wasCompleted ? -task.xp : task.xp;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    if (!wasCompleted) { setXpPop({ xp:task.xp, id:Date.now() }); setTimeout(() => setXpPop(null), 1800); }
    if (user && profile) {
      const newXP = Math.max(0, (profile.xp || 0) + xpDelta);
      setProfile(p => ({ ...p, xp:newXP }));
      await supabase.from("profiles").update({ xp:newXP }).eq("id", user.id);
    }
  };

  const addTask = (task) => setTasks(prev => [...prev, task]);
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));
  const handleSignOut = async () => { await supabase.auth.signOut(); setTasks(DEFAULT_TASKS); };

  if (!user) return <AuthScreen onAuth={(u) => { setUser(u); loadProfile(u.id); }} />;

  const completedToday = tasks.filter(t => t.completed).length;
  const totalToday = tasks.length;
  const todayPct = Math.round((completedToday / totalToday) * 100);
  const userXP = profile?.xp || 0;
  const userLevel = getLevel(userXP);
  const levelName = getLevelName(userXP);
  const filtered = filter === "all" ? tasks : tasks.filter(t => t.category === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500&display=swap');
        html, body { margin:0; padding:0; background:#080808; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { color:#e0e0e0; font-family:'Barlow',sans-serif; min-height:100vh; }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes popUp { 0%{opacity:0;transform:translateY(0) scale(0.8)}20%{opacity:1;transform:translateY(-20px) scale(1.1)}80%{opacity:1;transform:translateY(-35px) scale(1)}100%{opacity:0;transform:translateY(-50px) scale(0.9)} }
        .tab-btn{background:none;border:none;cursor:pointer;padding:10px 0;font-size:12px;letter-spacing:3px;text-transform:uppercase;transition:color 0.2s ease;font-family:'Barlow Condensed',sans-serif;}
        .filter-btn{background:none;border:1px solid #222;border-radius:3px;cursor:pointer;padding:5px 12px;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:'Barlow Condensed',sans-serif;transition:all 0.2s ease;color:#666;}
        .filter-btn.active{border-color:#FF4D00;color:#FF4D00;background:rgba(255,77,0,0.08);}
        .scanline{position:fixed;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);pointer-events:none;z-index:1000;}
        input::placeholder{color:#444;}
      `}</style>
      <div className="scanline" />
      {showAddTask && <AddTaskModal onAdd={addTask} onClose={() => setShowAddTask(false)} />}
      {xpPop && <div style={{ position:"fixed",top:"30%",left:"50%",transform:"translateX(-50%)",fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:900,letterSpacing:4,color:"#FFD600",textShadow:"0 0 30px rgba(255,214,0,0.8)",animation:"popUp 1.8s ease forwards",zIndex:999,pointerEvents:"none" }}>+{xpPop.xp} XP</div>}

      <div style={{ maxWidth:480, margin:"0 auto", paddingBottom:80 }}>
        <div style={{ padding:"28px 24px 20px", borderBottom:"1px solid #151515", position:"sticky", top:0, background:"rgba(8,8,8,0.97)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:5, color:"#FF4D00", marginBottom:4 }}>⚡ GRIND MODE</div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:900, letterSpacing:2, color:"#fff", lineHeight:1 }}>LVL {userLevel} <span style={{ color:"#333" }}>—</span> <span style={{ color:"#FF4D00" }}>{levelName}</span></div>
              <div style={{ fontSize:10, color:"#555", letterSpacing:2, marginTop:3 }}>{profile?.username || "PLAYER"}</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:32, fontWeight:900, color:"#fff", lineHeight:1 }}>{todayPct}<span style={{ fontSize:16, color:"#555" }}>%</span></div>
                <div style={{ fontSize:10, letterSpacing:3, color:"#555" }}>{completedToday}/{totalToday} DONE</div>
              </div>
              <button onClick={handleSignOut} style={{ background:"none", border:"1px solid #222", borderRadius:3, color:"#444", cursor:"pointer", fontSize:9, letterSpacing:2, padding:"3px 8px", fontFamily:"'Barlow Condensed',sans-serif" }}>SIGN OUT</button>
            </div>
          </div>
          <div style={{ marginTop:16 }}><XPBar xp={userXP} /></div>
        </div>

        <div style={{ padding:"12px 24px", background:"#0a0a0a", borderBottom:"1px solid #151515", display:"flex", gap:20, overflowX:"auto" }}>
          {[{label:"STREAK",value:`${profile?.streak||0}d`,icon:"🔥"},{label:"TOTAL XP",value:userXP.toLocaleString()},{label:"LEVEL",value:userLevel},{label:"TODAY",value:`${completedToday}/${totalToday}`}].map(s => (
            <div key={s.label} style={{ flexShrink:0 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:700, letterSpacing:1, color:"#e0e0e0", lineHeight:1 }}>{s.icon||""}{s.value}</div>
              <div style={{ fontSize:9, letterSpacing:3, color:"#444", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", padding:"0 24px", borderBottom:"1px solid #151515" }}>
          {[{key:"today",label:"TODAY"},{key:"leaderboard",label:"RANKS"},{key:"challenges",label:"MISSIONS"}].map(t => (
            <button key={t.key} className="tab-btn" onClick={() => setTab(t.key)} style={{ flex:1, color:tab===t.key?"#FF4D00":"#444", borderBottom:tab===t.key?"2px solid #FF4D00":"2px solid transparent" }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding:"20px 24px" }}>
          {tab === "today" && (
            <div style={{ animation:"fadeSlide 0.3s ease" }}>
              <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                {[{key:"all",label:"ALL"},{key:"fitness",label:"FITNESS"},{key:"work",label:"WORK"},{key:"habits",label:"HABITS"}].map(f => (
                  <button key={f.key} className={`filter-btn ${filter===f.key?"active":""}`} onClick={() => setFilter(f.key)}>{f.label}</button>
                ))}
              </div>
              {filter === "all" ? Object.entries(CATEGORIES).map(([catKey,cat]) => {
                const catTasks = tasks.filter(t => t.category===catKey);
                const done = catTasks.filter(t => t.completed).length;
                return (
                  <div key={catKey} style={{ marginBottom:24 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:4, color:cat.color }}>{cat.icon} {cat.label}</div>
                      <div style={{ fontSize:10, color:"#444", letterSpacing:2 }}>{done}/{catTasks.length}</div>
                    </div>
                    {catTasks.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}
                  </div>
                );
              }) : filtered.map(task => <TaskCard key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}

              <button
                onClick={() => setShowAddTask(true)}
                style={{ width:"100%", padding:"14px", background:"transparent", border:"1px dashed #222", borderRadius:4, color:"#444", cursor:"pointer", fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, letterSpacing:3, textTransform:"uppercase", marginTop:8, transition:"all 0.2s ease" }}
                onMouseEnter={e => { e.target.style.borderColor="#FF4D00"; e.target.style.color="#FF4D00"; }}
                onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#444"; }}
              >+ ADD TASK</button>
            </div>
          )}

          {tab === "leaderboard" && (
            <div style={{ animation:"fadeSlide 0.3s ease" }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:4, color:"#555", marginBottom:16 }}>🌐 GLOBAL RANKINGS</div>
              {loadingBoard ? (
                <div style={{ color:"#444", textAlign:"center", padding:40, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:3 }}>LOADING...</div>
              ) : leaderboard.length === 0 ? (
                <div style={{ color:"#444", textAlign:"center", padding:40, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:2, fontSize:13 }}>NO PLAYERS YET<br/><span style={{ fontSize:10, color:"#333" }}>BE THE FIRST TO RANK</span></div>
              ) : leaderboard.map((entry, i) => {
                const isMe = entry.username === profile?.username;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", marginBottom:4, background:isMe?"rgba(255,77,0,0.07)":"transparent", border:isMe?"1px solid rgba(255,77,0,0.25)":"1px solid transparent", borderRadius:4 }}>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:i<3?18:14, fontWeight:700, color:i===0?"#FFD600":i===1?"#aaa":i===2?"#CD7F32":"#555", minWidth:28, textAlign:"center" }}>
                      {i<3?["🥇","🥈","🥉"][i]:`#${i+1}`}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, letterSpacing:2, color:isMe?"#FF4D00":"#ccc" }}>{entry.username}{isMe&&<span style={{ fontSize:10, color:"#666" }}> — YOU</span>}</div>
                      <div style={{ fontSize:10, color:"#555", letterSpacing:1, marginTop:2 }}>🔥 {entry.streak||0}d streak</div>
                    </div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:700, color:isMe?"#FF4D00":"#777" }}>{(entry.xp||0).toLocaleString()}<span style={{ fontSize:9, color:"#555", marginLeft:3 }}>XP</span></div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "challenges" && (
            <div style={{ animation:"fadeSlide 0.3s ease" }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:4, color:"#555", marginBottom:16 }}>🎯 ACTIVE MISSIONS</div>
              {CHALLENGES.map((c) => {
                const pct = (c.progress/c.total)*100;
                return (
                  <div key={c.id} style={{ background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:4, padding:"18px 20px", marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div>
                        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, letterSpacing:3, fontWeight:700, color:"#e8e8e8" }}>{c.title}</div>
                        <div style={{ fontSize:11, color:"#666", marginTop:3 }}>{c.desc}</div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0, marginLeft:16 }}>
                        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:18, fontWeight:700, color:"#FFD600" }}>+{c.reward}</div>
                        <div style={{ fontSize:9, letterSpacing:3, color:"#555" }}>XP</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12 }}>
                      <div style={{ flex:1, height:4, background:"#1a1a1a", borderRadius:2, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#FF4D00,#FFD600)", borderRadius:2 }} />
                      </div>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:2, color:"#FF4D00" }}>{c.progress}/{c.total}</span>
                      <span style={{ fontSize:10, color:"#444" }}>⏱ {c.expires}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
