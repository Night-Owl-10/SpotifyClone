import { Sidebar, SidebarContent, SidebarGroup, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Plus, Heart, Music, Book, ListMusic } from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createPlaylist, getAllPlaylists } from "@/services/playlistService";
import { toast } from "sonner";

export function NavigationSidebar() {


    const [playlistName, setPlaylistName] = useState("");
    const [playlists, setPlaylists] = useState<any[]>([]);
    const { profile, playlistRefresh, setPlaylistRefresh } = useAuth();

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!profile?.id || !playlistName) {
            toast.error("Please enter a playlist name");
            return;
        }
        try {
            await createPlaylist(profile.id, playlistName);
            toast.success("Playlist created successfully");
            setPlaylistName("");
            setPlaylistRefresh(prev => !prev);
        } catch (error) {
            console.log(error);
            toast.error("Error creating playlist");
        }
    }

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!profile?.id) return;

            const playlist = await getAllPlaylists(profile.id);
            setPlaylists(playlist);
        };
        fetchPlaylists();
    }, [profile?.id, playlistRefresh]);



    const { state } = useSidebar();

    return (
        <TooltipProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader >
                    <div className="flex items-center justify-center gap-2 pb-3 mb-2 border-0 border-b-1">
                        <Book className={cn("text-white", state === "collapsed" ? "h-6 w-6" : "h-8 w-8")} />
                        {state === "expanded" && (
                            <h1 className="text-white font-semibold text-3xl  ">Library</h1>
                        )}
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <Dialog onOpenChange={(open) => { if (!open) setPlaylistName(""); }}>
                            <DialogTrigger asChild>
                                <div
                                    id="create-playlist-btn"
                                    className={cn("flex items-center justify-between gap-2 border border-white rounded-full w-fit cursor-pointer mb-2", state === "collapsed" ? "p-2" : "py-1 px-3")}
                                >
                                    <Plus className="h-4 w-4" />
                                    {state === "expanded" && (
                                        <span className="text-white font-semibold text-base">Create Playlist</span>
                                    )}
                                </div>
                            </DialogTrigger>

                            <DialogContent
                                showCloseButton={false}
                                className="bg-[#121212] border border-[#3b3b3b] text-white rounded-xl w-[90vw] max-w-sm p-0 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-[#3b3b3b]">
                                    <ListMusic className="w-6 h-6 text-[#1db954] shrink-0" />
                                    <DialogTitle className="text-lg font-bold text-white tracking-wide">
                                        Create Playlist
                                    </DialogTitle>
                                </div>

                                {/* Body */}
                                <form
                                    id="create-playlist-form"
                                    onSubmit={handleCreatePlaylist}
                                    className="flex flex-col gap-5 px-6 py-5"
                                >
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="playlist-name-input"
                                            className="text-sm font-semibold text-gray-300 tracking-wide"
                                        >
                                            Playlist Name
                                        </label>
                                        <input
                                            id="playlist-name-input"
                                            type="text"
                                            placeholder="My awesome playlist"
                                            value={playlistName}
                                            onChange={(e) => setPlaylistName(e.target.value)}
                                            className="w-full bg-[#1a1a1a] border border-[#3b3b3b] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1db954] transition-colors duration-200"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex justify-end items-center gap-3 pb-1">
                                        <DialogClose asChild>
                                            <button
                                                id="create-playlist-cancel-btn"
                                                type="button"
                                                onClick={() => setPlaylistName("")}
                                                className="px-5 py-2 rounded-full bg-[#2a2a2a] border border-[#3b3b3b] text-gray-300 text-sm font-medium hover:bg-[#333] hover:text-white transition-colors duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </DialogClose>
                                        <button
                                            id="create-playlist-submit-btn"
                                            type="submit"
                                            disabled={!playlistName.trim()}
                                            className="px-6 py-2 rounded-full bg-[#1db954] text-black text-sm font-bold hover:bg-[#1ed760] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"

                                        >
                                            <ListMusic className="w-4 h-4" />
                                            Create
                                        </button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </SidebarGroup>
                    <SidebarGroup>
                        <Link to="/liked-music" className={cn("flex items-center justify-start gap-2 rounded-md  cursor-pointer ", state === "collapsed" ? "p-0" : "p-2 hover:bg-[#535353]")}>
                            <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center bg-linear-to-b from-violet-500 to-indigo-500">
                                <Heart className={cn(" text-white", state === "collapsed" ? "h-4 w-4" : "h-6 w-6")} />
                            </div>
                            {state === "expanded" && (
                                <div className="flex flex-col items-start justify-around">
                                    <p className="text-white text-base">Liked Playlists</p>
                                    <p className="text-white font-semibold text-base">0 Songs</p>
                                </div>
                            )}
                        </Link>
                    </SidebarGroup>
                    {playlists.map((playlist) => (
                        <SidebarGroup key={playlist.id}>
                            <Link
                                to={`/playlist/${playlist.id}`}
                                className={cn("flex items-center justify-start gap-2 rounded-md cursor-pointer", state === "collapsed" ? "p-0" : "p-2 hover:bg-[#535353]")}
                            >
                                <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center bg-[#535353]">
                                    <Music className={cn("text-white", state === "collapsed" ? "h-4 w-4" : "h-6 w-6")} />
                                </div>

                                {state === "expanded" && (
                                    <div className="flex flex-col items-start justify-around min-w-0">
                                        <p className="text-white text-base truncate">{playlist.name}</p>
                                        <p className="text-white font-semibold text-base">{playlist.playlist_songs?.[0]?.count || 0} Songs</p>
                                    </div>
                                )}
                            </Link>
                        </SidebarGroup>
                    ))}
                </SidebarContent>
                <SidebarFooter />
            </Sidebar>
        </TooltipProvider>
    );
}