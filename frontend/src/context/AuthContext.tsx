import { createContext, useState, useEffect, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profile = {
    id: string;
    username: string;
    email: string;
    avatar_url: string;
}

type AuthContextType = {
    user: User | null;
    profile: Profile | null;
    setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
    musicRefresh: boolean;
    setMusicRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    playlistRefresh: boolean;
    setPlaylistRefresh: React.Dispatch<React.SetStateAction<boolean>>;
};



export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [musicRefresh, setMusicRefresh] = useState(false);
    const [playlistRefresh, setPlaylistRefresh] = useState(false);

    useEffect(() => {

        const getAuthData = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                setProfile(profile);
            }
            setLoading(false);
        };

        getAuthData();

        const fetchProfile = async (userId: string) => {
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            setProfile(profile);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();

        setUser(null);
        setSession(null);
        setProfile(null);
    };

    const isAuthenticated = user !== null;

    return (
        <AuthContext.Provider value={{
            user,
            session,
            profile,
            loading,
            signOut,
            isAuthenticated,
            setProfile,
            musicRefresh,
            setMusicRefresh,
            playlistRefresh,
            setPlaylistRefresh
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
