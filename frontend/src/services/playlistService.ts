import { supabase } from "@/lib/supabase";
import type { PlaylistSong } from "@/types";

export type PlaylistData = {
    id: string;
    name: string;
    songs: PlaylistSong[];
};

export const createPlaylist = async (userId: string, playlistName: string) => {
    const { data, error } = await supabase
        .from("playlists")
        .insert({
            user_id: userId,
            name: playlistName,
        });

    if (error) throw error;

    return data;
};

export const getAllPlaylists = async (userId: string) => {
    const { data, error } = await supabase
        .from("playlists")
        .select(`
                    *,
                    playlist_songs(count)
                `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
};

export const deletePlaylist = async (playlistId: string) => {
    const { data, error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", playlistId);

    if (error) throw error;

    return data;
};

export const addSongToPlaylist = async (playlistId: string, musicId: string) => {
    const { data, error } = await supabase
        .from("playlist_songs")
        .insert({
            playlist_id: playlistId,
            music_id: musicId,
        });

    if (error) throw error;

    return data;
}

export const removeSongFromPlaylist = async (playlistId: string, musicId: string) => {
    const { data, error } = await supabase
        .from("playlist_songs")
        .delete()
        .eq("playlist_id", playlistId)
        .eq("music_id", musicId);

    if (error) throw error;

    return data;
};

export const getPlaylistSongs = async (playlistId: string) => {
    const { data, error } = await supabase
        .from("playlist_songs")
        .select(`
            *,
            music:music_id (
                *,
                user:profiles!music_user_id_fkey (
                    username,
                    avatar_url
                )
            )
        `)
        .eq("playlist_id", playlistId);

    if (error) throw error;

    return data;
};

export const getPlaylist = async (playlistId: string): Promise<PlaylistData> => {
    const [{ data: meta, error: metaError }, songs] = await Promise.all([
        supabase.from("playlists").select("id, name").eq("id", playlistId).single(),
        getPlaylistSongs(playlistId),
    ]);

    if (metaError) throw metaError;
    if (!meta) throw new Error("Playlist not found");

    return { id: meta.id, name: meta.name, songs: songs ?? [] };
};
