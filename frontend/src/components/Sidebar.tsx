import { Sidebar, SidebarContent, SidebarGroup, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Plus, Heart, Music, Book } from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { cn } from "@/lib/utils";

export function NavigationSidebar() {

    const playListArray: string[] = ["Playlist 1", "Playlist 2", "Playlist 3", "Playlist 4", "Playlist 5"];

    const { state } = useSidebar();

    return (
        <TooltipProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader >
                    <div className="flex items-center justify-center gap-2 pb-3 mb-2 border-0 border-b-1">
                        <Book className={cn("text-white", state === "collapsed" ? "h-6 w-6" : "h-8 w-8")} />
                        {state === "expanded" && (
                            <h1 className="text-white font-semibold text-3xl  ">Library</h1>
                        )}
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <div className={cn("flex items-center justify-between gap-2 border border-white rounded-full w-fit cursor-pointer mb-2", state === "collapsed" ? "p-2" : "py-1 px-3")}>
                            <Plus className="h-4 w-4" />
                            {state === "expanded" && (
                                <span className="text-white font-semibold text-base">Create Playlist</span>
                            )}
                        </div>
                    </SidebarGroup>
                    <SidebarGroup>
                        <div className={cn("flex items-center justify-start gap-2 rounded-md  cursor-pointer ", state === "collapsed" ? "p-0" : "p-2 hover:bg-[#535353]")}>
                            <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center bg-linear-to-b from-violet-500 to-indigo-500">
                                <Heart className={cn(" text-white", state === "collapsed" ? "h-4 w-4" : "h-6 w-6")} />
                            </div>
                            {state === "expanded" && (
                                <div className="flex flex-col items-start justify-around">
                                    <p className="text-white text-base">Liked Playlists</p>
                                    <p className="text-white font-semibold text-base">0 Songs</p>
                                </div>
                            )}

                        </div>
                    </SidebarGroup>
                    {playListArray.map((playlist) => (
                        <SidebarGroup>
                            <div className={cn("flex items-center justify-start gap-2 rounded-md  cursor-pointer ", state === "collapsed" ? "p-0" : "p-2 hover:bg-[#535353]")}>
                                <div className="h-10 w-10 rounded-md overflow-hidden flex items-center justify-center bg-[#535353]">
                                    <Music className={cn(" text-white", state === "collapsed" ? "h-4 w-4" : "h-6 w-6")} />
                                </div>

                                {state === "expanded" && (
                                    <div className="flex flex-col items-start justify-around">
                                        <p className="text-white text-base">{playlist}</p>
                                        <p className="text-white font-semibold text-base">0 Songs</p>
                                    </div>
                                )}
                            </div>
                        </SidebarGroup>
                    ))}
                </SidebarContent>
                <SidebarFooter />
            </Sidebar>
        </TooltipProvider>
    );
}