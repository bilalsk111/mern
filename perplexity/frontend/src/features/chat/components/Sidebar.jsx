import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
  Bot,
  Search,
  LogOut,
  User,
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../auth/hook/useAuth";
import { useNavigate } from "react-router-dom";

const Sidebar = ({
  isOpen,
  setIsOpen,
  chats,
  onSelectChat,
  currentChatId,
  onNewChat,
  onDeleteChat,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const { currentUser: user, handlelogout } = useAuth();

  // ================= FILTER =================
  const chatList = useMemo(() => {
    const sorted = Object.values(chats).sort(
      (a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0),
    );

    if (!searchQuery.trim()) return sorted;

    return sorted.filter((c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [chats, searchQuery]);

  // ================= GROUP =================
  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now - 86400000).toDateString();

    const groups = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    chatList.forEach((chat) => {
      const d = new Date(chat.lastUpdated || 0);
      const ds = d.toDateString();
      const diff = (now - d) / 86400000;

      if (ds === today) groups.Today.push(chat);
      else if (ds === yesterday) groups.Yesterday.push(chat);
      else if (diff <= 7) groups["Previous 7 Days"].push(chat);
      else groups.Older.push(chat);
    });

    return groups;
  }, [chatList]);

  // ================= DELETE =================
  const handleDelete = async (e, chatId) => {
    e.stopPropagation();

    if (deletingId === chatId) return;

    try {
      setDeletingId(chatId);

      if (chatId.startsWith("temp-")) {
        onDeleteChat(chatId, { localOnly: true });
        return;
      }

      await onDeleteChat(chatId);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Overlay for Mobile with Glass effect */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed md:relative z-50 h-full w-[280px] flex flex-col bg-[#09090b] md:bg-[#09090b]/50 border-r border-white/5 shadow-2xl md:shadow-none"
      >
        {/* HEADER */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Bot size={18} className="text-white" />
            </div>
            <span className="font-semibold text-zinc-100 tracking-wide text-[15px]">Cognivex</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* NEW CHAT BUTTON */}
        <div className="px-3 pb-2 mt-1">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-[14px] font-medium text-zinc-200 group shadow-sm"
          >
            <Plus size={16} className="text-violet-400 group-hover:scale-110 transition-transform" />
            New Thread
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#18181b] border border-white/5 focus-within:border-white/10 focus-within:bg-[#27272a] transition-all shadow-inner">
            <Search size={14} className="text-zinc-500" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-500 outline-none"
            />
          </div>
        </div>

        {/* CHAT LIST */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 custom-scrollbar pb-2">
          {Object.entries(groupedChats).map(([group, items]) => {
            if (!items.length) return null;

            return (
              <div key={group} className="space-y-1">
                <p className="px-3 py-1 text-[11px] font-bold tracking-wider text-zinc-600 uppercase">
                  {group}
                </p>

                {items.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onSelectChat(chat.id);
                      // ✅ FIX: Sidebar ONLY closes on mobile phones, stays open on desktop
                      if (window.innerWidth < 768) {
                        setIsOpen(false);
                      }
                    }}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      currentChatId === chat.id
                        ? "bg-white/10 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <MessageSquare size={14} className={currentChatId === chat.id ? "text-violet-400" : "text-zinc-500"} />

                    <span className="flex-1 truncate text-[13px] font-medium">
                      {chat.title || "New Chat"}
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, chat.id)}
                      disabled={chat.id.startsWith("temp-") || deletingId === chat.id}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      {deletingId === chat.id ? (
                        <span className="w-3 h-3 block rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* USER PROFILE FOOTER */}
        <div className="p-3 mt-auto border-t border-white/5 bg-[#09090b]">
          <div className="flex items-center justify-between bg-[#18181b] hover:bg-[#27272a] border border-white/5 transition-colors px-3 py-2.5 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <User size={14} className="text-zinc-200" />
              </div>
              <span className="text-[13px] font-medium text-zinc-200 truncate">{user?.username || "Account"}</span>
            </div>

            <button
              onClick={async () => {
                await handlelogout();
                navigate("/login");
              }}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;