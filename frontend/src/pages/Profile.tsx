import { useState } from "react";
import { Edit, Check, Trash2, ArrowLeft, Loader2 } from "lucide-react";
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
import { dummyData } from "@/utils/dummyData";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { toast } from "sonner";
import { updateProfile } from "@/services/authService";


function Profile() {

    const { isAuthenticated, profile, signOut, setProfile } = useAuth();
    const navigate = useNavigate();

    const [usernameEditing, setUsernameEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>(profile?.avatar_url || "");
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [editedUser, setEditedUser] = useState({
        username: profile?.username || "",
        avatar: profile?.avatar_url || "",
    });
    const [confirmDelete, setConfirmDelete] = useState("");

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
            const imageUrl = response.data.url
            setAvatarPreview(imageUrl)
            setEditedUser({ ...editedUser, avatar: imageUrl });
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

        try {
            const updatedProfile = await updateProfile(
                profile!.id,
                editedUser.username,
                editedUser.avatar
            );

            setProfile(updatedProfile);
            setUsernameEditing(false);
            toast.success("Profile updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        }
    }

    function handleDelete() {

        console.log("Account deletion confirmed");
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
                <button onClick={signOut} className="w-20 bg-[#1db954] text-white px-1 py-1 rounded-md hover:bg-[#1ed760] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200">
                    Sign Out
                </button>
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
                        ) : (
                            <img
                                src={avatarPreview}
                                className="h-full w-full object-cover"
                                alt="Profile avatar"
                            />
                        )}
                        <label
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
                        </label>
                    </div>

                    {/* User info */}
                    <div className="flex flex-col gap-4 items-center md:items-start">
                        {/* Username */}
                        <div className="flex items-center gap-2">
                            {usernameEditing ? (
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
                                    <button
                                        id="username-edit-btn"
                                        type="button"
                                        className="cursor-pointer text-gray-500 hover:text-black transition-colors"
                                        onClick={() => setUsernameEditing(true)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Update button */}
                        <button
                            id="profile-update-btn"
                            type="submit"
                            className="w-28 bg-[#1db954] text-white px-4 py-2 rounded-md hover:bg-[#1ed760] focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200 self-center md:self-start"
                        >
                            Update
                        </button>
                    </div>
                </form>

                {/* Delete Account — with confirmation dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            id="delete-account-trigger-btn"
                            className="w-[200px] bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors duration-200 flex justify-center items-center gap-2 mb-4 md:mb-0"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete Account
                        </button>
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
                            <DialogClose asChild>
                                <button
                                    id="delete-confirm-btn"
                                    onClick={handleDelete}
                                    disabled={confirmDelete !== "DELETE"}
                                    className={clsx(
                                        "w-[160px] text-white text-sm p-2 rounded-md transition-colors duration-200 flex justify-center items-center gap-2",
                                        confirmDelete !== "DELETE"
                                            ? "cursor-not-allowed bg-red-400/50"
                                            : "bg-red-500 hover:bg-red-600"
                                    )}
                                >
                                    <Trash2 className="w-4 h-4 hidden xs:block" />
                                    Confirm Delete
                                </button>
                            </DialogClose>

                            <DialogClose asChild>
                                <button
                                    id="delete-cancel-btn"
                                    className="w-[120px] bg-gray-500 text-white text-sm p-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
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
                        dummyData.length > 0 ? dummyData.map((item) => {
                            return (
                                <Link to={`/music/${item.id}`} key={item.id}>
                                    <div className="flex gap-2 bg-[#212121] border border-[#3b3b3b] rounded-lg cursor-pointer hover:bg-[#2f2f2f] transition-colors duration-200">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden">
                                            <img src={item.thumbnail} className="h-full w-full object-cover" alt="" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs md:text-sm">{item.artist}</p>
                                            <p className="text-xs md:text-sm font-bold">.</p>
                                            <p className="text-xs md:text-sm">{item.uploadedOn}</p>
                                        </div>
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
