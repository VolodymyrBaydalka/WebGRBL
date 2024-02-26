import React, { useState } from "react";
import { useGrblClient } from "../hooks/useGrblClient";
import "./JogPad.scss";

export function JogPad() {
    const [feed, setFeed] = useState(1800);
    const [step, setStep] = useState(60);
    const client = useGrblClient();

    const jogClicked = async (axis, dir) => {
        if (client.connected)
            await client.jog(axis, dir * step, feed);
    }

    const homeClicked = async () => {
        if (client.connected) 
            await client.home();
    }

    return (
        <div className="jog-pad">
            <div></div>
            <button type="button" className="btn btn-warning" onClick={ev => jogClicked("Y", 1)}>
                <i className="bi bi-arrow-up"></i>
            </button>
            <div></div>

            <button type="button" className="btn btn-warning" onClick={ev => jogClicked("X", -1)}>
                <i className="bi bi-arrow-left"></i>
            </button>
            <button type="button" className="btn btn-warning" onClick={ev => homeClicked()}>
                <i className="bi bi-record-circle"></i>
            </button>
            <button type="button" className="btn btn-warning" onClick={ev => jogClicked("X", 1)}>
                <i className="bi bi-arrow-right"></i>
            </button>

            <div></div>
            <button type="button" className="btn btn-warning" onClick={ev => jogClicked("Y", -1)}>
                <i className="bi bi-arrow-down"></i>
            </button>
            <div></div>
        </div>
    )
}