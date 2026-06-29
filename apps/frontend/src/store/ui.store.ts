import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  isSidebarOpen: boolean
  theme: Theme

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        isSidebarOpen: true,
        theme: 'system',

        toggleSidebar: () =>
          set(s => ({ isSidebarOpen: !s.isSidebarOpen }), false, 'ui/toggleSidebar'),

        setSidebarOpen: (open) =>
          set({ isSidebarOpen: open }, false, 'ui/setSidebarOpen'),

        setTheme: (theme) => {
          // Apply to DOM
          const root = document.documentElement
          if (theme === 'dark') root.classList.add('dark')
          else if (theme === 'light') root.classList.remove('dark')
          else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (prefersDark) root.classList.add('dark')
            else root.classList.remove('dark')
          }
          set({ theme }, false, 'ui/setTheme')
        },
      }),
      {
        name: 'nutriscan_ui',
        partialize: s => ({ theme: s.theme, isSidebarOpen: s.isSidebarOpen }),
        onRehydrateStorage: () => state => {
          // Apply theme on hydration
          if (state?.theme) {
            const root = document.documentElement
            const t = state.theme
            if (t === 'dark') root.classList.add('dark')
            else if (t === 'light') root.classList.remove('dark')
            else {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
              if (prefersDark) root.classList.add('dark')
              else root.classList.remove('dark')
            }
          }
        },
      }
    ),
    { name: 'UIStore' }
  )
)
