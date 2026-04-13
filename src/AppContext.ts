import { createContext, useContext } from 'react'

interface AppContextValue {
  openTab: (id: string, name: string) => void
}

export const AppContext = createContext<AppContextValue>({ openTab: () => {} })
export const useAppContext = () => useContext(AppContext)
