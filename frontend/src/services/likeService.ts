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
        .eq("user_id", userId);
    console.log(data)

    if (error) throw error;
    return data;
};