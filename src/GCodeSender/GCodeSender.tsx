import React, { useEffect, useState } from "react";
import { useGrblClient } from "../hooks/useGrblClient";
import "./GCodeSender.scss";
import { JogPad } from "./JogPad";
import { GCodeViewer } from "./GCodeViewer";
import { image2GCode } from "../core/image2GCode";
import { svg2GCode } from "../core/svg2GCode";
import { useDialogState } from "../hooks/useDialogState";
import { Image2GCodeSettings } from "./Image2GCodeSettings";
import { GCodeViewer3D } from "./GCodeViewer3D";
import { SettingsDialog } from "./SettingsDialog";
import { defaultSettings, SettingsContext } from "../hooks/useSettings";

export function GCodeSender({ gcode }) {
	const conn = useGrblClient();
	const [settings, setSettings] = useState(defaultSettings);
	const [view3D, setView3D] = useState(false);
	const [connected, setConnected] = useState(false);
	const [actualGCode, setActualGCode] = useState("");
	const [status, setStatus] = useState<any>({ status: "None" });
	const [logs, setLogs] = useState<any[]>([]);
	const image2GCodeState = useDialogState();
	const settingsDialogState = useDialogState();

	useEffect(() => {
		const savedSettings = localStorage.getItem("settings");
		setSettings({ ...defaultSettings,... JSON.parse(savedSettings ?? "{}")})
	}, []);

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
		if (!conn.supported) {
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

		if (/[.](png|jpg)$/.test(file.name)) {
			const settings = await image2GCodeState.showAsync();

			if (settings) {
				setActualGCode(await image2GCode(file, settings));
			}
		}
		else if (/[.](svg)$/.test(file.name))
			setActualGCode(await svg2GCode(await file.text()));
		else
			setActualGCode(await file.text());
	}

	const handleSettingsClicked = async ev => {
		const result = await settingsDialogState.showAsync();

		if (result) {
			localStorage.setItem("settings", JSON.stringify(result));
			setSettings(result);
		}
	}

	return (
		<SettingsContext.Provider value={settings}>
			<section className="gcode-sender">
				<div className="__toolbar">
					<input type="file" className="form-control ml-1" style={{ width: '40ch' }} accept=".nc,.gcode,.png,.jpg,.svg" onChange={handleFileSelected} />
					{(connected
						? <button type="button" className="btn btn-danger" onClick={handleDisconnectClick}>Disconnect</button>
						: <button type="button" className="btn btn-success" onClick={handleConnectClick}>Connect</button>
					)}
					<div className="__status">{status.status}{status.position && ` - ${status.position.join(", ")}`}</div>
					<button type="button" className="btn btn-primary ms-auto me-2" onClick={handleSettingsClicked}><i className="bi bi-gear"></i></button>
					<label className="me-2"><input type="checkbox" checked={view3D} onChange={ev => setView3D(ev.target.checked)} /> 3D</label>
				</div>
				<textarea className="__gcode" value={actualGCode} onChange={ev => setActualGCode(ev.target.value)} onKeyDown={handleKeyDown} placeholder="Enter gcode..." />
				{view3D ? <GCodeViewer3D className="__gcode-preview" gcode={actualGCode} position={status.position} />
					: <GCodeViewer className="__gcode-preview" gcode={actualGCode} position={status.position} />}
				<div className="__controls hstack gap-2">
					<button className="btn btn-primary" onClick={handleSendClick} disabled={!connected}>Send</button>
					<button className="btn btn-danger" onClick={handleStopClick} disabled={!connected}>Stop</button>
					<div>Queued: {status.queued ?? 0}</div>
				</div>
				<JogPad className="__jog-pad" />

				<pre className="__logs">
					<div className="__logs-content">
						{logs.map((m, i) => (<div key={i} className={m.className}>{m.text}</div>))}
					</div>
				</pre>
			</section>
			{image2GCodeState.data && <Image2GCodeSettings onClose={image2GCodeState.onClose} />}
			{settingsDialogState.data && <SettingsDialog onClose={settingsDialogState.onClose} />}
		</SettingsContext.Provider>
	);
}