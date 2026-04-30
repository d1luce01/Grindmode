import { useState, useEffect, useRef } from "react";

const CATEGORIES = {
  fitness: { icon: "⚡", label: "FITNESS", color: "#FF4D00" },
  work: { icon: "🎯", label: "WORK", color: "#00C2FF" },
  habits: { icon: "🔥", label: "HABITS", color: "#FFD600" },
};

const INITIAL_TASKS = [
  { id: 1, text: "Morning workout — 30 min", category: "fitness", xp: 150, streak: 4, completed: false, difficulty: "HARD" },
  { id: 2, text: "Cold shower", category: "habits", xp: 75, streak: 12, completed: true, difficulty: "MEDIUM" },
  { id: 3, text: "Deep work block — 2 hrs", category: "work", xp: 200, streak: 2, completed: false, difficulty: "HARD" },
  { id: 4, text: "No phone before 9am", category: "habits", xp: 100, streak: 7, completed: true, difficulty: "MEDIUM" },
  { id: 5, text: "Read 20 pages", category: "work", xp: 80, streak: 0, completed: false, difficulty: "EASY" },
  { id: 6, text: "Hit daily steps — 10k", category: "fitness", xp: 120, streak: 3, completed: false, difficulty: "MEDIUM" },
];

const LEADERBOARD = [
  { rank: 1, name: "APEX_WOLF", score: 8420, streak: 31, badge: "👑" },
  { rank: 2, name: "IronMike_23", score: 7890, streak: 28, badge: "🔥" },
  { rank: 3, name: "YOU", score: 6240, streak: 12, badge: "⚡", isUser: true },
  { rank: 4, name: "GrindQueen", score: 5980, streak: 19, badge: "💎" },
  { rank: 5, name: "DarkHorse_X", score: 4310, streak: 8, badge: "🎯" },
];

const CHALLENGES = [
  { id: 1, title: "THE IRON WEEK", desc: "Complete all fitness tasks 7 days straight", reward: 500, progress: 4, total: 7, expires: "3d 14h" },
  { id: 2, title: "MONK MODE", desc: "No phone before 9am for 30 days", reward: 1000, progress: 12, total: 30, expires: "18d" },
  { id: 3, title: "OUTPUT MACHINE", desc: "Log 10 deep work blocks this month", reward: 750, progress: 3, total: 10, expires: "22d" },
];

const XP_MAX = 10000;
const USER_XP = 6240;
const USER_LEVEL = 14;

