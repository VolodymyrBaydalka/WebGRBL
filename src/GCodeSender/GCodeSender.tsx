import React, { useEffect, useState } from "react";
import { GrblClient } from "../core/grblClient";
import "./GCodeSender.scss";

export function GCodeSender({ gcode }) {
	const [conn] = useState(() => new GrblClient())
	const [connected, setConnected] = useState(false);
	const [actualGCode, setActualGCode] = useState("");
	const [status, setStatus] = useState("None");
	const [logs, setLogs] = useState<any[]>([]);

	useEffect(() => {
		conn.onMessage = msg => {
			if (msg.type == "status") {
				setStatus(msg.text);
			} else {
				setLogs(prev => [...prev, { 
					...msg, 
					prefix: msg.type == "response" ? ">>" : "<<",
					className: msg.text.startsWith("ok") ? "text-success" : (msg.text.startsWith("error:") ? "text-danger" : "")
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
			<textarea className="__gcode" value={actualGCode} onChange={ev => setActualGCode(ev.target.value)} onKeyDown={handleKeyDown} placeholder="Enter gcode..."/>
			<div className="hstack gap-2">
				<button className="btn btn-primary" onClick={handleSendClick} disabled={!connected}>Send</button>
				<button className="btn btn-danger" onClick={handleStopClick} disabled={!connected}>Stop</button>
				<div>Queued: {conn.queueSize}</div>
			</div>
			<pre className="__logs">
				<div className="__logs-content">
					{logs.map((m, i) => (<div key={i} className={m.className}>{m.prefix} - {m.text}</div>))}
				</div>
			</pre>
		</section>
	</>);
}