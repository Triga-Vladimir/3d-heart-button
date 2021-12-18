import React, { useEffect, useState, useRef, memo } from 'https://cdn.skypack.dev/react';
import ReactDOM from 'https://cdn.skypack.dev/react-dom';

const PATH_LENGTH = 1506;
const LAYERS = 20;
const LAYER_GAP = 2; // In pixels

const clamp = (min, max, n) =>
    Math.min(max, Math.max(min, n));


const useDocumentEvent = (event, handler) => {
    useEffect(() => {
        const events = event.split(' ');
        events.forEach(event => document.addEventListener(event, handler));
        return () => events.forEach(event => document.removeEventListener(event, handler));
    }, []);
};

const useTimeArray = delay => {
    const [timestamps, setTimestamps] = useState([]);
    const timeout = useRef();
    useEffect(() => {
        return () => clearTimeout(timeout.current);
    }, []);
    return {
        timestamps, add: () => {
            setTimestamps(arr => [...arr, Date.now()]);
            timeout.current = setTimeout(() => setTimestamps(arr => arr.filter(t => Date.now() - t < delay)), delay + 1);
        }
    };
};

const useCursorTilt = ({ ref, tilt, bounds }) => {
    const [rotate, setRotate] = useState([-25, 25]);
    useEffect(() => {
        const handleMouseMove = e => {
            requestAnimationFrame(() => {
                const { left, top, width, height } = ref.current.getBoundingClientRect();
                const [x, y] = [e.clientX, e.clientY];
                const rect = bounds ?
                    { top: top - bounds, left: left - bounds, width: width + bounds * 2, height: height + bounds * 2 } :
                    { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };

                setRotate([
                    -(clamp(0, rect.height, y - rect.top) - rect.height / 2) / rect.height * tilt,
                    (clamp(0, rect.width, x - rect.left) - rect.width / 2) / rect.width * tilt]);

            });
        };
        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);
    return rotate;
};

const Splash = memo(({ circles }) => {
    return /*#__PURE__*/(
        React.createElement("svg", { viewBox: "0 0 500 430", className: "splash" },
            circles.map((timestamp) => /*#__PURE__*/
                React.createElement(HeartPath, { key: timestamp })
                // <circle cx={50} cy={50} r={50} key={timestamp}/>
            )));


});

const HeartPath = () => /*#__PURE__*/
    React.createElement("path", { d: "M500 143.64C500 286.45 321.49 322.15 250.08 429.26C178.68 322.15 0.17 286.45 0.17 143.64C0.17 72.24 53.72 0.83 142.98 0.83C214.38 0.83 250.08 72.24 250.08 72.24C250.08 72.24 285.79 0.83 357.19 0.83C446.45 0.83 500 72.24 500 143.64Z" });


const ShineSVG = ({ x, opacity, rotate, translateZ }) => /*#__PURE__*/
    React.createElement("svg", { viewBox: "0 0 500 430", style: { transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(${translateZ}px) scale(0.9)` }, className: "heart-shine" }, /*#__PURE__*/
        React.createElement("defs", null, /*#__PURE__*/
            React.createElement("clipPath", { id: "heart" }, /*#__PURE__*/
                React.createElement(HeartPath, null))), /*#__PURE__*/


        React.createElement("rect", { x: 500 - x * 700, y: "0", width: "200", height: "430", fill: `rgba(255,255,255,${opacity}`, clipPath: "url(#heart)" }));



const HeartSVG = ({ rotate: { x, y }, translateZ, strokeDashoffset, scale = 1, className }) => /*#__PURE__*/
    React.createElement("svg", { className: className, viewBox: "0 0 500 430", style: { transform: `rotateX(${x}deg) rotateY(${y}deg) translateZ(${translateZ}px) scale(${scale})`, strokeDashoffset } }, /*#__PURE__*/
        React.createElement(HeartPath, null));



const Heart = () => {
    const ref = useRef();
    const [love, setLove] = useState(1);
    const [pressed, setPressed] = useState(false);
    const { timestamps, add } = useTimeArray(1000);
    const [x, y] = useCursorTilt({ ref, tilt: 50, bounds: 50 });
    const offset = Math.atan2(y, x) / Math.PI * (PATH_LENGTH / 2) + PATH_LENGTH / 2;
    useDocumentEvent('mouseup', () => {
        setPressed(pressed => {
            if (pressed) {
                setLove(a => {
                    if (a >= 1) {
                        return 0;
                    }
                    add();
                    return a + 0.3;
                });
            }
            return false;
        });
    });

    return /*#__PURE__*/(
        React.createElement("button", { className: "heart", onMouseDown: () => setPressed(true), ref: ref, style: { '--lightness': `${love * 80 + 20}%`, '--scale': 0.8 + love * 0.2 - pressed * 0.1 } }, /*#__PURE__*/
            React.createElement("div", { className: "inner-wrapper" }, /*#__PURE__*/
                React.createElement(Splash, { circles: timestamps }),
                [...new Array(LAYERS)].map((_, i) => /*#__PURE__*/
                    React.createElement(HeartSVG, { className: "heart-layer", rotate: { x, y }, translateZ: i * LAYER_GAP, scale: Math.sin(i / LAYERS * Math.PI) / 10 + 1 })), /*#__PURE__*/

                React.createElement(HeartSVG, { className: "heart-stroke", rotate: { x, y }, translateZ: (LAYERS + 1) * LAYER_GAP, strokeDashoffset: offset, scale: 0.9 }), /*#__PURE__*/
                React.createElement(ShineSVG, { x: y / 50 + 0.5, opacity: x / 200 + 0.5, rotate: { x, y }, translateZ: (LAYERS + 1) * LAYER_GAP }))));




};

const App = () => /*#__PURE__*/
    React.createElement("div", { className: "app" }, /*#__PURE__*/
        React.createElement(Heart, null));



ReactDOM.render( /*#__PURE__*/
    React.createElement(App, null),
    document.body);