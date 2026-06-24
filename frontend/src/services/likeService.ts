import { supabase } from "@/lib/supabase";

export const likeSong = async (userId: string, musicId: string) => {
    const { data, error } = await supabase
        .from("liked_songs")
        .insert({
            user_id: userId,
            music_id: musicId,
        });

    if (error) throw error;

    return data;
};

export const unlikeSong = async (userId: string, musicId: string) => {
    const { data, error } = await supabase
        .from("liked_songs")
        .delete()
        .eq("user_id", userId)
        .eq("music_id", musicId);

    if (error) throw error;

    return data;
};

export const getAllLikedSongs = async (userId: string) => {
    const { data, error } = await supabase
        .from("liked_songs")
        .select("*")
        .eq("user_id", userId)

    if (error) throw error;

    return data;
};