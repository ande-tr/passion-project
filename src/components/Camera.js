import Webcam from 'react-webcam';
import React, { useEffect, useState, useRef } from 'react';

function Camera() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
  
    let ctx;

    let video = null;

    const setupCamera = async () => {
        if (
          typeof webcamRef.current !== "undefined" &&
          webcamRef.current !== null &&
          webcamRef.current.video.readyState === 4
        ) {
    
          ctx = canvasRef.current.getContext("2d");
    
          video = webcamRef.current.video;
          const videoWidth = webcamRef.current.video.videoWidth;
          const videoHeight = webcamRef.current.video.videoHeight;
    
          webcamRef.current.video.width = videoWidth;
          webcamRef.current.video.height = videoHeight;
        }
        else{
          console.log("Some value is undefined");
        }
    };

    return (
        <div className="Camera">
          <Webcam
              ref={webcamRef}
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: 640,
                height: 480
              }}
            />
            <canvas
              ref={canvasRef}
              width="640"
              height="480"
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: 640,
                height: 480
              }}
            />
        </div>
    );
}

export default Camera;