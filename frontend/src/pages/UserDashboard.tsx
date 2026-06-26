import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getSongsByUserId } from "@/services/musicService";
import { getAllPlaylists } from "@/services/playlistService";
import { getAllLikedSongs } from "@/services/likeService";
import { Link } from "react-router-dom";
import {
    Music2, Heart, ListMusic, UploadCloud,
    Loader2, BarChart2, TrendingUp,
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, CartesianGrid,
} from "recharts";

// ─────────────────────────────────────────────
// Custom tooltip styles shared across charts
// ─────────────────────────────────────────────
const tooltipStyle = {
    contentStyle: {
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: 8,
        color: "#fff",
    },
    labelStyle: { color: "#aaa" },
};

export default function UserDashboard() {
    const { profile, isAuthenticated } = useAuth();

    const [songs, setSongs] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [likedSongs, setLikedSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.id) return;
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [s, p, l] = await Promise.all([
                    getSongsByUserId(profile.id),
                    getAllPlaylists(profile.id),
                    getAllLikedSongs(profile.id),
                ]);
                setSongs(s ?? []);
                setPlaylists(p ?? []);
                setLikedSongs(l ?? []);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [profile?.id]);

    // ── derived data ──────────────────────────
    const uploadActivity = useMemo(() => {
        const map: Record<string, number> = {};
        songs.forEach((s) => {
            const month = s.created_at.slice(0, 7); // "2025-06"
            map[month] = (map[month] || 0) + 1;
        });
        return Object.entries(map)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => ({
                month: new Date(month + "-01").toLocaleDateString("en", {
                    month: "short",
                    year: "2-digit",
                }),
                Uploads: count,
            }));
    }, [songs]);

    const playlistData = playlists.map((p) => ({
        name: p.name.length > 13 ? p.name.slice(0, 13) + "…" : p.name,
        Songs: p.playlist_songs?.[0]?.count || 0,
    }));

    const totalPlaylistSongs = playlists.reduce(
        (acc, p) => acc + (p.playlist_songs?.[0]?.count || 0),
        0
    );

    const stats = [
        {
            label: "Uploads",
            value: songs.length,
            icon: Music2,
            color: "#1db954",
            gradient: "from-[#1db954]/20 to-[#1db954]/5",
            border: "border-[#1db954]/20",
        },
        {
            label: "Playlists",
            value: playlists.length,
            icon: ListMusic,
            color: "#a855f7",
            gradient: "from-purple-500/20 to-purple-500/5",
            border: "border-purple-500/20",
        },
        {
            label: "Liked Songs",
            value: likedSongs.length,
            icon: Heart,
            color: "#f43f5e",
            gradient: "from-rose-500/20 to-rose-500/5",
            border: "border-rose-500/20",
        },
        {
            label: "Songs in Playlists",
            value: totalPlaylistSongs,
            icon: BarChart2,
            color: "#3b82f6",
            gradient: "from-blue-500/20 to-blue-500/5",
            border: "border-blue-500/20",
        },
    ];

    // ── guards ────────────────────────────────
    if (!isAuthenticated) {
        return (
            <section className="min-h-0 flex-1 overflow-y-auto flex items-center justify-center">
                <div className="text-center space-y-3">
                    <TrendingUp className="w-12 h-12 text-zinc-600 mx-auto" />
                    <p className="text-zinc-400 text-lg">Sign in to view your dashboard.</p>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="min-h-0 flex-1 overflow-y-auto flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1db954]" />
            </section>
        );
    }

    return (
        <section className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
            {/* ── Banner header ─────────────────────────── */}
            <div className="bg-gradient-to-b from-[#1db954]/30 to-transparent px-4 sm:px-8 pt-10 pb-8">
                <div className="flex items-center gap-4 sm:gap-5">
                    <img
                        src={profile?.avatar_url}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-2 ring-[#1db954] shadow-lg"
                        alt={profile?.username}
                    />
                    <div>
                        <p className="text-zinc-400 text-xs uppercase tracking-widest font-semibold mb-1">
                            Dashboard
                        </p>
                        <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
                            {profile?.username}
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            {songs.length} uploads · {playlists.length} playlists · {likedSongs.length} liked
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-8 pb-10 space-y-6">

                {/* ── Stat cards ────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            className={`bg-gradient-to-br ${s.gradient} border ${s.border} rounded-2xl p-4 sm:p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200`}
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-tight">
                                    {s.label}
                                </p>
                                <div
                                    className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: s.color + "22" }}
                                >
                                    <s.icon className="w-4 h-4" style={{ color: s.color }} />
                                </div>
                            </div>
                            <p className="text-white text-3xl sm:text-4xl font-extrabold">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Charts ────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                    {/* Area chart — upload activity */}
                    <div className="bg-[#181818] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <UploadCloud className="w-4 h-4 text-[#1db954]" />
                            <p className="text-white font-semibold text-sm">Upload Activity</p>
                        </div>
                        {uploadActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-44 text-zinc-600 gap-2">
                                <UploadCloud className="w-10 h-10 opacity-30" />
                                <p className="text-sm">No uploads yet</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={uploadActivity}>
                                    <defs>
                                        <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1db954" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#1db954" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#555"
                                        tick={{ fontSize: 11, fill: "#888" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#555"
                                        tick={{ fontSize: 11, fill: "#888" }}
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        {...tooltipStyle}
                                        itemStyle={{ color: "#1db954" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Uploads"
                                        stroke="#1db954"
                                        fill="url(#uploadGrad)"
                                        strokeWidth={2.5}
                                        dot={{ fill: "#1db954", r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Bar chart — songs per playlist */}
                    <div className="bg-[#181818] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-5">
                            <ListMusic className="w-4 h-4 text-purple-400" />
                            <p className="text-white font-semibold text-sm">Songs per Playlist</p>
                        </div>
                        {playlistData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-44 text-zinc-600 gap-2">
                                <ListMusic className="w-10 h-10 opacity-30" />
                                <p className="text-sm">No playlists yet</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={playlistData} barCategoryGap="30%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#555"
                                        tick={{ fontSize: 11, fill: "#888" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        stroke="#555"
                                        tick={{ fontSize: 11, fill: "#888" }}
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        {...tooltipStyle}
                                        itemStyle={{ color: "#a855f7" }}
                                        cursor={{ fill: "#ffffff0a" }}
                                    />
                                    <Bar
                                        dataKey="Songs"
                                        fill="#a855f7"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* ── Recent uploads ────────────────────── */}
                <div className="bg-[#181818] border border-white/10 rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Music2 className="w-4 h-4 text-[#1db954]" />
                            <p className="text-white font-semibold text-sm">Recent Uploads</p>
                        </div>
                        {profile?.id && (
                            <Link
                                to={`/profile/${profile.id}`}
                                className="text-[#1db954] text-xs font-semibold hover:underline"
                            >
                                View all →
                            </Link>
                        )}
                    </div>

                    {songs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-600 gap-2">
                            <UploadCloud className="w-10 h-10 opacity-30" />
                            <p className="text-sm">You haven't uploaded any songs yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-white/5">
                            {songs.slice(0, 5).map((song, i) => (
                                <Link
                                    to={`/music/${song.id}`}
                                    key={song.id}
                                    className="flex items-center gap-3 py-3 rounded-lg hover:bg-white/5 px-2 -mx-2 transition-colors duration-150 group"
                                >
                                    <span className="text-zinc-600 text-sm w-4 shrink-0 text-right">
                                        {i + 1}
                                    </span>
                                    <div className="h-10 w-10 rounded-md overflow-hidden shrink-0 shadow">
                                        <img
                                            src={song.thumbnail_url}
                                            className="h-full w-full object-cover"
                                            alt={song.title}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-white text-sm font-medium truncate group-hover:text-[#1db954] transition-colors">
                                            {song.title}
                                        </p>
                                        <p className="text-zinc-500 text-xs mt-0.5">
                                            {song.created_at.slice(0, 10)}
                                        </p>
                                    </div>
                                    <Music2 className="w-4 h-4 text-zinc-600 group-hover:text-[#1db954] transition-colors shrink-0" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Playlists grid ────────────────────── */}
                <div className="bg-[#181818] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <ListMusic className="w-4 h-4 text-purple-400" />
                        <p className="text-white font-semibold text-sm">Your Playlists</p>
                    </div>

                    {playlists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-600 gap-2">
                            <ListMusic className="w-10 h-10 opacity-30" />
                            <p className="text-sm">No playlists created yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {playlists.map((pl) => (
                                <Link
                                    to={`/playlist/${pl.id}`}
                                    key={pl.id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all duration-200 group"
                                >
                                    <div className="h-11 w-11 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 shrink-0 shadow">
                                        <ListMusic className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-semibold truncate group-hover:text-purple-300 transition-colors">
                                            {pl.name}
                                        </p>
                                        <p className="text-zinc-500 text-xs mt-0.5">
                                            {pl.playlist_songs?.[0]?.count || 0} songs
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Liked songs preview ───────────────── */}
                {likedSongs.length > 0 && (
                    <div className="bg-[#181818] border border-white/10 rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-rose-400" />
                                <p className="text-white font-semibold text-sm">Liked Songs</p>
                            </div>
                            <Link
                                to="/liked-music"
                                className="text-rose-400 text-xs font-semibold hover:underline"
                            >
                                View all →
                            </Link>
                        </div>
                        <div className="flex flex-col divide-y divide-white/5">
                            {likedSongs.slice(0, 4).map((item, i) => (
                                <Link
                                    to={`/music/${item.music.id}`}
                                    key={item.music.id}
                                    className="flex items-center gap-3 py-3 rounded-lg hover:bg-white/5 px-2 -mx-2 transition-colors duration-150 group"
                                >
                                    <span className="text-zinc-600 text-sm w-4 shrink-0 text-right">
                                        {i + 1}
                                    </span>
                                    <div className="h-10 w-10 rounded-md overflow-hidden shrink-0">
                                        <img
                                            src={item.music.thumbnail_url}
                                            className="h-full w-full object-cover"
                                            alt={item.music.title}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-white text-sm font-medium truncate group-hover:text-rose-400 transition-colors">
                                            {item.music.title}
                                        </p>
                                        <p className="text-zinc-500 text-xs mt-0.5">
                                            {item.music.user?.username}
                                        </p>
                                    </div>
                                    <Heart className="w-4 h-4 text-zinc-600 group-hover:text-rose-400 transition-colors shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
}