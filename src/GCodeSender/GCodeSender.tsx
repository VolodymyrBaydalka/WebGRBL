import React, { useEffect, useState } from "react";
import { useGrblClient } from "../hooks/useGrblClient";
import "./GCodeSender.scss";
import { JogPad } from "./JogPad";
import { GCodeViewer } from "./GCodeViewer";

export function GCodeSender({ gcode }) {
	const conn = useGrblClient();
	const [connected, setConnected] = useState(false);
	const [actualGCode, setActualGCode] = useState("");
	const [status, setStatus] = useState("None");
	const [logs, setLogs] = useState<any[]>([]);

	useEffect(() => {
		conn.onMessage = ev => {
			if (ev.type == "status") {
				setStatus(`${ev.status}, position=${ev.position?.join(", ")}`);
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
		const res = await conn.connect();
		setConnected(res);
		setStatus("Connecting");
	}

	const handleDisconnectClick = async () => {
		await conn.disconnect();
		setConnected(false);
		setStatus("Disconnected");
	}

	const handleSendClick = async () => {
		if (connected) {
			await conn.sendGcode(actualGCode);
			setActualGCode("");
		}
	}

	const handleStopClick = () => conn.stop();

	const handleKeyDown = (ev: any) => {
		if (ev.key === 'Enter' && ev.shiftKey) {
			handleSendClick();
			ev.preventDefault();
		}
	}

	return (<>
		<section className="gcode-sender">
			<div className="hstack p-1 gap-2">
				{(connected
					? <button type="button" className="btn btn-danger" onClick={handleDisconnectClick}>Disconnect</button>
					: <button type="button" className="btn btn-success" onClick={handleConnectClick}>Connect</button>
				)}
				<div className="__status">{status}</div>
			</div>
			<div className="__main">
				<textarea className="__gcode" value={actualGCode} onChange={ev => setActualGCode(ev.target.value)} onKeyDown={handleKeyDown} placeholder="Enter gcode..."/>
				<GCodeViewer gcode={actualGCode}/>
			</div>
			<div className="hstack gap-2">
				<button className="btn btn-primary" onClick={handleSendClick} disabled={!connected}>Send</button>
				<button className="btn btn-danger" onClick={handleStopClick} disabled={!connected}>Stop</button>
				<div>Queued: {conn.queueSize}</div>
			</div>
			<JogPad/>
			<pre className="__logs">
				<div className="__logs-content">
					{logs.map((m, i) => (<div key={i} className={m.className}>{m.text}</div>))}
				</div>
			</pre>
		</section>
	</>);
}