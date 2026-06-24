import { Link } from "react-router-dom";
import { getAllSongs } from "@/services/musicService";
import { useState, useEffect } from "react";

function Home() {

    const [songs, setSongs] = useState([]);
    useEffect(() => {
        const getSongs = async () => {
            const songs = await getAllSongs();
            setSongs(songs);
        }
        getSongs();
    }, []);

    return (
        <section className="min-h-0 flex-1 overflow-y-auto p-[12px]">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                {
                    songs.map((song) => {
                        return (
                            <Link to={`/music/${song.id}`} key={song.id}>
                                <div className="flex flex-col gap-2">
                                    <div className="h-40 w-full rounded-md overflow-hidden">
                                        <img src={song.thumbnail_url} className="h-full w-full object-cover" alt="" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full overflow-hidden">
                                            <img src={song.user.avatar_url} className="h-full w-full object-cover" alt="" />
                                        </div>
                                        <div>
                                            <h1>{song.title}</h1>
                                            <p>{song.user.username}</p>
                                            <p>{song.created_at?.slice(0, 10)}</p>
                                        </div>

                                    </div>
                                </div>
                            </Link>
                        )
                    })
                }
            </div>
        </section>
    )
}

export default Home;