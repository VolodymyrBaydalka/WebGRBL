import { createContext, useContext } from "react"
import { GrblClient } from "../core/grblClient"

export const GrblClientContext = createContext<GrblClient>(new GrblClient());

export function useGrblClient() {
    return useContext(GrblClientContext);
}