import { useState, useEffect } from "react";
import { Edit, Check, Trash2, ArrowLeft, Loader2, DeleteIcon } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import clsx from "clsx";
import UploadDialog from "@/components/Upload";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { toast } from "sonner";
import { updateProfile, getUserById, deleteAccount } from "@/services/authService";
import { getSongsByUserId, deleteMusic } from "@/services/musicService";

type AvatarPreviewType = {
    url: string;
    public_id: string;
}

function Profile() {

    const { id } = useParams();
    const { isAuthenticated, profile, signOut, setProfile, musicRefresh, setMusicRefresh } = useAuth();
    const isOwnProfile = profile?.id === id;
    const navigate = useNavigate();

    const [viewedUser, setViewedUser] = useState(null);
    const [usernameEditing, setUsernameEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<AvatarPreviewType>({
        url: viewedUser?.avatar_url || "",
        public_id: viewedUser?.avatar_public_id || "",
    });
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [music, setMusic] = useState([]);
    const [editedUser, setEditedUser] = useState({
        username: viewedUser?.username || "",
        avatar: viewedUser?.avatar_url || "",
        avatar_public_id: viewedUser?.avatar_public_id || "",
    });
    const [confirmDelete, setConfirmDelete] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingAccount, setDeletingAccount] = useState(false);


    useEffect(() => {
        if (!id) return;

        const fetchUser = async () => {
            const user = await getUserById(id);
            setViewedUser(user);
        };

        fetchUser();
    }, [id]);

    useEffect(() => {
        if (!viewedUser) return;

        setAvatarPreview({ url: viewedUser.avatar_url, public_id: viewedUser.avatar_public_id });

        setEditedUser({
            username: viewedUser.username,
            avatar: viewedUser.avatar_url,
            avatar_public_id: viewedUser.avatar_public_id,
        });
    }, [viewedUser]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setEditedUser((prev) => ({ ...prev, [name]: value }));
    }

    async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        setAvatarLoading(true);
        const img = e.target.files;
        const data = new FormData();
        data.append("file", img ? img[0] : "");
        data.append("upload_preset", "multi-app");
        try {
            const response = await axios.post(`https://api.cloudinary.com/v1_1/dru7e6cnq/image/upload`, data)
            const avatar = {
                url: response.data.secure_url,
                public_id: response.data.public_id,
            };
            setAvatarPreview(avatar)
            setEditedUser(prev => ({
                ...prev,
                avatar: avatar.url,
                avatar_public_id: avatar.public_id,
            }));
        } catch (error) {
            console.log(error);
            toast.error("Error uploading image");
        } finally {
            setAvatarLoading(false);
        }
    }

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editedUser.username.trim()) {
            toast.error("Username is required");
            return;
        }

        console.log({
            avatar: editedUser.avatar,
            avatar_public_id: editedUser.avatar_public_id,
        });

        try {
            const updatedProfile = await updateProfile(
                profile!.id,
                editedUser.username,
                editedUser.avatar,
                editedUser.avatar_public_id
            );

            setProfile(updatedProfile);
            setUsernameEditing(false);
            toast.success("Profile updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        }
    }

    useEffect(() => {
        if (!id)
            return
        async function fetchMusic() {
            const music = await getSongsByUserId(id)
            console.log(music);
            setMusic(music)
        }
        fetchMusic();
    }, [id, musicRefresh]);

    async function handleDelete() {
        if (!profile) return;
        setDeletingAccount(true);
        try {
            // Collect all Cloudinary public IDs from uploaded songs
            const uploads = music.map((song: { thumbnail_public_id?: string; music_public_id?: string }) => ({
                thumbnail_public_id: song.thumbnail_public_id || null,
                music_public_id: song.music_public_id || null,
            }));

            await deleteAccount(
                profile.id,
                viewedUser?.avatar_public_id || null,
                uploads
            );

            // Auth user is deleted — sign out the Supabase session and go home
            await signOut();
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete account. Please try again.");
            setDeletingAccount(false);
        }
    }

    async function handleDeleteMusic(
        e: React.MouseEvent,
        song: { id: string; thumbnail_public_id: string; music_public_id: string }
    ) {
        e.preventDefault(); // prevent Link navigation
        e.stopPropagation();

        if (deletingId) return; // already deleting another song

        setDeletingId(song.id);
        try {
            await deleteMusic({
                id: song.id,
                thumbnail_public_id: song.thumbnail_public_id,
                music_public_id: song.music_public_id,
            });
            setMusic((prev) => prev.filter((s) => s.id !== song.id));
            setMusicRefresh(prev => !prev);
            toast.success("Music deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete music. Please try again.");
        } finally {
            setDeletingId(null);
        }
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />
    }

    return (
        <div className="w-full min-h-screen pt-12 px-4">

            <div className="flex items-center justify-between mb-12">
                <button
                    id="profile-back-btn"
                    onClick={() => navigate("/")}
                    className="bg-gray-500 text-white text-sm px-4 py-2 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center gap-2 transition-colors duration-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                {isOwnProfile && <button onClick={signOut} className="w-20 bg-[#1db954] text-white px-1 py-1 rounded-md hover:bg-[#1ed760] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200">
                    Sign Out
                </button>}
            </div>
            {/* Page title */}
            <h1 className="text-3xl font-bold mb-4">Your Profile</h1>



            {/* Profile card */}
            <div className="w-full min-h-[350px] border-b-1 border-gray-300 shadow-b-md shadow-gray-400 px-8 py-8 md:py-0 gap-10 flex flex-col justify-center items-start mb-16">

                {/* Form — avatar + editable fields + update button */}
                <form
                    id="profile-update-form"
                    onSubmit={handleUpdate}
                    className="w-full flex flex-col md:flex-row justify-start items-center gap-8"
                >
                    {/* Avatar */}
                    <div className="relative h-36 w-36 md:h-48 md:w-48 rounded-full overflow-hidden group flex-shrink-0">
                        {avatarLoading ? (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                            </div>
                        ) : avatarPreview.url ? (
                            <img
                                src={avatarPreview.url}
                                className="h-full w-full object-cover"
                                alt="Profile avatar"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                </svg>
                            </div>
                        )}
                        {isOwnProfile && <label
                            htmlFor="avatar-file"
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                        >
                            {!avatarLoading && <Edit className="text-white w-6 h-6" />}
                            <input
                                type="file"
                                id="avatar-file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>}
                    </div>

                    {/* User info */}
                    <div className="flex flex-col gap-4 items-center md:items-start">
                        {/* Username */}
                        <div className="flex items-center gap-2">
                            {(usernameEditing && isOwnProfile) ? (
                                <>
                                    <input
                                        id="username-input"
                                        className="border-b border-gray-400 bg-transparent rounded-md p-2 text-xl font-semibold focus:outline-none focus:border-blue-500"
                                        type="text"
                                        name="username"
                                        value={editedUser.username}
                                        onChange={handleChange}
                                        autoFocus
                                    />
                                    <button
                                        id="username-confirm-btn"
                                        type="button"
                                        className="cursor-pointer text-gray-600 hover:text-black transition-colors"
                                        onClick={() => setUsernameEditing(false)}
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="text-xl font-semibold">{editedUser.username}</p>
                                    {isOwnProfile && <button
                                        id="username-edit-btn"
                                        type="button"
                                        className="cursor-pointer text-gray-500 hover:text-black transition-colors"
                                        onClick={() => setUsernameEditing(true)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>}
                                </>
                            )}
                        </div>

                        {/* Update button */}
                        {isOwnProfile && <button
                            id="profile-update-btn"
                            type="submit"
                            className="w-28 bg-[#1db954] text-white px-4 py-2 rounded-md hover:bg-[#1ed760] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 self-center md:self-start"
                        >
                            Update
                        </button>}
                    </div>
                </form>

                {/* Delete Account — with confirmation dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        {isOwnProfile && <button
                            id="delete-account-trigger-btn"
                            className="w-[200px] bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors duration-200 flex justify-center items-center gap-2 mb-4 md:mb-0"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete Account
                        </button>}
                    </DialogTrigger>

                    <DialogContent className="w-[300px] xs:w-[400px] sm:w-fit bg-[#121212]">
                        <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
                        <DialogDescription className="mb-2">
                            This action cannot be undone. All your data will be permanently deleted.
                            Type <span className="font-semibold text-foreground">DELETE</span> to confirm.
                        </DialogDescription>

                        <input
                            id="delete-confirm-input"
                            type="text"
                            placeholder="DELETE"
                            value={confirmDelete}
                            onChange={(e) => setConfirmDelete(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                        />

                        <div className="flex justify-center items-center gap-4">
                            <button
                                id="delete-confirm-btn"
                                onClick={handleDelete}
                                disabled={confirmDelete !== "DELETE" || deletingAccount}
                                className={clsx(
                                    "w-[160px] text-white text-sm p-2 rounded-md transition-colors duration-200 flex justify-center items-center gap-2",
                                    confirmDelete !== "DELETE" || deletingAccount
                                        ? "cursor-not-allowed bg-red-400/50"
                                        : "bg-red-500 hover:bg-red-600"
                                )}
                            >
                                {deletingAccount
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Trash2 className="w-4 h-4 hidden xs:block" />}
                                {deletingAccount ? "Deleting..." : "Confirm Delete"}
                            </button>

                            <DialogClose asChild>
                                <button
                                    id="delete-cancel-btn"
                                    disabled={deletingAccount}
                                    className="w-[120px] bg-gray-500 text-white text-sm p-2 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    onClick={() => setConfirmDelete("")}
                                >
                                    Cancel
                                </button>
                            </DialogClose>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>

            <h1 className="text-3xl font-bold mb-4">Your Uploads</h1>

            <div className="mb-12 p-8">
                <UploadDialog />
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
                    {
                        music.length > 0 ? music.map((item) => {
                            return (
                                <Link to={`/music/${item.id}`} key={item.id}>
                                    <div className="flex gap-2 bg-[#212121] border border-[#3b3b3b] rounded-lg cursor-pointer hover:bg-[#2f2f2f] transition-colors duration-200">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden">
                                            <img src={item.thumbnail_url} className="h-full w-full object-cover" alt="" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs md:text-sm line-clamp-1">{item.title}</p>
                                            <p className="text-xs md:text-sm font-bold">.</p>
                                            <p className="text-xs md:text-sm line-clamp-1">{item.created_at.slice(0, 10)}</p>
                                        </div>

                                        <button
                                            id={`delete-song-btn-${item.id}`}
                                            className="flex justify-center items-center w-10 ml-auto cursor-pointer bg-red-900 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md py-2 transition-colors duration-200"
                                            disabled={deletingId === item.id}
                                            onClick={(e) => handleDeleteMusic(e, item)}
                                            title="Delete song"
                                        >
                                            {deletingId === item.id
                                                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                : <DeleteIcon className="w-4 h-4 text-white" />}
                                        </button>
                                    </div>
                                </Link>
                            )
                        })
                            : <p>No uploads found</p>
                    }
                </div>
            </div>
        </div>
    );
}

export default Profile;
