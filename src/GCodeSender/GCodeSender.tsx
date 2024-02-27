import React, { useEffect, useState } from "react";
import { useGrblClient } from "../hooks/useGrblClient";
import "./GCodeSender.scss";
import { JogPad } from "./JogPad";
import { GCodeViewer } from "./GCodeViewer";
import { image2GCode } from "../core/image2GCode";
import { svg2GCode } from "../core/svg2GCode";

export function GCodeSender({ gcode }) {
	const conn = useGrblClient();
	const [connected, setConnected] = useState(false);
	const [actualGCode, setActualGCode] = useState("");
	const [status, setStatus] = useState<any>({ status: "None" });
	const [logs, setLogs] = useState<any[]>([]);

	useEffect(() => {
		conn.onMessage = ev => {
			if (ev.type == "status") {
				setStatus({ status: ev.status, position: ev.position, queued: conn.queueSize });
			} else {
				setLogs(prev => [...prev, { 
					text: `${ev.type == "request" ? "<<" : ">>"} ${ev.message}`,
					className: ev.message.startsWith("ok") ? "text-success" : (ev.message.startsWith("error:") ? "text-danger" : "")
				}]);
			}
		}
	}, [conn]);

	useEffect(() => {
		setActualGCode(gcode);
	}, [gcode]);

	const handleConnectClick = async () => {
		if(('serial' in navigator)) {
			alert("Your browser doesn't support Web Serial API. Please try Chrome for desktop.")
			return;
		} 

		const res = await conn.connect();
		setConnected(res);
		setStatus({ status: "Connecting" });
	}

	const handleDisconnectClick = async () => {
		await conn.disconnect();
		setConnected(false);
		setStatus({ status: "Disconnected" });
	}

	const handleSendClick = async () => {
		if (connected) {
			await conn.sendGcode(actualGCode);
			//setActualGCode("");
		}
	}

	const handleStopClick = () => conn.stop();

	const handleKeyDown = (ev: any) => {
		if (ev.key === 'Enter' && ev.shiftKey) {
			handleSendClick();
			ev.preventDefault();
		}
	}

	const handleFileSelected = async ev => {
		const [file] = ev.target.files as FileList;
		
		if (!file)
			return;

		if (/[.](png|jpg)$/.test(file.name))
			setActualGCode(await image2GCode(file));
		else if (/[.](svg)$/.test(file.name))
			setActualGCode(await svg2GCode(await file.text()));
		else
			setActualGCode(await file.text());
	}

	return (<>
		<section className="gcode-sender">
			<div className="__toolbar">
				<input type="file" className="form-control ml-1" style={{ width: '40ch' }} accept=".nc,.gcode,.png,.jpg,.svg" onChange={handleFileSelected}/>
				{(connected
					? <button type="button" className="btn btn-danger" onClick={handleDisconnectClick}>Disconnect</button>
					: <button type="button" className="btn btn-success" onClick={handleConnectClick}>Connect</button>
				)}
				<div className="__status">{status.status}{status.position && ` - ${status.position.join(", ")}`}</div>
			</div>
			<textarea className="__gcode" value={actualGCode} onChange={ev => setActualGCode(ev.target.value)} onKeyDown={handleKeyDown} placeholder="Enter gcode..."/>
			<GCodeViewer className="__gcode-preview" gcode={actualGCode} position={status.position}/>
			<div className="__controls hstack gap-2">
				<button className="btn btn-primary" onClick={handleSendClick} disabled={!connected}>Send</button>
				<button className="btn btn-danger" onClick={handleStopClick} disabled={!connected}>Stop</button>
				<div>Queued: {status.queued ?? 0}</div>
			</div>
			<JogPad className="__jog-pad"/>

			<pre className="__logs">
				<div className="__logs-content">
					{logs.map((m, i) => (<div key={i} className={m.className}>{m.text}</div>))}
				</div>
			</pre>
		</section>
	</>);
}