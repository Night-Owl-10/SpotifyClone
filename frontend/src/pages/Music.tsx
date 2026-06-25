import { useParams } from "react-router-dom";
import { Heart, Plus, ListMusic, Loader2 } from "lucide-react";
import { getSongById, getSongsByUserId } from "@/services/musicService";
import { likeSong } from "@/services/likeService";
import { getAllPlaylists, addSongToPlaylist } from "@/services/playlistService";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Playlist = {
    id: string;
    name: string;
    user_id: string;
    created_at: string;
};

function Music() {
    const { id } = useParams();
    const { user, musicRefresh, setPlaylistRefresh } = useAuth();

    const [song, setSong] = useState(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
    const [userSongs, setUserSongs] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;
        const getSong = async () => {
            const song = await getSongById(id);
            setSong(song);
            console.log(song);
        };
        getSong();
    }, [id]);

    useEffect(() => {
        if (!user?.id) return;
        const fetchPlaylists = async () => {
            setLoadingPlaylists(true);
            try {
                const data = await getAllPlaylists(user.id);
                setPlaylists(data ?? []);
            } catch (err) {
                console.error("Failed to fetch playlists", err);
            } finally {
                setLoadingPlaylists(false);
            }
        };
        fetchPlaylists();
    }, [user?.id]);

    useEffect(() => {
        if (!song?.user_id) return;
        const fetchSongs = async () => {
            const songs = await getSongsByUserId(song.user_id);
            setUserSongs(songs);
        };
        fetchSongs();
    }, [song?.user_id, musicRefresh]);

    const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
        if (!id) return;
        setAddingToPlaylist(playlistId);
        try {
            await addSongToPlaylist(playlistId, id);
            setPlaylistRefresh(prev => !prev);
            toast.success(`Added to "${playlistName}"`, {
                description: "Song successfully added to your playlist.",
                duration: 3000,
            });
        } catch (err: any) {
            const isDuplicate = err?.code === "23505";
            toast.error(isDuplicate ? "Already in playlist" : "Failed to add song", {
                description: isDuplicate
                    ? `This song is already in "${playlistName}".`
                    : "Something went wrong. Please try again.",
                duration: 3000,
            });
        } finally {
            setAddingToPlaylist(null);
        }
    };

    const handleAddtoLiked = async () => {
        try {
            await likeSong(user?.id, id);
            toast.success("Added to liked songs", {
                description: "Song successfully added to your liked songs.",
                duration: 3000,
            });
        } catch (err: any) {
            const isDuplicate = err?.code === "23505";
            toast.error(isDuplicate ? "Already in liked songs" : "Failed to add song", {
                description: isDuplicate
                    ? `This song is already in your liked songs.`
                    : "Something went wrong. Please try again.",
                duration: 3000,
            });
        }
    }

    return (
        <div className="h-[calc(100vh-130px)] flex">
            <div className="h-full w-3/4 pt-16 flex justify-center border-r-2 border-zinc-800">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700 h-fit w-fit">
                    <div className="h-60 w-full rounded-xl overflow-hidden">
                        <img src={song?.thumbnail_url} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="flex items-center justify-between gap-4 mt-6 mb-4">
                        <div className="flex items-center gap-4">
                            <Link to={`/profile/${song?.user_id}`} className="h-16 w-16 rounded-full overflow-hidden">
                                <img src={song?.user?.avatar_url} className="h-full w-full object-cover" alt="" />
                            </Link>
                            <div className="flex gap-2">
                                <span>{song?.title}</span>
                                <span className="text-lg font-bold">.</span>
                                <span>{song?.user?.username}</span>
                                <span className="text-lg font-bold">.</span>
                                <span>{song?.created_at?.slice(0, 10)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Like button */}
                            <div className="bg-[#1db954] rounded-full h-8 w-8 flex items-center justify-center cursor-pointer" onClick={handleAddtoLiked}>
                                <Heart
                                    className="h-5 w-5 text-white hover:text-zinc-300 transition-all duration-300 hover:scale-120"
                                    strokeWidth={3}
                                />
                            </div>

                            {/* Add to Playlist dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="bg-[#1db954] rounded-full h-8 w-8 flex items-center justify-center cursor-pointer hover:bg-[#1ed760] transition-colors duration-200">
                                        <Plus
                                            className="h-5 w-5 text-white transition-all duration-300 hover:scale-120"
                                            strokeWidth={3}
                                        />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-52 bg-zinc-900 border border-zinc-700 text-white shadow-xl rounded-xl p-1"
                                >
                                    <DropdownMenuLabel className="text-zinc-400 text-xs px-2 py-1.5 font-semibold uppercase tracking-wider">
                                        Add to Playlist
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-zinc-700 my-1" />

                                    {loadingPlaylists ? (
                                        <div className="flex items-center justify-center gap-2 py-4 text-zinc-400 text-sm">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Loading...</span>
                                        </div>
                                    ) : playlists.length === 0 ? (
                                        <div className="flex flex-col items-center gap-1 py-4 px-2 text-zinc-500 text-xs text-center">
                                            <ListMusic className="h-5 w-5 opacity-50" />
                                            <span>No playlists yet</span>
                                        </div>
                                    ) : (
                                        playlists.map((playlist) => (
                                            <DropdownMenuItem
                                                key={playlist.id}
                                                onClick={() => handleAddToPlaylist(playlist.id, playlist.name)}
                                                disabled={addingToPlaylist === playlist.id}
                                                className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-sm text-white hover:bg-zinc-700 focus:bg-zinc-700 transition-colors duration-150"
                                            >
                                                {addingToPlaylist === playlist.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-[#1db954] shrink-0" />
                                                ) : (
                                                    <ListMusic className="h-4 w-4 text-[#1db954] shrink-0" />
                                                )}
                                                <span className="truncate">{playlist.name}</span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <audio
                        src={song?.music_url}
                        controls
                        className="w-[800px]"
                    />
                </div>
            </div>

            <div className="h-full w-1/4">
                <div className="h-20 w-full flex items-center justify-center bg-[#535353]">
                    <h1 className="text-xl font-bold">Artist Playlist</h1>
                </div>
                <div className="overflow-y-auto w-full h-[calc(100vh-120px)] flex flex-col gap-2 p-2">
                    {
                        userSongs.length > 0 ? userSongs.map((song) => {
                            return (
                                <Link to={`/music/${song.id}`} key={song.id}>
                                    <div className="flex gap-2 bg-[#212121] border border-[#3b3b3b] rounded-lg cursor-pointer hover:bg-[#2f2f2f] transition-colors duration-200">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden">
                                            <img src={song.thumbnail_url} className="h-full w-full object-cover" alt="" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs md:text-sm">{song.title}</p>
                                            <p className="text-xs md:text-sm font-bold">.</p>
                                            <p className="text-xs md:text-sm">{song.created_at.slice(0, 10)}</p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                            : <div>
                                This Artist has no other songs available
                            </div>
                    }

                </div>
            </div>
        </div>
    );
}

export default Music;