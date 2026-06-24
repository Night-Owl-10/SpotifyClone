import { supabase } from "@/lib/supabase";

export const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
        provider: "google",
    });
};


export const signUp = async (
    username: string,
    email: string,
    password: string,
    avatar: string
) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
                avatar_url: avatar,
            },
        },
    });

    if (error) throw error;

    if (!data.user) {
        throw new Error("User not created");
    }

    // const { error: profileError } = await supabase
    //     .from("profiles")
    //     .insert({
    //         id: data.user.id,
    //         email,
    //         username,
    //         avatar_url: avatar,
    //     });

    // if (profileError) throw profileError;

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
    avatar_url: string
) => {
    const { data, error } = await supabase
        .from("profiles")
        .update({
            username,
            avatar_url,
        })
        .eq("id", userId)
        .select()
        .single();

    if (error) throw error;

    return data;
};