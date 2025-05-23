import React, { useEffect, useRef } from "react";
import { gcode2Svg } from "../core/gcode2Svg";
import "./GCodeViewer.scss";

export type GCodeViewerProps = {
	gcode?: string,
	className?: string,
	position?: number[]
}

export function GCodeViewer({ gcode, className, position }: GCodeViewerProps) {
	const hostRef = useRef<any>(null);

	useEffect(() => {
		hostRef.current.innerHTML = gcode ? gcode2Svg(gcode)[0] : "";
	}, [gcode]);

	return (
		<div className={`gcode-viewer ${className ?? ''}`}>
			<svg xmlns="http://www.w3.org/2000/svg" version="1.1" preserveAspectRatio="xMidYMid meet" stroke="red" fill="none">
				<defs>
					<pattern id="smallGrid" width="5" height="5" patternUnits="userSpaceOnUse">
						<path d="M 5 0 L 0 0 0 5" fill="none" stroke="#FFFFFF44" strokeWidth="0.5" />
					</pattern>
					<pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
						<rect width="100" height="100" fill="url(#smallGrid)" stroke="none" />
						<path d="M 100 0 L 0 0 0 100" fill="none" stroke="#FFFFFFAA" strokeWidth="1" />
					</pattern>
				</defs>
				<g className="__viewport">
					<rect width="100%" height="100%" fill="url(#grid)" stroke="none" />
					<g ref={hostRef}></g>
					<g>{position && (<circle cx={position[0]} cy={position[1]} r="3" fill="blue" />)}</g>
				</g>
			</svg>
		</div>
	);
}