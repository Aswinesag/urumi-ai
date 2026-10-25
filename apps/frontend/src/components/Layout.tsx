
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <main
      style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#242424',
      }}
    >
      <Outlet />
    </main>
  )
}