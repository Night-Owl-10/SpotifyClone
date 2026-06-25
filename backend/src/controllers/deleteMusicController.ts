import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";

interface DeleteMusicRequestBody {
    thumbnail_public_id?: string | null;
    music_public_id?: string | null;
}

export const deleteMusicController = async (
    req: Request<{}, {}, DeleteMusicRequestBody>,
    res: Response
): Promise<void> => {
    const { thumbnail_public_id, music_public_id } = req.body;

    try {
        // Delete thumbnail from Cloudinary if a public ID exists
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

        // Delete audio from Cloudinary if a public ID exists
        // (Cloudinary stores audio under resource_type: "video")
        if (music_public_id) {
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

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        res.status(500).json({
            success: false,
            error: "An unexpected error occurred while deleting from Cloudinary",
        });
    }
};
