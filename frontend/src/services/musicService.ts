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

interface DeleteMusicParams {
    id: string;
    thumbnail_public_id: string;
    music_public_id: string;
}

export const deleteMusic = async ({ id, thumbnail_public_id, music_public_id }: DeleteMusicParams): Promise<void> => {
    // Step 1: Delete both Cloudinary assets via the backend
    // This MUST happen before the database row is deleted so we still have the public IDs.
    const response = await axios.post(`${API_URL}/api/delete-music`, {
        thumbnail_public_id,
        music_public_id,
    });

    if (!response.data.success) {
        throw new Error(response.data.error || "Failed to delete from Cloudinary");
    }

    // Step 2: Delete the row from Supabase (liked_songs and playlist_songs cascade automatically)
    const { error } = await supabase
        .from("music")
        .delete()
        .eq("id", id);

    if (error) throw error;
}