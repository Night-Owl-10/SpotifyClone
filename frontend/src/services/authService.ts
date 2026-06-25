import { supabase } from "@/lib/supabase";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
        provider: "google",
    });
};


export const signUp = async (
    username: string,
    email: string,
    password: string,
    avatar: string,
    avatarPublicId: string
) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
                avatar_url: avatar,
                avatar_public_id: avatarPublicId,
            },
        },
    });

    if (error) throw error;

    if (!data.user) {
        throw new Error("User not created");
    }

    console.log("USER:", data.user);
    console.log("SESSION:", data.session);

    return data;
};


export const signIn = async (
    email: string,
    password: string
) => {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password,
        });

    if (error) throw error;

    console.log("USER:", data.user);
    console.log("SESSION:", data.session);

    return data;
};

export const updateProfile = async (
    userId: string,
    username: string,
    avatar_url: string,
    avatar_public_id: string
) => {
    const { data, error } = await supabase
        .from("profiles")
        .update({
            username,
            avatar_url,
            avatar_public_id
        })
        .eq("id", userId)
        .select()
        .single();

    if (error) throw error;

    return data;
};

export const getUserById = async (id: string) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    return data;
};

interface UploadedSong {
    thumbnail_public_id?: string | null;
    music_public_id?: string | null;
}

export const deleteAccount = async (
    userId: string,
    avatar_public_id: string | null | undefined,
    uploads: UploadedSong[]
): Promise<void> => {
    const response = await axios.post(`${API_URL}/api/delete-account`, {
        userId,
        avatar_public_id: avatar_public_id || null,
        uploads,
    });

    if (!response.data.success) {
        throw new Error(response.data.error || "Failed to delete account");
    }
};