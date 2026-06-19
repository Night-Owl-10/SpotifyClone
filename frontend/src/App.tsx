import './App.css'
import Home from './pages/Home'
import Header from './components/Header'
import { NavigationSidebar } from './components/Sidebar'
import { SidebarProvider, SidebarInset } from './components/ui/sidebar'

function App() {
  return (
    <SidebarProvider>
      <NavigationSidebar />
      <SidebarInset>
        <Header />
        <Home />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App
