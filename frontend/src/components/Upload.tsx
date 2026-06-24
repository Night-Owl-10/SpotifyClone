import { useState, useRef } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Upload, Music2, ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { uploadMusic } from "@/services/musicService";
import { useAuth } from "@/hooks/useAuth";

function UploadDialog() {

    const { profile } = useAuth();

    const [musicFile, setMusicFile] = useState<string | null>(null);
    const [musicFileName, setMusicFileName] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<string | null>(null);
    const [thumbnailFileName, setThumbnailFileName] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const musicInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    async function handleMusicChange(e: React.ChangeEvent<HTMLInputElement>) {
        // const file = e.target.files?.[0];
        // if (!file) return;
        // setMusicFile(file);

        setLoading(true);
        const img = e.target.files;
        setMusicFileName(img?.[0] || null);
        const data = new FormData();
        data.append("file", img ? img[0] : "");
        data.append("upload_preset", "multi-app");
        try {
            const response = await axios.post(`https://api.cloudinary.com/v1_1/dru7e6cnq/video/upload`, data)
            const musicUrl = response.data.url
            setMusicFile(musicUrl);
        } catch (error) {
            console.log(error);
            toast.error("Error uploading music");
        } finally {
            setLoading(false);
        }
    }

    async function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
        setLoading(true);
        const img = e.target.files;
        setThumbnailFileName(img?.[0] || null);
        const data = new FormData();
        data.append("file", img ? img[0] : "");
        data.append("upload_preset", "multi-app");
        try {
            const response = await axios.post(`https://api.cloudinary.com/v1_1/dru7e6cnq/image/upload`, data)
            const imageUrl = response.data.url
            setThumbnailFile(imageUrl);
        } catch (error) {
            console.log(error);
            toast.error("Error uploading image");
        } finally {
            setLoading(false);
        }
    }

    function handleReset() {
        setMusicFile(null);
        setTitle("");
        setThumbnailFile(null);
        if (musicInputRef.current) musicInputRef.current.value = "";
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!musicFile || !title || !thumbnailFile) {
            toast.error("Please fill in all the fields");
            return;
        }
        setLoading(true);
        try {
            await uploadMusic(profile?.id, title, musicFile, thumbnailFile);
            toast.success("Music uploaded successfully");
            handleReset();
        } catch (error) {
            console.log(error);
            toast.error("Error uploading music");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog onOpenChange={(open) => { if (!open) handleReset(); }}>
            {/* Trigger — the green Upload Music button */}
            <DialogTrigger asChild>
                <Button
                    id="upload-music-btn"
                    className="w-36 bg-[#1db954] rounded-md p-1 cursor-pointer text-center text-base font-semibold hover:bg-[#1ed760] mb-12"
                >
                    <Upload className="w-4 h-4" /> Upload Music
                </Button>
            </DialogTrigger>

            {/* Dialog content — dark Spotify-themed card */}
            <DialogContent
                showCloseButton={false}
                className="bg-[#121212] border border-[#3b3b3b] text-white rounded-xl w-[90vw] max-w-md p-0 overflow-hidden"
            >
                {/* Header bar */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#3b3b3b]">
                    <div className="flex items-center gap-2">
                        <Music2 className="w-6 h-6 text-[#1db954]" />
                        <DialogTitle className="text-lg font-bold text-white tracking-wide">
                            Upload Music
                        </DialogTitle>
                    </div>
                    <DialogClose asChild>
                        <button
                            id="upload-dialog-close-btn"
                            className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
                            onClick={handleReset}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </DialogClose>
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">

                    {/* Upload Music File */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300 tracking-wide">
                            Upload Music
                        </label>
                        <div
                            onClick={() => musicInputRef.current?.click()}
                            className="flex items-center gap-3 w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg px-4 py-3 cursor-pointer hover:border-[#1db954] transition-colors duration-200 group"
                        >
                            <Music2 className="w-5 h-5 text-[#1db954] shrink-0" />
                            <span className={`text-sm line-clamp-1 ${musicFile ? "text-white" : "text-gray-500"}`}>
                                {musicFile ? musicFileName?.name : "Choose an audio file…"}
                            </span>
                            <input
                                ref={musicInputRef}
                                id="music-file-input"
                                type="file"
                                accept="audio/*"
                                onChange={handleMusicChange}
                                className="hidden"
                            />
                        </div>
                        {musicFile && (
                            <p className="text-xs text-gray-500">
                                {(musicFileName?.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        )}
                    </div>

                    {/* Music Title */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="music-title-input" className="text-sm font-semibold text-gray-300 tracking-wide">
                            Music Title
                        </label>
                        <input
                            id="music-title-input"
                            type="text"
                            placeholder="Enter a title for your track"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#3b3b3b] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1db954] transition-colors duration-200"
                        />
                    </div>

                    {/* Upload Thumbnail */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300 tracking-wide">
                            Upload Thumbnail
                        </label>
                        <div
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="flex items-center gap-3 w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg px-4 py-3 cursor-pointer hover:border-[#1db954] transition-colors duration-200"
                        >
                            {thumbnailFile ? (
                                <img
                                    src={thumbnailFile}
                                    alt="Thumbnail preview"
                                    className="h-10 w-10 rounded-md object-cover shrink-0"
                                />
                            ) : (
                                <ImagePlus className="w-5 h-5 text-[#1db954] shrink-0" />
                            )}
                            <span className={`text-sm truncate ${thumbnailFile ? "text-white" : "text-gray-500"}`}>
                                {thumbnailFile ? thumbnailFileName?.name : "Choose a thumbnail image…"}
                            </span>
                            <input
                                ref={thumbnailInputRef}
                                id="thumbnail-file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {
                        loading && (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 text-[#1db954] shrink-0 animate-spin" />
                                <span className="text-sm text-gray-500">Uploading...</span>
                            </div>
                        )
                    }

                    {/* Action buttons */}
                    <div className="flex justify-end items-center gap-3 pt-2 pb-1">
                        <DialogClose asChild>
                            <button
                                type="button"
                                id="upload-cancel-btn"
                                onClick={handleReset}
                                className="px-5 py-2 rounded-full bg-[#2a2a2a] border border-[#3b3b3b] text-gray-300 text-sm font-medium hover:bg-[#333] hover:text-white transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </DialogClose>
                        <button
                            type="submit"
                            id="upload-submit-btn"
                            className="px-6 py-2 rounded-full bg-[#1db954] text-black text-sm font-bold hover:bg-[#1ed760] transition-colors duration-200 flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default UploadDialog;
