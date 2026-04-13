import { useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { TopBar } from './ui/shell/TopBar'
import { HomeView } from './ui/views/HomeView'
import { CanvasView } from './ui/views/CanvasView'
import { useAppMode } from './hooks/useAppMode'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { mode, setMode } = useAppMode('build')
  useTheme() // initializes theme from localStorage and applies dark/light class on mount

  const handleModeToggle = useCallback(
    () => setMode(m => m === 'build' ? 'live' : 'build'),
    [setMode],
  )

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar mode={mode} onModeToggle={handleModeToggle} />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/template/:id" element={<CanvasView mode={mode} />} />
        </Routes>
      </main>
    </div>
  )
}
