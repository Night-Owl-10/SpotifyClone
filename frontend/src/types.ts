// Shared domain types for the Spotify Clone frontend

export type SongUser = {
    username: string;
    avatar_url: string;
};

export type Song = {
    id: string;
    title: string;
    music_url: string;
    thumbnail_url: string;
    user_id: string;
    created_at: string;
    user: SongUser | null;
};

export type LikedSong = {
    id: string;
    user_id: string;
    music_id: string;
    music: Song & { user: SongUser | null };
};

export type PlaylistSong = {
    music: Song & { user: SongUser | null };
};

export type UserProfile = {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
    avatar_public_id: string;
};
