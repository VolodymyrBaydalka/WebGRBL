import React, { useMemo, useRef } from "react";
import "./GCodeViewer.scss";
import { Viewport3D } from "../components/Viewport3D";
import { gcode2ThreeModel } from "../core/gcode2ThreeModel";

export type GCodeViewerProps = {
	gcode?: string,
	className?: string,
	position?: number[]
}

export function GCodeViewer3D({ gcode, className, position }: GCodeViewerProps) {
	const hostRef = useRef<any>(null);
	const [model] = useMemo(() => gcode2ThreeModel(gcode ?? ""), [gcode]);

	return (
		<div ref={hostRef} className={`gcode-viewer ${className ?? ''}`}>
			<Viewport3D model={model}/>
		</div>
	);
}