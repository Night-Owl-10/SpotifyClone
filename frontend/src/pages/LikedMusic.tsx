import { Link } from "react-router-dom";
import { Heart, Loader2, DeleteIcon } from "lucide-react";
import { getAllLikedSongs, unlikeSong } from "@/services/likeService";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { LikedSong } from "@/types";

function LikedMusic() {
    const { profile, playlistRefresh, setPlaylistRefresh, isAuthenticated } = useAuth();
    const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLikedSongs = async () => {
            if (!profile?.id) return;
            setLoading(true);
            try {
                const response = await getAllLikedSongs(profile.id);
                setLikedSongs(response);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLikedSongs();
    }, [profile?.id, playlistRefresh]);

    const handleUnlike = async (e: React.MouseEvent, songId: string) => {
        try {
            e.preventDefault();
            e.stopPropagation();
            if (!profile?.id) {
                toast.error("You must be signed in.");
                return;
            }
            await unlikeSong(profile.id, songId);
            toast.success("Song unliked successfully");
            setPlaylistRefresh(prev => !prev);
        } catch (error) {
            console.log(error);
            toast.error("Error unliking song");
        }
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <section className="min-h-0 flex-1 overflow-y-auto">
            {/* Header banner — purple gradient to match the heart icon in the sidebar */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 bg-gradient-to-b from-violet-700 to-[#121212] px-4 sm:px-8 pt-8 sm:pt-16 pb-6 sm:pb-8">
                {/* Cover art */}
                <div className="h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48 rounded-md overflow-hidden flex items-center justify-center bg-gradient-to-b from-violet-500 to-indigo-500 shadow-2xl shrink-0">
                    <Heart className="w-14 h-14 sm:w-20 sm:h-20 text-white" />
                </div>

                <div className="flex flex-col gap-1 sm:gap-2">
                    <p className="text-white text-xs font-semibold uppercase tracking-widest">Playlist</p>
                    <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight">Liked Music</h1>
                    <p className="text-gray-300 text-sm mt-1">
                        {likedSongs.length} {likedSongs.length === 1 ? "song" : "songs"}
                    </p>
                </div>
            </div>

            {/* Song list */}
            <div className="px-4 sm:px-8 py-6">
                {!isAuthenticated ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-500">
                        <Heart className="w-12 h-12 opacity-30" />
                        <p className="text-base font-semibold">You are not signed in</p>
                        <p className="text-sm">Please sign in to see your liked songs.</p>
                    </div>
                ) : likedSongs.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-500">
                        <Heart className="w-12 h-12 opacity-30" />
                        <p className="text-base font-semibold">No liked songs yet</p>
                        <p className="text-sm">Songs you like will appear here.</p>
                        <Link
                            to="/"
                            className="mt-2 px-6 py-2 rounded-full bg-[#1db954] text-black text-sm font-bold hover:bg-[#1ed760] transition-colors duration-200"
                        >
                            Browse music
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {/* Table header */}
                        <div className="grid grid-cols-[24px_1fr_80px] md:grid-cols-[24px_1fr_1fr_80px] gap-4 px-4 py-2 text-gray-400 text-sm border-b border-[#3b3b3b] mb-2">
                            <span>#</span>
                            <span>Title</span>
                            <span className="hidden md:block">Album</span>
                            <span className="text-right">Delete</span>
                        </div>

                        {likedSongs.map((song, index) => (
                            <Link
                                to={`/music/${song.music.id}`}
                                key={song.music.id}
                                className="grid grid-cols-[24px_1fr_80px] md:grid-cols-[24px_1fr_1fr_80px] gap-4 px-4 py-3 rounded-md hover:bg-[#282828] transition-colors duration-150 group items-center"
                            >
                                <span className="text-gray-400 text-sm group-hover:text-white">
                                    {index + 1}
                                </span>

                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded shrink-0 overflow-hidden">
                                        <img
                                            src={song.music.thumbnail_url}
                                            alt={song.music.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                            {song.music.title}
                                        </p>
                                        <p className="text-gray-400 text-xs truncate">{song.music.user?.username}</p>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm hidden md:block truncate">
                                    {song.music.created_at?.slice(0, 10)}
                                </p>


                                <button className=" flex justify-center items-center w-16 ml-auto cursor-pointer bg-red-900 hover:bg-red-700 rounded-md py-2" onClick={(e) => handleUnlike(e, song.music.id)}>
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

export default LikedMusic;