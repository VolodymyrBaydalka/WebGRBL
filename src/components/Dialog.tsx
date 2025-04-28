import React, { useEffect, useRef } from "react";

export function Dialog({ children }) {
    const hostRef = useRef<any>(null);
    useEffect(() => hostRef.current.showModal(), [])
    return <dialog ref={hostRef}>{children}</dialog>
}