function XPBar({ xp, max, level }) {
  const pct = (xp / max) * 100;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase" }}>XP Progress</span>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, letterSpacing: 2, color: "#FF4D00" }}>{xp.toLocaleString()} / {max.toLocaleString()}</span>
      </div>
      <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, #FF4D00, #FFD600)",
          borderRadius: 3,
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 0 12px rgba(255,77,0,0.6)"
        }} />
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle }) {
  const [animating, setAnimating] = useState(false);
  const cat = CATEGORIES[task.category];

  const handleToggle = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    onToggle(task.id);
  };

  return (
    <div
      onClick={handleToggle}
      style={{
        background: task.completed ? "rgba(255,77,0,0.04)" : "#111",
        border: task.completed ? "1px solid rgba(255,77,0,0.3)" : "1px solid #222",
        borderRadius: 4,
        padding: "14px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.25s ease",
        transform: animating ? "scale(0.98)" : "scale(1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {task.completed && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: "linear-gradient(180deg, #FF4D00, #FFD600)"
        }} />
      )}

      {/* Checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: 3,
        border: task.completed ? "none" : "2px solid #333",
        background: task.completed ? "linear-gradient(135deg, #FF4D00, #FFD600)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.25s ease",
        boxShadow: task.completed ? "0 0 10px rgba(255,77,0,0.4)" : "none"
      }}>
        {task.completed && <span style={{ fontSize: 12, color: "#000" }}>✓</span>}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 15, letterSpacing: 1,
          color: task.completed ? "#666" : "#e8e8e8",
          textDecoration: task.completed ? "line-through" : "none",
          marginBottom: 4,
          textTransform: "uppercase"
        }}>
          {task.text}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 10, letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif",
            color: cat.color, textTransform: "uppercase"
          }}>{cat.icon} {cat.label}</span>
          {task.streak > 0 && (
            <span style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>🔥 {task.streak}d streak</span>
          )}
          <span style={{
            fontSize: 10, letterSpacing: 2, fontFamily: "'Barlow Condensed', sans-serif",
            color: task.difficulty === "HARD" ? "#FF4D00" : task.difficulty === "MEDIUM" ? "#FFD600" : "#888",
            marginLeft: "auto"
          }}>{task.difficulty}</span>
        </div>
      </div>

      {/* XP Badge */}
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 13, letterSpacing: 2, fontWeight: 700,
        color: task.completed ? "#444" : "#FF4D00",
        textAlign: "right", minWidth: 52
      }}>
        +{task.xp}
        <div style={{ fontSize: 9, letterSpacing: 3, color: "#555", marginTop: 1 }}>XP</div>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, index }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 16px",
      background: entry.isUser ? "rgba(255,77,0,0.07)" : "transparent",
      border: entry.isUser ? "1px solid rgba(255,77,0,0.25)" : "1px solid transparent",
      borderRadius: 4,
      marginBottom: 4,
      transition: "all 0.2s ease",
      animation: `fadeSlide 0.4s ease ${index * 0.06}s both`
    }}>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: entry.rank <= 3 ? 18 : 14, fontWeight: 700,
        color: entry.rank === 1 ? "#FFD600" : entry.rank === 2 ? "#aaa" : entry.rank === 3 ? "#CD7F32" : "#555",
        minWidth: 28, textAlign: "center"
      }}>
        {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank-1] : `#${entry.rank}`}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14, letterSpacing: 2,
          color: entry.isUser ? "#FF4D00" : "#ccc",
          textTransform: "uppercase"
        }}>{entry.badge} {entry.name} {entry.isUser && <span style={{ fontSize: 10, color: "#666" }}>— YOU</span>}</div>
        <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, marginTop: 2 }}>🔥 {entry.streak} day streak</div>
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 16, fontWeight: 700, letterSpacing: 1,
        color: entry.isUser ? "#FF4D00" : "#777"
      }}>
        {entry.score.toLocaleString()}
        <span style={{ fontSize: 9, letterSpacing: 3, color: "#555", marginLeft: 3 }}>PTS</span>
      </div>
    </div>
  );
}

function ChallengeCard({ c, index }) {
  const pct = (c.progress / c.total) * 100;
  return (
    <div style={{
      background: "#0d0d0d",
      border: "1px solid #1e1e1e",
      borderRadius: 4,
      padding: "18px 20px",
      marginBottom: 10,
      animation: `fadeSlide 0.4s ease ${index * 0.08}s both`
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16, letterSpacing: 3, fontWeight: 700,
            color: "#e8e8e8", textTransform: "uppercase"
          }}>{c.title}</div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 3, letterSpacing: 0.5 }}>{c.desc}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 18, fontWeight: 700, color: "#FFD600", letterSpacing: 1
          }}>+{c.reward}</div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#555" }}>XP REWARD</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <div style={{ flex: 1, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "linear-gradient(90deg, #FF4D00, #FFD600)",
            borderRadius: 2, transition: "width 1s ease",
            boxShadow: "0 0 8px rgba(255,77,0,0.5)"
          }} />
        </div>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 11, letterSpacing: 2, color: "#FF4D00"
        }}>{c.progress}/{c.total}</span>
        <span style={{ fontSize: 10, color: "#444", letterSpacing: 1 }}>⏱ {c.expires}</span>
      </div>
    </div>
  );
}

