import { useState, useCallback } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { TopBar } from './ui/shell/TopBar'
import { TabBar } from './ui/shell/TabBar'
import { HomeView } from './ui/views/HomeView'
import { CanvasView } from './ui/views/CanvasView'
import { PrintPreview } from './ui/views/PrintPreview'
import { useAppMode } from './hooks/useAppMode'
import { useTheme } from './hooks/useTheme'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { AppContext } from './AppContext'

export default function App() {
  const { mode, setMode } = useAppMode('build')
  useTheme() // initializes theme from localStorage and applies dark/light class on mount
  const navigate = useNavigate()
  const location = useLocation()

  const [openTabs, setOpenTabs] = useState<Array<{ id: string; name: string }>>([])

  const openTab = useCallback((id: string, name: string) => {
    setOpenTabs(tabs => tabs.find(t => t.id === id) ? tabs : [...tabs, { id, name }])
    navigate(`/template/${id}`)
  }, [navigate])

  const closeTab = useCallback((id: string) => {
    setOpenTabs(tabs => {
      const remaining = tabs.filter(t => t.id !== id)
      if (location.pathname === `/template/${id}`) {
        const idx = tabs.findIndex(t => t.id === id)
        const next = remaining[idx] ?? remaining[idx - 1]
        navigate(next ? `/template/${next.id}` : '/')
      }
      return remaining
    })
  }, [location.pathname, navigate])

  const handleModeToggle = useCallback(
    () => setMode(m => m === 'build' ? 'live' : 'build'),
    [setMode],
  )

  useKeyboardShortcuts({
    'b': () => setMode(m => m === 'build' ? 'live' : 'build'),
    'cmd+p': (e) => { e.preventDefault(); window.print() },
    'escape': () => {
      // Close any open panels — dispatched via custom event for child components to handle
      window.dispatchEvent(new CustomEvent('pt:close-panels'))
    },
  })

  // Get current template id from URL for TopBar print button
  const templateIdMatch = location.pathname.match(/^\/template\/([^/]+)/)
  const currentTemplateId = templateIdMatch ? templateIdMatch[1] : undefined

  return (
    <AppContext.Provider value={{ openTab }}>
      <div className="h-screen flex flex-col overflow-hidden">
        <TopBar mode={mode} onModeToggle={handleModeToggle} templateId={currentTemplateId} />
        <TabBar tabs={openTabs} onClose={closeTab} />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/template/:id" element={<CanvasView mode={mode} />} />
            <Route path="/template/:id/print" element={<PrintPreview />} />
          </Routes>
        </main>
      </div>
    </AppContext.Provider>
  )
}
