import { createContext, useContext } from "react"

export const defaultSettings = {
    jogStep: 60,
    jogFeed: 1800
}

export const SettingsContext = createContext(defaultSettings);

export function useSettings() {
    return useContext(SettingsContext);
}