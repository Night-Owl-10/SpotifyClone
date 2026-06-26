import { supabase } from "@/lib/supabase";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getAllSongs = async () => {
    const { data, error } = await supabase
        .from("music")
        .select(`
                    *,
                    user:profiles!music_user_id_fkey (
                    username,
                    avatar_url
                    )
                `)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
}

export const getSongById = async (id: string) => {
    const { data, error } = await supabase
        .from("music")
        .select(`
                    *,
                    user:profiles!music_user_id_fkey (
                    username,
                    avatar_url
                    )
                `)
        .eq("id", id)
        .single();

    if (error) throw error;

    return data;
}

export const getSongsByUserId = async (userId: string) => {
    const { data, error } = await supabase
        .from("music")
        .select(`
                    *,
                    user:profiles!music_user_id_fkey (
                    username,
                    avatar_url
                    )
                `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
}

export const uploadMusic = async (userId: string, title: string, musicUrl: string, musicPublicId: string, thumbnailUrl: string, thumbnailPublicId: string) => {
    const { data, error } = await supabase
        .from("music")
        .insert({
            user_id: userId,
            title,
            music_url: musicUrl,
            thumbnail_url: thumbnailUrl,
            thumbnail_public_id: thumbnailPublicId,
            music_public_id: musicPublicId,
        });

    if (error) throw error;

    return data;
}

export const deleteMusic = async (
    { id }: { id: string },
    accessToken: string
): Promise<void> => {
    // The backend authenticates the caller's JWT, verifies ownership,
    // reads the Cloudinary IDs from the DB, deletes the assets, then
    // deletes the row — all in a single authoritative request.
    const response = await axios.post(
        `${API_URL}/api/delete-music`,
        { id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.data.success) {
        throw new Error(response.data.error || "Failed to delete music");
    }
}
