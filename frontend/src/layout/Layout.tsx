import Header from '@/components/Header'
import Footer from '@/components/Footer';
import { NavigationSidebar } from '@/components/Sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import AuthProvider from '@/context/AuthContext';

function getDefaultSidebarOpen(): boolean {
    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith('sidebar_state='))
    // If cookie exists and is explicitly "false", start collapsed; otherwise default to open
    if (match) return match.split('=')[1] === 'true'
    return true
}

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <AuthProvider>
                <SidebarProvider defaultOpen={getDefaultSidebarOpen()}>
                    <NavigationSidebar />
                    <SidebarInset className="min-w-0 overflow-hidden">
                        <Header />
                        {children}
                        <Footer />
                    </SidebarInset>
                </SidebarProvider>
            </AuthProvider>
            <Toaster
                position="bottom-right"
            />
        </div>
    )
}

export default Layout;