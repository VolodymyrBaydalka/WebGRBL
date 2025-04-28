import React from "react";
import { useGrblClient } from "../hooks/useGrblClient";
import "./JogPad.scss";
import { useSettings } from "../hooks/useSettings";

export function JogPad({ className }: any) {
    const { jogStep, jogFeed  } = useSettings();
    const client = useGrblClient();

    const jogClicked = async (axis, dir) => {
        if (client.connected)
            await client.jog(axis, dir * jogStep, jogFeed);
    }

    const homeClicked = async () => {
        if (client.connected) 
            await client.home();
    }

    return (
        <div className={`jog-pad ${className ?? ''}`}>
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