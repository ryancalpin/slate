import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-[rgb(var(--color-surface))]">
      <Routes>
        <Route path="/" element={<div className="p-8 text-accent-DEFAULT">Patient Template Builder — scaffold OK</div>} />
      </Routes>
    </div>
  )
}
