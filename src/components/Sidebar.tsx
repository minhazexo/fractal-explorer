import React from 'react';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <h2>Fractal Explorer</h2>
            <ul>
                <li><a href="#mandelbrot">Mandelbrot Set</a></li>
                <li><a href="#julia">Julia Set</a></li>
                <li><a href="#settings">Settings</a></li>
            </ul>
        </div>
    );
};

export default Sidebar;