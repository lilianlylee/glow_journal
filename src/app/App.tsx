import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Mail, Calendar, ListChecks, Plus, X, ChevronLeft, ChevronRight,
  Send, Clock, Sparkles, Check, Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "letters" | "calendar" | "bucketlist";

type Letter = {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  deliveryDate: string;
  createdAt: string;
};

type Mood = "great" | "good" | "okay" | "meh" | "rough";

type LogEntry = {
  date: string;
  content: string;
  mood: Mood;
};

type BucketItem = {
  id: string;
  text: string;
  done: boolean;
  completedDate?: string;
};

type BucketCategory = {
  id: string;
  name: string;
  emoji: string;
  items: BucketItem[];
};

type FutureEvent = {
  id: string;
  date: string;
  title: string;
  note: string;
  isCelebration: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const MOOD_META: Record<Mood, { emoji: string; label: string }> = {
  great: { emoji: "🌸", label: "Glowing" },
  good:  { emoji: "✨", label: "Good vibes" },
  okay:  { emoji: "🌙", label: "Okay day" },
  meh:   { emoji: "🌧️", label: "Meh" },
  rough: { emoji: "🌿", label: "Tough one" },
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const DEFAULT_CATEGORIES: BucketCategory[] = [
  {
    id: "cat-movies", name: "Movies", emoji: "🎬",
    items: [
      { id: "m1", text: "Watch Pride & Prejudice", done: true },
      { id: "m2", text: "See a film at a cinema alone", done: false },
      { id: "m3", text: "Host a movie marathon night", done: false },
    ],
  },
  {
    id: "cat-summer", name: "Summer", emoji: "☀️",
    items: [
      { id: "s1", text: "Read on the beach", done: false },
      { id: "s2", text: "Make homemade lemonade", done: false },
      { id: "s3", text: "Watch a sunset somewhere new", done: true },
    ],
  },
  {
    id: "cat-travel", name: "Travel", emoji: "✈️",
    items: [
      { id: "t1", text: "Visit Paris", done: false },
      { id: "t2", text: "Take a solo trip", done: false },
      { id: "t3", text: "Try street food in a new city", done: false },
    ],
  },
  {
    id: "cat-glowup", name: "Glow Up", emoji: "💆‍♀️",
    items: [
      { id: "g1", text: "Start a skincare routine", done: true },
      { id: "g2", text: "Learn a new hairstyle", done: false },
      { id: "g3", text: "Take a pilates class", done: false },
    ],
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

// ─── Letters Tab ──────────────────────────────────────────────────────────────

function LettersTab() {
  const [letters, setLetters] = useLocalStorage<Letter[]>("gj-letters", []);
  const [composing, setComposing] = useState(false);
  const [viewing, setViewing] = useState<Letter | null>(null);
  const [form, setForm] = useState({ toEmail: "", subject: "", body: "", deliveryDate: "" });

  const today = new Date().toISOString().split("T")[0];

  function submit() {
    if (!form.toEmail || !form.subject || !form.body || !form.deliveryDate) return;
    const letter: Letter = {
      id: uid(),
      toEmail: form.toEmail,
      subject: form.subject,
      body: form.body,
      deliveryDate: form.deliveryDate,
      createdAt: today,
    };
    setLetters([letter, ...letters]);
    setForm({ toEmail: "", subject: "", body: "", deliveryDate: "" });
    setComposing(false);
  }

  function deleteLetter(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setLetters(letters.filter((l) => l.id !== id));
    if (viewing?.id === id) setViewing(null);
  }

  const isReady = (date: string) => date <= today;

  if (viewing) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setViewing(null)}
          className="flex items-center gap-1.5 text-pink-400 hover:text-pink-600 mb-6 text-sm font-medium transition-colors"
        >
          <ChevronLeft size={15} /> Back to letters
        </button>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100/80">
          <div className="flex items-center gap-2 text-[11px] text-pink-300 mb-5 uppercase tracking-widest">
            <Mail size={11} /> Delivered {viewing.deliveryDate}
          </div>
          <h2 className="font-['Playfair_Display'] text-2xl text-rose-800 mb-2">{viewing.subject}</h2>
          <p className="text-xs text-pink-300 mb-7">
            Written {viewing.createdAt} · To {viewing.toEmail}
          </p>
          <p className="text-rose-700 leading-[1.85] whitespace-pre-wrap text-sm">{viewing.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Playfair_Display'] text-2xl text-rose-800">Letters to Future Me</h2>
          <p className="text-sm text-pink-400 mt-1">Sealed with love, opened when the time is right ✉️</p>
        </div>
        {!composing && (
          <button
            onClick={() => setComposing(true)}
            className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={15} /> Write a letter
          </button>
        )}
      </div>

      {composing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-7 shadow-sm border border-pink-100 space-y-4"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-rose-700 font-medium text-sm">New letter</span>
            <button onClick={() => setComposing(false)} className="text-pink-300 hover:text-pink-500 transition-colors">
              <X size={17} />
            </button>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-pink-400 uppercase tracking-widest">To (your email)</label>
            <input
              type="email"
              value={form.toEmail}
              onChange={(e) => setForm({ ...form, toEmail: e.target.value })}
              placeholder="me@example.com"
              className="w-full bg-pink-50 border border-pink-100 rounded-2xl px-4 py-2.5 text-rose-800 placeholder-pink-300 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] text-pink-400 uppercase tracking-widest">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="A note to my future self..."
                className="w-full bg-pink-50 border border-pink-100 rounded-2xl px-4 py-2.5 text-rose-800 placeholder-pink-300 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] text-pink-400 uppercase tracking-widest">Deliver on</label>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                min={today}
                className="w-full bg-pink-50 border border-pink-100 rounded-2xl px-4 py-2.5 text-rose-800 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-pink-400 uppercase tracking-widest">Your letter</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder={"Dear future me, I hope you're glowing..."}
              rows={8}
              className="w-full bg-pink-50 border border-pink-100 rounded-2xl px-4 py-3 text-rose-800 placeholder-pink-300 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm resize-none leading-[1.8]"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={!form.toEmail || !form.subject || !form.body || !form.deliveryDate}
              className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all"
            >
              <Send size={14} /> Seal & Schedule
            </button>
          </div>
        </motion.div>
      )}

      {letters.length === 0 ? (
        <div className="text-center py-16 text-pink-300">
          <Mail size={38} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No letters yet — write one to future you ✨</p>
        </div>
      ) : (
        <div className="space-y-3">
          {letters.map((letter) => {
            const ready = isReady(letter.deliveryDate);
            return (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => ready && setViewing(letter)}
                className={`bg-white rounded-2xl px-6 py-4 border shadow-sm flex items-center gap-4 transition-all
                  ${ready ? "border-pink-200 cursor-pointer hover:shadow-md hover:border-pink-300" : "border-pink-50 cursor-default"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ready ? "bg-pink-100" : "bg-pink-50"}`}>
                  {ready ? <Mail size={17} className="text-pink-400" /> : <Clock size={17} className="text-pink-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-rose-800 font-medium text-sm truncate">{letter.subject}</p>
                  <p className="text-pink-400 text-xs mt-0.5">
                    {ready
                      ? `Ready to read · ${letter.toEmail}`
                      : `Opens ${letter.deliveryDate} · ${letter.toEmail}`}
                  </p>
                </div>
                {ready && (
                  <span className="text-xs bg-pink-100 text-pink-500 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                    Open ✉️
                  </span>
                )}
                <button
                  onClick={(e) => deleteLetter(letter.id, e)}
                  className="text-pink-200 hover:text-pink-400 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Floating Emojis ─────────────────────────────────────────────────────────

const CELEBRATION_EMOJIS = ["🌸","✨","🎉","💖","🌟","🥂","🎊","💫","🌺","🎀","🍾","🦋"];

function FloatingEmojis({ show }: { show: boolean }) {
  const [particles] = useState(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      emoji: CELEBRATION_EMOJIS[i % CELEBRATION_EMOJIS.length],
      left: 3 + Math.random() * 94,
      delay: Math.random() * 1.8,
      duration: 2.8 + Math.random() * 2,
      size: 18 + Math.floor(Math.random() * 24),
    }))
  );
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.left}%`, bottom: "-2rem", fontSize: p.size }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: "-110vh", opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────

function CalendarTab() {
  const [entries, setEntries] = useLocalStorage<LogEntry[]>("gj-log-entries", []);
  const [events, setEvents] = useLocalStorage<FutureEvent[]>("gj-future-events", []);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedFuture, setSelectedFuture] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState<Mood>("good");
  const [eventForm, setEventForm] = useState({ title: "", note: "", isCelebration: false });
  const [todayNotifs, setTodayNotifs] = useState<FutureEvent[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  // Fire notifications for today's events on mount
  useEffect(() => {
    const todayEvents = events.filter((e) => e.date === todayStr);
    if (todayEvents.length > 0) {
      setTodayNotifs(todayEvents);
      if (todayEvents.some((e) => e.isCelebration)) {
        setShowCelebration(true);
        const t = setTimeout(() => setShowCelebration(false), 5500);
        return () => clearTimeout(t);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function dateStr(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function entryFor(day: number) {
    return entries.find((e) => e.date === dateStr(day));
  }

  function eventsFor(day: number) {
    return events.filter((e) => e.date === dateStr(day));
  }

  function selectDay(day: number) {
    const ds = dateStr(day);
    const existing = entries.find((e) => e.date === ds);
    setSelected(ds);
    setSelectedFuture(null);
    setEditContent(existing?.content ?? "");
    setEditMood(existing?.mood ?? "good");
  }

  function selectFutureDay(day: number) {
    const ds = dateStr(day);
    const existing = events.find((e) => e.date === ds);
    setSelectedFuture(ds);
    setSelected(null);
    setEventForm({
      title: existing?.title ?? "",
      note: existing?.note ?? "",
      isCelebration: existing?.isCelebration ?? false,
    });
  }

  function saveEntry() {
    if (!selected || !editContent.trim()) return;
    setEntries((prev) => {
      const without = prev.filter((e) => e.date !== selected);
      return [...without, { date: selected, content: editContent.trim(), mood: editMood }];
    });
    setSelected(null);
  }

  function deleteEntry() {
    if (!selected) return;
    setEntries((prev) => prev.filter((e) => e.date !== selected));
    setSelected(null);
  }

  function saveEvent() {
    if (!selectedFuture || !eventForm.title.trim()) return;
    setEvents((prev) => {
      const without = prev.filter((e) => e.date !== selectedFuture);
      return [...without, {
        id: uid(),
        date: selectedFuture,
        title: eventForm.title.trim(),
        note: eventForm.note.trim(),
        isCelebration: eventForm.isCelebration,
      }];
    });
    setSelectedFuture(null);
    setEventForm({ title: "", note: "", isCelebration: false });
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedFuture(null);
  }

  function dismissNotif(id: string) {
    setTodayNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const recentEntries = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const upcomingEvents = [...events]
    .filter((e) => e.date > todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Celebration emojis */}
      <FloatingEmojis show={showCelebration} />

      {/* Today notifications — fixed bottom-right */}
      {todayNotifs.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 space-y-2 max-w-xs w-full">
          {todayNotifs.map((notif, idx) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: idx * 0.12, type: "spring", stiffness: 280, damping: 22 }}
              className={`rounded-2xl p-4 shadow-lg border flex items-start gap-3 ${
                notif.isCelebration
                  ? "bg-gradient-to-br from-pink-50 to-fuchsia-50 border-pink-200"
                  : "bg-white border-pink-100"
              }`}
            >
              <span className="text-2xl shrink-0">{notif.isCelebration ? "🎉" : "🌟"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-rose-800 font-semibold text-sm">
                  {notif.isCelebration ? "Celebrate today! 🌸" : "Today is the day!"}
                </p>
                <p className="text-rose-700 text-sm mt-0.5 leading-snug">{notif.title}</p>
                {notif.note && <p className="text-pink-400 text-xs mt-1 line-clamp-2">{notif.note}</p>}
              </div>
              <button
                onClick={() => dismissNotif(notif.id)}
                className="text-pink-300 hover:text-pink-500 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        <h2 className="font-['Playfair_Display'] text-2xl text-rose-800">Life Log</h2>
        <p className="text-sm text-pink-400 mt-1">Capture the magic of every day · plan what's ahead 🌙</p>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-50 text-pink-400 transition-colors">
            <ChevronLeft size={17} />
          </button>
          <span className="text-rose-800 font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-pink-50 text-pink-400 transition-colors">
            <ChevronRight size={17} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 text-[10px] text-pink-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-100 inline-block" /> Log entry</span>
          <span className="flex items-center gap-1">⭐ Upcoming</span>
          <span className="flex items-center gap-1">🎉 Celebration</span>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-[10px] text-pink-300 font-medium uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const ds = dateStr(day);
            const entry = entryFor(day);
            const dayEvents = eventsFor(day);
            const hasEvent = dayEvents.length > 0;
            const isCelebDay = dayEvents.some((e) => e.isCelebration);
            const isToday = ds === todayStr;
            const isFuture = ds > todayStr;

            return (
              <button
                key={ds}
                onClick={() => isFuture ? selectFutureDay(day) : selectDay(day)}
                className={[
                  "aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer",
                  isToday ? "bg-pink-400 text-white font-semibold shadow-sm" : "",
                  !isToday && (entry || hasEvent) ? "bg-pink-50 text-rose-700 hover:bg-pink-100" : "",
                  !isToday && !entry && !hasEvent ? "text-rose-700 hover:bg-pink-50" : "",
                  isFuture && !hasEvent ? "text-pink-300" : "",
                ].join(" ")}
              >
                <span className="text-xs">{day}</span>
                {!isToday && (
                  <span className="text-[10px] leading-none">
                    {isCelebDay ? "🎉" : hasEvent ? "⭐" : entry ? MOOD_META[entry.mood].emoji : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Past / today: log entry panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-rose-800 font-medium text-sm">{selected}</span>
            <button onClick={() => setSelected(null)} className="text-pink-300 hover:text-pink-500 transition-colors">
              <X size={17} />
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-pink-400 uppercase tracking-widest mb-2">How was your day?</label>
            <div className="flex gap-2">
              {(Object.keys(MOOD_META) as Mood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setEditMood(m)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs transition-all border ${
                    editMood === m ? "border-pink-300 bg-pink-50" : "border-transparent hover:bg-pink-50"
                  }`}
                >
                  <span className="text-lg">{MOOD_META[m].emoji}</span>
                  <span className="text-pink-400 text-[9px]">{MOOD_META[m].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-pink-400 uppercase tracking-widest mb-1.5">What happened?</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Today I felt..."
              rows={4}
              className="w-full bg-pink-50 border border-pink-100 rounded-2xl px-4 py-3 text-rose-800 placeholder-pink-300 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm resize-none leading-[1.8]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {entries.find((e) => e.date === selected) ? (
              <button onClick={deleteEntry} className="text-pink-300 hover:text-pink-500 text-sm transition-colors flex items-center gap-1">
                <Trash2 size={13} /> Delete
              </button>
            ) : <span />}
            <button
              onClick={saveEntry}
              disabled={!editContent.trim()}
              className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-40 text-white px-5 py-2 rounded-full text-sm font-medium transition-all"
            >
              Save entry ✨
            </button>
          </div>
        </motion.div>
      )}

      {/* Future: event panel */}
      {selectedFuture && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-rose-800 font-medium text-sm">{selectedFuture}</span>
              <p className="text-[11px] text-pink-400 mt-0.5">Something to look forward to ✨</p>
            </div>
            <button onClick={() => setSelectedFuture(null)} className="text-pink-300 hover:text-pink-500 transition-colors">
              <X size={17} />
            </button>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-pink-400 uppercase tracking-widest">Event title</label>
            <input
              type="text"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder="Trip to Paris, birthday dinner..."
              className="w-full bg-pink-50 border border-pink-100 rounded-2xl px-4 py-2.5 text-rose-800 placeholder-pink-300 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] text-pink-400 uppercase tracking-widest">Note (optional)</label>
            <textarea
              value={eventForm.note}
              onChange={(e) => setEventForm({ ...eventForm, note: e.target.value })}
              placeholder="Details, things to pack, who you're going with..."
              rows={3}
              className="w-full bg-pink-50 border border-pink-100 rounded-2xl px-4 py-3 text-rose-800 placeholder-pink-300 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm resize-none leading-[1.8]"
            />
          </div>

          {/* Celebration toggle */}
          <button
            onClick={() => setEventForm({ ...eventForm, isCelebration: !eventForm.isCelebration })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-sm ${
              eventForm.isCelebration
                ? "border-pink-300 bg-gradient-to-r from-pink-50 to-fuchsia-50 text-rose-700"
                : "border-pink-100 bg-pink-50 text-pink-400 hover:border-pink-200"
            }`}
          >
            <span className="text-xl">{eventForm.isCelebration ? "🎉" : "⭐"}</span>
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">{eventForm.isCelebration ? "Celebration day!" : "Mark as celebration"}</p>
              <p className="text-xs text-pink-400 mt-0.5">
                {eventForm.isCelebration ? "Emoji confetti will pop when this day arrives 🌸" : "Get a special celebration effect on the day"}
              </p>
            </div>
            <div className={`w-10 h-5 rounded-full transition-all relative ${eventForm.isCelebration ? "bg-pink-400" : "bg-pink-200"}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${eventForm.isCelebration ? "left-5" : "left-0.5"}`} />
            </div>
          </button>

          <div className="flex items-center justify-between pt-1">
            {events.find((e) => e.date === selectedFuture) ? (
              <button
                onClick={() => {
                  const ev = events.find((e) => e.date === selectedFuture);
                  if (ev) deleteEvent(ev.id);
                }}
                className="text-pink-300 hover:text-pink-500 text-sm transition-colors flex items-center gap-1"
              >
                <Trash2 size={13} /> Remove
              </button>
            ) : <span />}
            <button
              onClick={saveEvent}
              disabled={!eventForm.title.trim()}
              className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 disabled:opacity-40 text-white px-5 py-2 rounded-full text-sm font-medium transition-all"
            >
              Save event 🌟
            </button>
          </div>
        </motion.div>
      )}

      {/* Upcoming events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-pink-400 uppercase tracking-widest font-medium">Looking ahead</p>
          {upcomingEvents.map((ev) => (
            <div
              key={ev.id}
              className={`rounded-2xl px-5 py-3.5 border flex items-start gap-3 shadow-sm ${
                ev.isCelebration
                  ? "bg-gradient-to-r from-pink-50 to-fuchsia-50 border-pink-200"
                  : "bg-white border-pink-100"
              }`}
            >
              <span className="text-xl mt-0.5">{ev.isCelebration ? "🎉" : "⭐"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-pink-400 mb-0.5">{ev.date}</p>
                <p className="text-rose-700 text-sm font-medium leading-snug">{ev.title}</p>
                {ev.note && <p className="text-pink-400 text-xs mt-0.5 line-clamp-1">{ev.note}</p>}
              </div>
              <button onClick={() => deleteEvent(ev.id)} className="text-pink-200 hover:text-pink-400 transition-colors mt-1 shrink-0">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recent log entries */}
      {recentEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-pink-400 uppercase tracking-widest font-medium">Recent entries</p>
          {recentEntries.map((entry) => (
            <div
              key={entry.date}
              className="bg-white rounded-2xl px-5 py-4 border border-pink-100 flex items-start gap-3 shadow-sm"
            >
              <span className="text-xl mt-0.5">{MOOD_META[entry.mood].emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-pink-400 mb-0.5">{entry.date}</p>
                <p className="text-rose-700 text-sm leading-relaxed line-clamp-2">{entry.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bucket List Tab ──────────────────────────────────────────────────────────

type PendingCheck = { catId: string; itemId: string; itemText: string; catName: string; catEmoji: string };

function BucketListTab() {
  const [categories, setCategories] = useLocalStorage<BucketCategory[]>(
    "gj-bucket-categories",
    DEFAULT_CATEGORIES
  );
  const [logEntries, setLogEntries] = useLocalStorage<LogEntry[]>("gj-log-entries", []);
  const [activeId, setActiveId] = useState(DEFAULT_CATEGORIES[0].id);
  const [newItemText, setNewItemText] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("✨");
  const [pendingCheck, setPendingCheck] = useState<PendingCheck | null>(null);
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const cat = categories.find((c) => c.id === activeId) ?? categories[0];

  function toggleItem(catId: string, itemId: string) {
    const category = categories.find((c) => c.id === catId);
    const item = category?.items.find((i) => i.id === itemId);
    if (!item || !category) return;

    if (item.done) {
      // Unchecking — just remove done state
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId
            ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, done: false, completedDate: undefined } : i)) }
            : c
        )
      );
    } else {
      // Checking — open date picker dialog
      setPendingCheck({ catId, itemId, itemText: item.text, catName: category.name, catEmoji: category.emoji });
      setCompletionDate(new Date().toISOString().split("T")[0]);
    }
  }

  function confirmCheck() {
    if (!pendingCheck) return;
    const { catId, itemId, itemText, catName, catEmoji } = pendingCheck;

    // Mark item done with date
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, done: true, completedDate: completionDate } : i)) }
          : c
      )
    );

    // Log to Life Log calendar
    setLogEntries((prev) => {
      const existing = prev.find((e) => e.date === completionDate);
      const newNote = `${catEmoji} Completed "${itemText}" from my ${catName} list`;
      if (existing) {
        return prev.map((e) =>
          e.date === completionDate ? { ...e, content: e.content + "\n" + newNote } : e
        );
      }
      return [...prev, { date: completionDate, content: newNote, mood: "great" }];
    });

    setPendingCheck(null);
  }

  function addItem() {
    if (!newItemText.trim() || !cat) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === cat.id
          ? { ...c, items: [...c.items, { id: uid(), text: newItemText.trim(), done: false }] }
          : c
      )
    );
    setNewItemText("");
  }

  function removeItem(catId: string, itemId: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c))
    );
  }

  function addCategory() {
    if (!newCatName.trim()) return;
    const newCat: BucketCategory = { id: uid(), name: newCatName.trim(), emoji: newCatEmoji, items: [] };
    setCategories((prev) => [...prev, newCat]);
    setActiveId(newCat.id);
    setNewCatName("");
    setNewCatEmoji("✨");
    setAddingCat(false);
  }

  function removeCategory(catId: string) {
    const remaining = categories.filter((c) => c.id !== catId);
    setCategories(remaining);
    if (activeId === catId) setActiveId(remaining[0]?.id ?? "");
  }

  const progress = cat
    ? Math.round((cat.items.filter((i) => i.done).length / Math.max(cat.items.length, 1)) * 100)
    : 0;

  const done = cat?.items.filter((i) => i.done).length ?? 0;
  const total = cat?.items.length ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-['Playfair_Display'] text-2xl text-rose-800">Bucket List</h2>
        <p className="text-sm text-pink-400 mt-1">Dream big, check them off 💫</p>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 items-center">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeId === c.id
                ? "bg-pink-400 text-white shadow-sm"
                : "bg-white border border-pink-100 text-rose-700 hover:border-pink-200"
            }`}
          >
            <span>{c.emoji}</span>
            {c.name}
          </button>
        ))}
        <button
          onClick={() => setAddingCat(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-white border border-dashed border-pink-300 text-pink-400 hover:bg-pink-50 transition-all"
        >
          <Plus size={13} /> Add list
        </button>
      </div>

      {/* New category form */}
      {addingCat && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-rose-700 text-sm font-medium">New list</span>
            <button onClick={() => setAddingCat(false)} className="text-pink-300 hover:text-pink-500 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={newCatEmoji}
              onChange={(e) => setNewCatEmoji(e.target.value)}
              placeholder="🌸"
              maxLength={2}
              className="w-14 bg-pink-50 border border-pink-100 rounded-xl px-3 py-2 text-center text-base focus:outline-none focus:border-pink-300"
            />
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="List name..."
              className="flex-1 bg-pink-50 border border-pink-100 rounded-xl px-4 py-2 text-rose-800 placeholder-pink-300 text-sm focus:outline-none focus:border-pink-300"
            />
            <button
              onClick={addCategory}
              className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </motion.div>
      )}

      {/* Active category card */}
      {cat && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <h3 className="text-rose-800 font-semibold">{cat.name}</h3>
                <p className="text-xs text-pink-400">
                  {done} of {total} {total === 1 ? "dream" : "dreams"} done
                </p>
              </div>
            </div>
            {categories.length > 1 && (
              <button
                onClick={() => removeCategory(cat.id)}
                className="text-pink-200 hover:text-pink-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {total > 0 && (
            <div className="h-1.5 bg-pink-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-300 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          )}

          <div className="space-y-2.5">
            {total === 0 && (
              <p className="text-center text-pink-300 text-sm py-6">
                No items yet — add your first dream below ✨
              </p>
            )}
            {cat.items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 group"
              >
                <button
                  onClick={() => toggleItem(cat.id, item.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    item.done ? "bg-pink-400 border-pink-400" : "border-pink-200 hover:border-pink-400"
                  }`}
                >
                  {item.done && <Check size={9} className="text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm transition-all leading-relaxed ${
                      item.done ? "line-through text-pink-300" : "text-rose-700"
                    }`}
                  >
                    {item.text}
                  </span>
                  {item.done && item.completedDate && (
                    <p className="text-[10px] text-pink-300 mt-0.5">✓ {item.completedDate}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(cat.id, item.id)}
                  className="text-pink-200 hover:text-pink-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={13} />
                </button>
              </motion.div>
            ))}

            {/* Completion date dialog */}
            {pendingCheck && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 bg-pink-50 rounded-2xl p-4 border border-pink-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-rose-800 text-sm font-medium leading-snug">
                    🎉 When did you do this?
                    <span className="block text-xs text-pink-400 font-normal mt-0.5">
                      "{pendingCheck.itemText}"
                    </span>
                  </p>
                  <button onClick={() => setPendingCheck(null)} className="text-pink-300 hover:text-pink-500 shrink-0 transition-colors">
                    <X size={15} />
                  </button>
                </div>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-rose-800 text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                />
                <p className="text-[10px] text-pink-400">This will also be saved to your Life Log 🌸</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setPendingCheck(null)} className="text-pink-400 text-sm px-3 py-1.5 rounded-full hover:bg-pink-100 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={confirmCheck}
                    disabled={!completionDate}
                    className="bg-pink-400 hover:bg-pink-500 disabled:opacity-40 text-white text-sm px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5"
                  >
                    <Check size={13} /> Confirm
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex gap-3 pt-3 border-t border-pink-50">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder={`Add to ${cat.name}...`}
              className="flex-1 bg-pink-50 border border-pink-100 rounded-2xl px-4 py-2.5 text-rose-800 placeholder-pink-300 text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
            />
            <button
              onClick={addItem}
              disabled={!newItemText.trim()}
              className="bg-pink-400 hover:bg-pink-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-2xl transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<Tab>("letters");

  useEffect(() => {
    document.title = "Glow Journal";
    const existingFavicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    const link: HTMLLinkElement = existingFavicon ?? document.createElement("link");
    link.rel = "icon";
    link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>";
    if (!existingFavicon) document.head.appendChild(link);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "letters",    label: "Letters",    icon: <Mail size={15} /> },
    { id: "calendar",   label: "Life Log",   icon: <Calendar size={15} /> },
    { id: "bucketlist", label: "Bucket List", icon: <ListChecks size={15} /> },
  ];

  const hero = {
    letters:    { title: "Write to your future self ✉️", sub: "Seal a letter today — let your future self find it when the time is right." },
    calendar:   { title: "Your story, day by day 🌙",    sub: "Log your days, revisit your journey, celebrate your growth." },
    bucketlist: { title: "Dream it. Do it. Check it. 💫", sub: "Build your dream lists and glow up one checkmark at a time." },
  }[tab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 font-['DM_Sans']">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-pink-200 rounded-full opacity-[0.18] blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-64 h-64 bg-rose-200 rounded-full opacity-[0.14] blur-3xl" />
        <div className="absolute -bottom-24 right-1/3 w-80 h-80 bg-fuchsia-200 rounded-full opacity-[0.18] blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/60 border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles size={19} className="text-pink-400" />
            <span className="font-['Playfair_Display'] text-rose-800 text-lg font-semibold tracking-tight">
              glow journal
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tab === t.id
                    ? "bg-pink-400 text-white shadow-sm"
                    : "text-rose-700 hover:bg-pink-50"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero banner */}
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-5">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-pink-200/50 via-rose-100/50 to-fuchsia-100/50 rounded-3xl px-8 py-7 border border-pink-100 backdrop-blur-sm"
        >
          <p className="text-[11px] uppercase tracking-widest text-pink-400 mb-2 font-medium">
            Your personal space
          </p>
          <h1 className="font-['Playfair_Display'] text-3xl text-rose-800 leading-tight mb-2">
            {hero.title}
          </h1>
          <p className="text-rose-600/70 text-sm max-w-md">{hero.sub}</p>
        </motion.div>
      </div>

      {/* Page content */}
      <main className="max-w-4xl mx-auto px-6 pb-24">
        {tab === "letters"    && <LettersTab />}
        {tab === "calendar"   && <CalendarTab />}
        {tab === "bucketlist" && <BucketListTab />}
      </main>
    </div>
  );
}
