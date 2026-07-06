import SpotifyLogo from "@/assets/Spotify_icon.png";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

function Header() {

    const navigate = useNavigate();
    const { state } = useSidebar();
    const [signInOpen, setSignInOpen] = useState(false);
    const [signUpOpen, setSignUpOpen] = useState(false);
    const { isAuthenticated, profile } = useAuth();

    return (
        <>
            <header>
                <div className=" bg-[#212121] h-16 border border-[#212121] shadow-[-10px_0px_20px_-5px_rgba(0,0,0,0.3)] w-full flex items-center justify-between px-4 md:px-8 overflow-hidden">

                    <SidebarTrigger className={cn("shrink-0", state === "collapsed" ? "rotate-180 transition-transform duration-500 ease-in-out cursor-pointer" : "cursor-pointer")} />

                    <div className=" flex items-center gap-3 w-full max-w-[600px] px-4">
                        <div className="shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden cursor-pointer" onClick={() => navigate("/")}>
                            <img src={SpotifyLogo} className="h-full w-full object-cover" alt="Spotify logo" />
                        </div>
                        <div className="flex-1 min-w-0 border border-white rounded-full overflow-hidden flex items-center pl-4">
                            <Search className="h-4 w-4 shrink-0" />
                            <Input placeholder="Search for songs, artists, albums..." className="h-8 border-0 border-l-0 rounded-none outline-none focus-visible:ring-0" />
                        </div>
                    </div>

                    <div className="shrink-0">
                        {!isAuthenticated ? <Button
                            onClick={() => setSignInOpen(true)}
                            className="w-20 bg-[#1db954] rounded-md p-1 cursor-pointer text-center text-base font-semibold hover:bg-[#1ed760]"
                        >
                            Sign In
                        </Button> :
                            <div className="h-8 w-8 md:h-12 md:w-12 rounded-full overflow-hidden flex justify-center items-center cursor-pointer" onClick={() => navigate(`/profile/${profile?.id}`)}>
                                <img src={profile?.avatar_url} className="h-full w-full object-cover" alt="Profile picture" />
                            </div>
                        }
                    </div>
                </div>
            </header>

            <SignIn
                open={signInOpen}
                onOpenChange={setSignInOpen}
                onSwitchToSignUp={() => setSignUpOpen(true)}
            />
            <SignUp
                open={signUpOpen}
                onOpenChange={setSignUpOpen}
                onSwitchToSignIn={() => setSignInOpen(true)}
            />
        </>
    )
}

export default Header;
