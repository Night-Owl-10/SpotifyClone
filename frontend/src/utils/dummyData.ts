import Thumbnail from "@/assets/5452093.jpg";
import ProfilePic from "@/assets/images.jpg";

type songData = {
    id: number;
    name: string;
    artist: string;
    thumbnail: string;
    artistProfilePic: string;
    uploadedOn: string;
}

export const dummyData: songData[] = [
    {
        id: 1,
        name: "Faded",
        artist: "Alan Walker",
        thumbnail: Thumbnail,
        artistProfilePic: ProfilePic,
        uploadedOn: "24-08-2022"
    },
    {
        id: 2,
        name: "Faded",
        artist: "Alan Walker",
        thumbnail: Thumbnail,
        artistProfilePic: ProfilePic,
        uploadedOn: "24-08-2022"
    },
    {
        id: 3,
        name: "Faded",
        artist: "Alan Walker",
        thumbnail: Thumbnail,
        artistProfilePic: ProfilePic,
        uploadedOn: "24-08-2022"
    },
    {
        id: 4,
        name: "Faded",
        artist: "Alan Walker",
        thumbnail: Thumbnail,
        artistProfilePic: ProfilePic,
        uploadedOn: "24-08-2022"
    },
    {
        id: 5,
        name: "Faded",
        artist: "Alan Walker",
        thumbnail: Thumbnail,
        artistProfilePic: ProfilePic,
        uploadedOn: "24-08-2022"
    },
]