"use client";

import Spline from '@splinetool/react-spline';

export default function SplineScene() {
  return (
    <div className="w-full h-full drop-shadow-2xl">
      <Spline 
        scene="https://prod.spline.design/pgG5fc25NxLD4S2L/scene.splinecode" 
      />
    </div>
  );
}