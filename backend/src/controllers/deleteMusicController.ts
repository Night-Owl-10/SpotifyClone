import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

interface DeleteMusicRequestBody {
    id: string;
}

export const deleteMusicController = async (
    req: Request<{}, {}, DeleteMusicRequestBody>,
    res: Response
): Promise<void> => {
    // ── 1. Extract the bearer token ───────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, error: "Missing or invalid Authorization header" });
        return;
    }
    const accessToken = authHeader.slice(7); // strip "Bearer "

    // ── 2. Validate request body ───────────────────────────────────────────────
    const { id } = req.body;
    if (!id) {
        res.status(400).json({ success: false, error: "Music id is required" });
        return;
    }

    try {
        // ── 3. Verify the token and get the authenticated user ─────────────────
        // Use the user-scoped client so RLS applies to the ownership query.
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

        // ── 4. Verify ownership — query music WHERE id = ? AND user_id = auth user ──
        // Because we are using the user-scoped client, RLS also enforces this.
        const { data: song, error: fetchError } = await supabaseUser
            .from("music")
            .select("id, thumbnail_public_id, music_public_id")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (fetchError || !song) {
            res.status(403).json({ success: false, error: "You are not allowed to delete this music." });
            return;
        }

        // ── 5. Delete Cloudinary assets (IDs come from the DB, never from the client) ──
        const { thumbnail_public_id, music_public_id } = song;

        if (thumbnail_public_id) {
            const thumbnailResult = await cloudinary.uploader.destroy(
                thumbnail_public_id,
                { resource_type: "image" }
            );

            if (thumbnailResult.result !== "ok" && thumbnailResult.result !== "not found") {
                res.status(500).json({
                    success: false,
                    error: `Failed to delete thumbnail from Cloudinary: ${thumbnailResult.result}`,
                });
                return;
            }
        }

        if (music_public_id) {
            // Cloudinary stores audio files under resource_type "video"
            const musicResult = await cloudinary.uploader.destroy(
                music_public_id,
                { resource_type: "video" }
            );

            if (musicResult.result !== "ok" && musicResult.result !== "not found") {
                res.status(500).json({
                    success: false,
                    error: `Failed to delete audio from Cloudinary: ${musicResult.result}`,
                });
                return;
            }
        }

        // ── 6. Delete the database row using the service-role client ──────────
        // Ownership has been verified above; the admin client bypasses RLS only
        // for this final deletion so we get a clean, authoritative delete.
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { autoRefreshToken: false, persistSession: false },
            }
        );

        const { error: deleteError } = await supabaseAdmin
            .from("music")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (deleteError) {
            console.error("Error deleting music row:", deleteError);
            res.status(500).json({ success: false, error: deleteError.message });
            return;
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error in deleteMusicController:", error);
        res.status(500).json({
            success: false,
            error: "An unexpected error occurred while deleting the music",
        });
    }
};
