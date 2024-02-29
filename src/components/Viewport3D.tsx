import React, { useEffect, useRef } from "react";
import { GridHelper } from "three";
import { Scene, WebGLRenderer, PerspectiveCamera } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export interface Viewport3DProps {
    model?: any;
}

export function Viewport3D({ model }: Viewport3DProps) {
    const viewEl = useRef<any>(null);
    const sceneRef = useRef<Scene>(null);

    useEffect(() => {
        let play: boolean = true;
        const container = viewEl.current as HTMLElement;

        const scene = sceneRef.current = new Scene();

        var renderer = new WebGLRenderer();
        renderer.setClearColor(0x0B71B3);
        renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(renderer.domElement);

        const camera = new PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        const controls = new OrbitControls(camera, renderer.domElement);
        camera.position.set(0, 1, 10);
        controls.target.set( 0, 0, 0 );
        controls.update();

        scene.add(new GridHelper(1000, 100, 0xffffff));

        var animate = () => {
            if (!play)
                return;

            controls.update();
            renderer.render(scene, camera);

            requestAnimationFrame(animate);
        }

        animate();

        const resizeObserver = new ResizeObserver(() => {
            renderer.setSize(container.offsetWidth, container.offsetHeight);
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            play = false;
        }
    }, []);

    useEffect(() => {
        if(!model)
            return;

        sceneRef.current.add(model);

        return () => sceneRef.current.remove(model);
    }, [model]);

    return <div ref={viewEl} style={{ width: '100%', height: '100%' }}></div>
}