export default function GrindMode() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [tab, setTab] = useState("today");
  const [filter, setFilter] = useState("all");
  const [xpPop, setXpPop] = useState(null);
  const [totalXP, setTotalXP] = useState(USER_XP);
  const popRef = useRef(null);

  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task.completed) {
      setTotalXP(prev => prev + task.xp);
      setXpPop({ xp: task.xp, id: Date.now() });
      setTimeout(() => setXpPop(null), 1800);
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completedToday = tasks.filter(t => t.completed).length;
  const totalToday = tasks.length;
  const todayPct = Math.round((completedToday / totalToday) * 100);

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.category === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --orange: #FF4D00;
          --yellow: #FFD600;
          --blue: #00C2FF;
          --bg: #080808;
          --surface: #111;
        }

        body {
          background: var(--bg);
          color: #e0e0e0;
          font-family: 'Barlow', sans-serif;
          min-height: 100vh;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes popUp {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          20% { opacity: 1; transform: translateY(-20px) scale(1.1); }
          80% { opacity: 1; transform: translateY(-35px) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(0.9); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .tab-btn {
          fontFamily: 'Barlow Condensed', sans-serif;
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px 0;
          font-size: 12px;
          letter-spacing: 3px;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }

        .filter-btn {
          background: none;
          border: 1px solid #222;
          border-radius: 3px;
          cursor: pointer;
          padding: 5px 12px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Barlow Condensed', sans-serif;
          transition: all 0.2s ease;
          color: #666;
        }

        .filter-btn:hover { border-color: #444; color: #aaa; }

        .filter-btn.active {
          border-color: var(--orange);
          color: var(--orange);
          background: rgba(255,77,0,0.08);
        }

        .scanline {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          z-index: 1000;
        }
      `}</style>

      <div className="scanline" />

      {/* XP Pop */}
      {xpPop && (
        <div style={{
          position: "fixed", top: "30%", left: "50%", transform: "translateX(-50%)",
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 32, fontWeight: 900, letterSpacing: 4,
          color: "#FFD600",
          textShadow: "0 0 30px rgba(255,214,0,0.8)",
          animation: "popUp 1.8s ease forwards",
          zIndex: 999, pointerEvents: "none",
          textTransform: "uppercase"
        }}>
          +{xpPop.xp} XP
        </div>
      )}

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 80px 0" }}>

        {/* Header */}
        <div style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid #151515",
          position: "sticky", top: 0,
          background: "rgba(8,8,8,0.97)",
          backdropFilter: "blur(20px)",
          zIndex: 100
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, letterSpacing: 5, color: "#FF4D00",
                textTransform: "uppercase", marginBottom: 4
              }}>⚡ GRIND MODE</div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 28, fontWeight: 900, letterSpacing: 2,
                color: "#fff", lineHeight: 1
              }}>LVL {USER_LEVEL} <span style={{ color: "#333" }}>—</span> <span style={{ color: "#FF4D00" }}>IRON</span></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 32, fontWeight: 900, letterSpacing: 1,
                color: "#fff", lineHeight: 1
              }}>{todayPct}<span style={{ fontSize: 16, color: "#555" }}>%</span></div>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase" }}>{completedToday}/{totalToday} done</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <XPBar xp={totalXP} max={XP_MAX} level={USER_LEVEL} />
          </div>
        </div>

        {/* Daily Ticker */}
        <div style={{
          padding: "12px 24px",
          background: "#0a0a0a",
          borderBottom: "1px solid #151515",
          display: "flex", gap: 20, overflowX: "auto"
        }}>
          {[
            { label: "STREAK", value: "12d", icon: "🔥" },
            { label: "THIS WEEK", value: "2,140", sub: "XP" },
            { label: "RANK", value: "#3", icon: "⚡" },
            { label: "TO NEXT LVL", value: "3,760", sub: "XP" },
          ].map(stat => (
            <div key={stat.label} style={{ flexShrink: 0 }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 18, fontWeight: 700, letterSpacing: 1, color: "#e0e0e0", lineHeight: 1
              }}>{stat.icon || ""}{stat.value} <span style={{ fontSize: 10, color: "#555" }}>{stat.sub || ""}</span></div>
              <div style={{ fontSize: 9, letterSpacing: 3, color: "#444", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Nav Tabs */}
        <div style={{
          display: "flex", gap: 0,
          padding: "0 24px",
          borderBottom: "1px solid #151515"
        }}>
          {[
            { key: "today", label: "TODAY" },
            { key: "leaderboard", label: "RANKS" },
            { key: "challenges", label: "MISSIONS" },
          ].map(t => (
            <button
              key={t.key}
              className="tab-btn"
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                color: tab === t.key ? "#FF4D00" : "#444",
                borderBottom: tab === t.key ? "2px solid #FF4D00" : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 24px" }}>

          {/* TODAY TAB */}
          {tab === "today" && (
            <div style={{ animation: "fadeSlide 0.3s ease" }}>
              {/* Filter buttons */}
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                {[
                  { key: "all", label: "ALL" },
                  { key: "fitness", label: "FITNESS" },
                  { key: "work", label: "WORK" },
                  { key: "habits", label: "HABITS" },
                ].map(f => (
                  <button
                    key={f.key}
                    className={`filter-btn ${filter === f.key ? "active" : ""}`}
                    onClick={() => setFilter(f.key)}
                  >{f.label}</button>
                ))}
              </div>

              {/* Category headers */}
              {filter === "all" ? (
                Object.entries(CATEGORIES).map(([catKey, cat]) => {
                  const catTasks = tasks.filter(t => t.category === catKey);
                  const done = catTasks.filter(t => t.completed).length;
                  return (
                    <div key={catKey} style={{ marginBottom: 24 }}>
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        marginBottom: 10
                      }}>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 11, letterSpacing: 4, color: cat.color, textTransform: "uppercase"
                        }}>{cat.icon} {cat.label}</div>
                        <div style={{ fontSize: 10, color: "#444", letterSpacing: 2 }}>{done}/{catTasks.length}</div>
                      </div>
                      {catTasks.map(task => (
                        <div key={task.id} style={{ marginBottom: 6 }}>
                          <TaskCard task={task} onToggle={toggleTask} />
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                filtered.map(task => (
                  <div key={task.id} style={{ marginBottom: 6 }}>
                    <TaskCard task={task} onToggle={toggleTask} />
                  </div>
                ))
              )}

              {/* Add task CTA */}
              <button style={{
                width: "100%", padding: "14px",
                background: "transparent",
                border: "1px dashed #222", borderRadius: 4,
                color: "#444", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 12, letterSpacing: 3, textTransform: "uppercase",
                marginTop: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#FF4D00"; e.target.style.color = "#FF4D00"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#222"; e.target.style.color = "#444"; }}
              >
                + Add Task
              </button>
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {tab === "leaderboard" && (
            <div style={{ animation: "fadeSlide 0.3s ease" }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, letterSpacing: 4, color: "#555",
                textTransform: "uppercase", marginBottom: 16
              }}>🌐 Global — This Week</div>

              {LEADERBOARD.map((entry, i) => (
                <LeaderboardRow key={entry.rank} entry={entry} index={i} />
              ))}

              <div style={{
                marginTop: 20, padding: "16px",
                background: "rgba(255,77,0,0.05)",
                border: "1px solid rgba(255,77,0,0.15)",
                borderRadius: 4
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 13, letterSpacing: 2, color: "#FF4D00", marginBottom: 6
                }}>⚡ 260 PTS TO #2</div>
                <div style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>
                  Complete today's remaining tasks to close the gap. IronMike_23 hasn't logged a workout today.
                </div>
              </div>
            </div>
          )}

          {/* CHALLENGES TAB */}
          {tab === "challenges" && (
            <div style={{ animation: "fadeSlide 0.3s ease" }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 11, letterSpacing: 4, color: "#555",
                textTransform: "uppercase", marginBottom: 16
              }}>🎯 Active Missions</div>

              {CHALLENGES.map((c, i) => (
                <ChallengeCard key={c.id} c={c} index={i} />
              ))}

              <div style={{
                padding: "16px",
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                borderRadius: 4, marginTop: 8
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 11, letterSpacing: 3, color: "#444",
                  textTransform: "uppercase", marginBottom: 8
                }}>Coming Soon</div>
                <div style={{ fontSize: 11, color: "#333" }}>
                  New missions unlock every Monday. Compete globally or create private challenges with friends.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}