import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Spinner } from './components/ui/spinner'
import Layout from './layout/Layout'
import './App.css'

const Home = lazy(() => import('./pages/Home'))
const Music = lazy(() => import('./pages/Music'))
const Profile = lazy(() => import('./pages/Profile'))
const LikedMusic = lazy(() => import('./pages/LikedMusic'))
const PlayList = lazy(() => import('./pages/PlayList'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))


function App() {

  return (

    <Layout>
      <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20">
        <Spinner className="size-8" />
      </div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/music/:id" element={<Music />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/liked-music" element={<LikedMusic />} />
          <Route path="/playlist/:id" element={<PlayList />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
      </Suspense>
    </Layout>

  )
}

export default App
