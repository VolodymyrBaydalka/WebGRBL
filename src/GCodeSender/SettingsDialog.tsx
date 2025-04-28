import React from "react";
import { Dialog } from "../components/Dialog";
import { useSettings } from "../hooks/useSettings";
import { getFormValue } from "../utils/form";

export function SettingsDialog({ onClose }) {
    const settings = useSettings();

    return (
        <Dialog>
            <h4>Settings</h4>
            <form className="vstack gap-2" onSubmit={ev => onClose(getFormValue(ev.target as any))}>
                <div>
                    <label className="form-label">Jog Step</label>
                    <input className="form-control" name="jogStep" type="number" defaultValue={settings.jogStep} />
                </div>
                <div>
                    <label className="form-label">Jog Feed</label>
                    <input className="form-control" name="jogFeed" type="number" defaultValue={settings.jogFeed} />
                </div>
                <div className="hstack justify-content-end gap-2">
                    <button className="btn btn-primary ml-auto" type="submit">Ok</button>
                    <button className="btn btn-secondary" type="button" onClick={ev => onClose(null)}>Cancel</button>
                </div>
            </form>
        </Dialog>
    );
}