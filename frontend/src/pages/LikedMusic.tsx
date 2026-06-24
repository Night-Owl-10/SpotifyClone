import { dummyData } from "@/utils/dummyData";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

function LikedMusic() {
    return (
        <section className="min-h-0 flex-1 overflow-y-auto">
            {/* Header banner — purple gradient to match the heart icon in the sidebar */}
            <div className="flex flex-col md:flex-row items-end gap-6 bg-gradient-to-b from-violet-700 to-[#121212] px-8 pt-16 pb-8">
                {/* Cover art */}
                <div className="h-48 w-48 rounded-md overflow-hidden flex items-center justify-center bg-gradient-to-b from-violet-500 to-indigo-500 shadow-2xl shrink-0">
                    <Heart className="w-20 h-20 text-white" />
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-white text-xs font-semibold uppercase tracking-widest">
                        Playlist
                    </p>
                    <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight">
                        Liked Music
                    </h1>
                    <p className="text-gray-300 text-sm mt-1">
                        {dummyData.length} {dummyData.length === 1 ? "song" : "songs"}
                    </p>
                </div>
            </div>

            {/* Song list */}
            <div className="px-8 py-6">
                {dummyData.length === 0 ? (
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

export default LikedMusic;