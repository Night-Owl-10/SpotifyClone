import { useParams, Link, useNavigate } from "react-router-dom";
import { Music2, DeleteIcon, Trash2 } from "lucide-react";
import { getPlaylist, removeSongFromPlaylist, deletePlaylist } from "@/services/playlistService";
import type { PlaylistData } from "@/services/playlistService";
import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// HOW THIS WORKS
// ---------------------------------------------------------------------------
// App.tsx registers ONE route:  <Route path="/playlist/:id" element={<PlayList />} />
//
// Sidebar links to:             /playlist/pl-001, /playlist/pl-002, etc.
//
// useParams() reads the :id segment from the current URL.
// → Same URL shape as Spotify:  open.spotify.com/playlist/47f6x8OJIt3LQ2KSRGANpE
//   except your ids are pl-001, pl-002, etc. (or real DB ids once backend is ready)
//
// You NEVER create a separate page file per playlist. One component handles ALL of them.
// ---------------------------------------------------------------------------

function PlayList() {
    const { id } = useParams<{ id: string }>();
    const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
    const navigate = useNavigate();

    const { playlistRefresh, setPlaylistRefresh } = useAuth();

    useEffect(() => {
        if (!id) return;

        async function fetchPlaylist() {
            const data = await getPlaylist(id!);
            setPlaylist(data);
        }
        fetchPlaylist();
    }, [id, playlistRefresh]);

    async function handleRemove(e: React.MouseEvent, songId: string) {
        try {
            e.preventDefault();
            e.stopPropagation();
            await removeSongFromPlaylist(id!, songId);
            toast.success("Song removed successfully");
            setPlaylistRefresh(prev => !prev);
        } catch (error) {
            console.log(error);
            toast.error("Error removing song");
        }
    }

    async function handleDeletePlaylist() {
        try {
            await deletePlaylist(id!);
            toast.success("Playlist deleted successfully");
            setPlaylistRefresh(prev => !prev);
            navigate("/");
        } catch (error) {
            console.log(error);
            toast.error("Error deleting playlist");
        }
    }

    if (!playlist) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-gray-400">
                <Music2 className="w-16 h-16 opacity-30" />
                <p className="text-lg font-semibold">Playlist not found</p>
                <Link to="/" className="text-[#1db954] text-sm hover:underline">
                    Go back home
                </Link>
            </div>
        );
    }

    return (
        <section className="min-h-0 flex-1 overflow-y-auto">
            {/* Playlist header banner */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 bg-gradient-to-b from-[#535353] to-[#121212] px-4 sm:px-8 pt-8 sm:pt-16 pb-6 sm:pb-8">
                {/* Playlist cover */}
                <div className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 rounded-md overflow-hidden flex items-center justify-center bg-[#282828] shadow-2xl shrink-0">
                    <Music2 className="w-14 h-14 sm:w-20 sm:h-20 text-gray-500" />
                </div>

                <div className="flex justify-between items-start sm:items-center w-full gap-3">
                    <div className="flex flex-col gap-1 sm:gap-2">
                        <p className="text-white text-xs font-semibold uppercase tracking-widest">Playlist</p>
                        <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">
                            {playlist.name}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
                        </p>
                    </div>
                    <Button onClick={handleDeletePlaylist} className="shrink-0 w-fit py-1 rounded-md bg-red-900 text-black hover:bg-red-700 hover:scale-105 transition-transform duration-200 cursor-pointer">
                        <Trash2 className="w-4 h-4 text-white" />
                        <span className="text-white hidden sm:inline">Delete Playlist</span>
                    </Button>
                </div>
            </div>

            {/* Song list */}
            <div className="px-4 sm:px-8 py-6">
                {playlist.songs.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-500">
                        <Music2 className="w-12 h-12 opacity-30" />
                        <p className="text-base font-semibold">No songs in this playlist yet</p>
                        <p className="text-sm">Find something for your playlist on the home page.</p>
                        <Link
                            to="/"
                            className="mt-2 px-6 py-2 rounded-full bg-[#1db954] text-black text-sm font-bold hover:bg-[#1ed760] transition-colors duration-200"
                        >
                            Browse music
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {/* Table header — 3 cols on mobile, 4 on md+ */}
                        <div className="grid grid-cols-[24px_1fr_80px] md:grid-cols-[24px_1fr_1fr_80px] gap-4 px-4 py-2 text-gray-400 text-sm border-b border-[#3b3b3b] mb-2">
                            <span>#</span>
                            <span>Title</span>
                            <span className="hidden md:block">Album</span>
                            <span className="text-right">Delete</span>
                        </div>

                        {playlist.songs.map((item, index) => (
                            <Link
                                to={`/music/${item.music.id}`}
                                key={item.music.id}
                                className="grid grid-cols-[24px_1fr_80px] md:grid-cols-[24px_1fr_1fr_80px] gap-4 px-4 py-3 rounded-md hover:bg-[#282828] transition-colors duration-150 group items-center"
                            >
                                <span className="text-gray-400 text-sm group-hover:text-white">
                                    {index + 1}
                                </span>

                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded shrink-0 overflow-hidden">
                                        <img
                                            src={item.music.thumbnail_url}
                                            alt={item.music.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                            {item.music.title}
                                        </p>
                                        <p className="text-gray-400 text-xs truncate">{item.music.user?.username}</p>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm hidden md:block truncate">
                                    {item.music.created_at?.slice(0, 10)}
                                </p>

                                <button className=" flex justify-center items-center w-16 ml-auto cursor-pointer bg-red-900 hover:bg-red-700 rounded-md py-2" onClick={(e) => handleRemove(e, item.music.id)}>
                                    <DeleteIcon className="w-4 h-4 text-white" />
                                </button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default PlayList;
