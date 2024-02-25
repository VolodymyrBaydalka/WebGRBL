import React, {  } from "react";
import { GCodeSender } from "./GCodeSender/GCodeSender";
import "./App.scss";

export function App() {
	return (
		<main>
			<header>Web GRBL</header>
			<GCodeSender gcode={""}/>
		</main>
	);
}