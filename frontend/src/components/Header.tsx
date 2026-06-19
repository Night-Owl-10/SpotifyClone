import SpotifyLogo from "@/assets/Spotify_icon.png";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function Header() {

    const { state } = useSidebar();

    return (
        <header>
            <div className="bg-[#212121] h-16 border border-[#212121] shadow-[-10px_0px_20px_-5px_rgba(0,0,0,0.3)] w-full flex justify-between items-center gap-4 px-4 md:px-8">

                <SidebarTrigger className={cn(state === "collapsed" ? "rotate-180 transition-transform duration-500 ease-in-out cursor-pointer" : "cursor-pointer")} />

                <div className="flex w-[600px] justify-center items-center gap-4 px-2 md:px-4">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden cursor-pointer">
                        <img src={SpotifyLogo} className="h-full w-full object-cover" alt="Spotify logo" />
                    </div>
                    <div className="w-full border border-1 border-white rounded-full overflow-hidden flex items-center pl-4">
                        <Search className="h-4 w-4" />
                        <Input placeholder="Search for songs, artists, albums..." className="h-8 md:h-10 border-0 border-l-0 rounded-none outline-none focus-visible:ring-0 " />
                    </div>
                </div>
                <div className="relative">
                    <Button className="w-20 bg-[#1db954] rounded-md p-1 cursor-pointer text-center text-base font-semibold hover:bg-[#1ed760]">
                        Sign In
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default Header;

