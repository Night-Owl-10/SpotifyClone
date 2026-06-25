import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

interface UploadedSong {
    thumbnail_public_id?: string | null;
    music_public_id?: string | null;
}

interface DeleteAccountRequestBody {
    userId: string;
    avatar_public_id?: string | null;
    uploads: UploadedSong[];
}

export const deleteAccountController = async (
    req: Request<{}, {}, DeleteAccountRequestBody>,
    res: Response
): Promise<void> => {
    const { userId, avatar_public_id, uploads } = req.body;

    if (!userId) {
        res.status(400).json({ success: false, error: "userId is required" });
        return;
    }

    try {
        // Step 1 — Delete Cloudinary assets for every uploaded song
        for (const song of uploads) {
            if (song.thumbnail_public_id) {
                await cloudinary.uploader.destroy(song.thumbnail_public_id, {
                    resource_type: "image",
                });
            }

            if (song.music_public_id) {
                await cloudinary.uploader.destroy(song.music_public_id, {
                    resource_type: "video",
                });
            }
        }

        // Step 2 — Delete avatar from Cloudinary
        if (avatar_public_id) {
            await cloudinary.uploader.destroy(avatar_public_id, {
                resource_type: "image",
            });
        }

        // Step 3 — Delete the Auth user (requires Service Role Key)
        // This cascades through:
        //   auth.users → profiles → music → liked_songs / playlist_songs / playlists
        // Client is created here (not at module level) so dotenv.config() has already run.
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error("Error deleting auth user:", deleteError);
            res.status(500).json({
                success: false,
                error: deleteError.message,
            });
            return;
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({
            success: false,
            error: "An unexpected error occurred while deleting the account",
        });
    }
};
