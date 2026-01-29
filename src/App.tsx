import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { RightPanel } from './components/layout/RightPanel'
import { MobileNav } from './components/layout/MobileNav'
import { CalendarView } from './components/calendar/CalendarView'
import { MobileTodoPanel } from './components/todo/MobileTodoPanel'

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('weekly')

  const handleViewChange = (view: string) => {
    setActiveView(view)
  }

  const isTodosView = activeView === 'todos'

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <Sidebar
        activeView={activeView}
        onChangeView={handleViewChange}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <RightPanel />

      {/* Main content area */}
      <main className="pt-14 pb-14 lg:pl-64 lg:pr-80 lg:pb-0">
        <div className="h-[calc(100vh-7rem)] lg:h-[calc(100vh-3.5rem)]">
          {/* Mobile: Show MobileTodoPanel when todos tab is selected */}
          {isTodosView ? (
            <div className="h-full lg:hidden">
              <MobileTodoPanel />
            </div>
          ) : null}

          {/* Desktop: Always show CalendarView */}
          {/* Mobile: Show CalendarView only when not in todos view */}
          <div className={`h-full ${isTodosView ? 'hidden lg:block' : ''}`}>
            <CalendarView view={activeView} onViewChange={handleViewChange} />
          </div>
        </div>
      </main>

      <MobileNav activeTab={activeView} onChangeTab={handleViewChange} />
    </div>
  )
}

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </DndProvider>
  )
}

export default App
