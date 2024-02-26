import { useRef } from "react"
import React, { useEffect } from "react";
import "./GCodeViewer.scss";
import { gcode2Svg } from "../core/gcode2Svg";

export function GCodeViewer({ gcode }) {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        hostRef.current.innerHTML = gcode ? gcode2Svg(gcode) : "";
    }, [gcode]);

    return (<div ref={hostRef} className="gcode-viewer"></div>);
}