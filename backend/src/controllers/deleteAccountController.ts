import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const deleteAccountController = async (
    req: Request<{}, {}, { profileId?: string }>,
    res: Response
): Promise<void> => {
    // ── 1. Extract the bearer token ───────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, error: "Missing or invalid Authorization header" });
        return;
    }
    const accessToken = authHeader.slice(7);

    // ── 2. Validate that the client sent the target profile ID ────────────────
    const { profileId } = req.body;
    if (!profileId) {
        res.status(400).json({ success: false, error: "profileId is required" });
        return;
    }

    try {
        // ── 3. Verify the token and get the authenticated user ─────────────────
        const supabaseUser = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: `Bearer ${accessToken}` } },
                auth: { autoRefreshToken: false, persistSession: false },
            }
        );

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
            res.status(401).json({ success: false, error: "Invalid or expired access token" });
            return;
        }

        // ── 4. Ownership check — the caller must be deleting their OWN account ─
        // This prevents a signed-in user from triggering the deletion while
        // browsing another user's profile page (e.g., via DevTools).
        if (user.id !== profileId) {
            res.status(403).json({ success: false, error: "You can only delete your own account." });
            return;
        }

        // ── 3. Read the avatar public ID from the profiles table ───────────────
        const { data: profile, error: profileError } = await supabaseUser
            .from("profiles")
            .select("avatar_public_id")
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("Error fetching profile:", profileError);
            res.status(500).json({ success: false, error: "Failed to fetch profile" });
            return;
        }

        // ── 4. Read all music Cloudinary IDs belonging to this user ───────────
        const { data: songs, error: songsError } = await supabaseUser
            .from("music")
            .select("thumbnail_public_id, music_public_id")
            .eq("user_id", user.id);

        if (songsError) {
            console.error("Error fetching songs:", songsError);
            res.status(500).json({ success: false, error: "Failed to fetch music" });
            return;
        }

        // ── 5. Delete Cloudinary assets for every song ────────────────────────
        // (IDs come exclusively from the database — never from the client)
        for (const song of songs ?? []) {
            if (song.thumbnail_public_id) {
                await cloudinary.uploader.destroy(song.thumbnail_public_id, {
                    resource_type: "image",
                });
            }
            if (song.music_public_id) {
                // Cloudinary stores audio under resource_type "video"
                await cloudinary.uploader.destroy(song.music_public_id, {
                    resource_type: "video",
                });
            }
        }

        // ── 6. Delete avatar from Cloudinary ──────────────────────────────────
        if (profile?.avatar_public_id) {
            await cloudinary.uploader.destroy(profile.avatar_public_id, {
                resource_type: "image",
            });
        }

        // ── 7. Delete the auth user (service-role, cascades through DB) ───────
        // Cascade path: auth.users → profiles → music → liked_songs / playlist_songs / playlists
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { autoRefreshToken: false, persistSession: false },
            }
        );

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error("Error deleting auth user:", deleteError);
            res.status(500).json({ success: false, error: deleteError.message });
            return;
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in deleteAccountController:", error);
        res.status(500).json({
            success: false,
            error: "An unexpected error occurred while deleting the account",
        });
    }
};
