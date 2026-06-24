import { useParams } from "react-router-dom";
import { dummyData } from "@/utils/dummyData";
import { Link } from "react-router-dom";
import { Music2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Mock playlist data — keyed by the same IDs used in Sidebar.tsx
// When the backend is ready, replace this with a fetch/API call using the id.
// ---------------------------------------------------------------------------
const mockPlaylists: Record<string, { name: string; songCount: number }> = {
    "pl-001": { name: "Playlist 1", songCount: 0 },
    "pl-002": { name: "Playlist 2", songCount: 0 },
    "pl-003": { name: "Playlist 3", songCount: 0 },
    "pl-004": { name: "Playlist 4", songCount: 0 },
    "pl-005": { name: "Playlist 5", songCount: 0 },
};

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

    // Look up this playlist in mock data (replace with API call later)
    const playlist = id ? mockPlaylists[id] : undefined;

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
            <div className="flex flex-col md:flex-row items-end gap-6 bg-gradient-to-b from-[#535353] to-[#121212] px-8 pt-16 pb-8">
                {/* Placeholder cover — replace with real thumbnail when backend is ready */}
                <div className="h-48 w-48 rounded-md overflow-hidden flex items-center justify-center bg-[#282828] shadow-2xl shrink-0">
                    <Music2 className="w-20 h-20 text-gray-500" />
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-white text-xs font-semibold uppercase tracking-widest">
                        Playlist
                    </p>
                    <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight">
                        {playlist.name}
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {playlist.songCount} {playlist.songCount === 1 ? "song" : "songs"}
                    </p>
                </div>
            </div>

            {/* Song list */}
            <div className="px-8 py-6">
                {dummyData.length === 0 ? (
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
                    /* Song rows — same dummyData used elsewhere */
                    <div className="flex flex-col gap-2">
                        {/* Table header */}
                        <div className="grid grid-cols-[24px_1fr_1fr_80px] gap-4 px-4 py-2 text-gray-400 text-sm border-b border-[#3b3b3b] mb-2">
                            <span>#</span>
                            <span>Title</span>
                            <span className="hidden md:block">Album</span>
                            <span className="text-right">Duration</span>
                        </div>

                        {dummyData.map((item, index) => (
                            <Link
                                to={`/music/${item.id}`}
                                key={item.id}
                                className="grid grid-cols-[24px_1fr_1fr_80px] gap-4 px-4 py-3 rounded-md hover:bg-[#282828] transition-colors duration-150 group items-center"
                            >
                                <span className="text-gray-400 text-sm group-hover:text-white">
                                    {index + 1}
                                </span>

                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded shrink-0 overflow-hidden">
                                        <img
                                            src={item.thumbnail}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-gray-400 text-xs truncate">{item.artist}</p>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm hidden md:block truncate">
                                    {item.uploadedOn}
                                </p>

                                <p className="text-gray-400 text-sm text-right">—</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default PlayList;
