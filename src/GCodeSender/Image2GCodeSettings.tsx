import React, { useEffect, useRef } from "react";
import { getFormValue } from "../utils/form";

export function Image2GCodeSettings({ onClose }) {
    const hostRef = useRef<any>(null);

    useEffect(() => hostRef.current.showModal(), [])

    return (
        <dialog ref={hostRef}>
            <h4>Settings</h4>
            <form className="vstack gap-2" onSubmit={ev => onClose(getFormValue(ev.target as any))}>
                <div>
                    <label className="form-label">Sensitivity</label>
                    <input className="form-range" name="sensitivity" type="range" min={0} max={255} defaultValue={200}/>
                </div>
                <div className="form-check">
                    <input className="form-check-input" name="trimLines" type="checkbox" defaultChecked={true}/>
                    <label className="form-check-label">Trim Lines</label>
                </div>
                <div className="hstack justify-content-end gap-2">
                    <button className="btn btn-primary ml-auto" type="submit">Ok</button>
                    <button className="btn btn-secondary" type="button" onClick={ev => onClose(null)}>Cancel</button>
                </div>
            </form>
        </dialog>
    )
}