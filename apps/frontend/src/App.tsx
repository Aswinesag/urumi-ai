
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import MCPTools from './pages/MCPTools'
import AuditLogs from './pages/AuditLogs'
import AccessControl from './pages/AccessControl'

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/mcp-tools" element={<MCPTools />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/access-control" element={<AccessControl />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App