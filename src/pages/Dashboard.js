import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

function Dashboard(){
    let exercise = JSON.parse(localStorage.getItem('exercise'));
    exercise = Object.keys(exercise).map(key => exercise[key]);
    let exerciseAccuracy = 0;
    let possibleCorrectPoses = exercise.length;
    let correctPoses = possibleCorrectPoses;

    let currentPoseIndex = 0;
    let maxPoseIndex = exercise.length;

    let poseStartTimeReference;
    let elapsedTime = null;

    let lastPoseStatus = false;

    let numberOfCorrectAngles = 13;

    const calculateAngleThreePoints = (A, B, C) => {
        const angleAB = Math.atan2(B.y * videoHeight - A.y * videoHeight, B.x * videoWidth - A.x * videoWidth);
        const angleBC = Math.atan2(C.y * videoHeight - B.y * videoHeight, C.x * videoWidth - B.x * videoWidth);
    
        let angle = angleBC - angleAB;
    
        angle = (angle >= 0) ? angle : (2 * Math.PI + angle);
        angle = angle * (180 / Math.PI);
    
        return angle;
    }

    const calculateSetOfAngles = (pose) => {
        let anglesArray = [];
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][0], pose.landmarks[0][11], pose.landmarks[0][12]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][13], pose.landmarks[0][11], pose.landmarks[0][23]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][15], pose.landmarks[0][13], pose.landmarks[0][11]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][14], pose.landmarks[0][12], pose.landmarks[0][24]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][12], pose.landmarks[0][14], pose.landmarks[0][16]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][11], pose.landmarks[0][23], pose.landmarks[0][25]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][12], pose.landmarks[0][24], pose.landmarks[0][26]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][23], pose.landmarks[0][25], pose.landmarks[0][27]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][24], pose.landmarks[0][26], pose.landmarks[0][28]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][25], pose.landmarks[0][23], pose.landmarks[0][24]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][23], pose.landmarks[0][24], pose.landmarks[0][26]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][11], pose.landmarks[0][23], pose.landmarks[0][25]));
        anglesArray.push(calculateAngleThreePoints(pose.landmarks[0][12], pose.landmarks[0][24], pose.landmarks[0][26]));
        return anglesArray;
    }

    let videoWidth, videoHeight;

    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    let poseLandmarker;
    let lastVideoTime = -1;

    let ctx;
    let drawingUtils;

    let video = null;

    const setupPrediction = async () => {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");

        poseLandmarker = await PoseLandmarker.createFromOptions(
            vision,
            {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
                },
                runningMode: "VIDEO"
        });

        if (
          typeof webcamRef.current !== "undefined" &&
          webcamRef.current !== null &&
          webcamRef.current.video.readyState === 4
        ) {
        

          video = webcamRef.current.video;
          videoWidth = video.width;
          videoHeight = video.height;
          
          if(window.innerHeight >= window.innerWidth || window.matchMedia("(orientation: portrait)").matches){
            videoWidth = document.querySelector('.livefeed-wrapper').getBoundingClientRect().width;
            videoHeight = videoWidth;
          }
          else{
            videoHeight = document.querySelector('.livefeed-wrapper').getBoundingClientRect().height;
            videoWidth = videoHeight;
          }
          video.width = videoWidth;
          video.height = videoHeight;
          webcamRef.current.video.width = videoWidth;
          webcamRef.current.video.height = videoHeight;

        }
        else{
          console.log("Some value is undefined");
        }

        trackPose();
    };

    useEffect(() => {
        setupPrediction();
    }, [webcamRef]);

    const checkPoseMatch = (recordedAngles, correctAngles, threshold) => {
        let numberOfCorrectAngles = 13; 

        for (let i = 0; i < recordedAngles.length; i++) {
            const recordedAngle = recordedAngles[i];
            const correctAngle = correctAngles[i];

            console.log(recordedAngle);
            console.log(correctAngle);
            console.log(Math.abs(recordedAngle - correctAngle));
            console.log('break');

            if (Math.abs(recordedAngle - correctAngle) > threshold) {
                numberOfCorrectAngles--;
                // console.log('wrong');
            }
            // else{
            //     console.log('right');
            // }
        }
        if(numberOfCorrectAngles < 8){
            console.log('Wrong');
            lastPoseStatus = false;
            return false;
        }
        else{
            console.log('Correct');
            currentPoseIndex++;
            lastPoseStatus = true;
            elapsedTime = 0;
            return true;
        }
    };

    const trackPose = async () => {
        let startTimeMs = performance.now();

        if(!poseStartTimeReference){
            poseStartTimeReference = performance.now();
        }
        
        if (lastVideoTime !== video.currentTime) {
            lastVideoTime = video.currentTime;

            if(lastPoseStatus){
                poseStartTimeReference = performance.now();
            }

            if(elapsedTime >= 1){
                console.log('1 seconds have passed! Resetting timer.');
                elapsedTime = 0;
                poseStartTimeReference = performance.now();
                correctPoses--;
                currentPoseIndex++;
            }

            poseLandmarker.detectForVideo(video, startTimeMs, (pose) => {
                let tempAnglesArray = [];
                tempAnglesArray.push(calculateSetOfAngles(pose));

                if(currentPoseIndex < maxPoseIndex){
                    checkPoseMatch(tempAnglesArray[0], exercise[currentPoseIndex], 2);
                }

                if(currentPoseIndex === maxPoseIndex){
                    exerciseAccuracy = (correctPoses / possibleCorrectPoses) * 100;
                    console.log("Exercise accuracy: " + exerciseAccuracy + "%");
                }
            });

            elapsedTime = (performance.now() - poseStartTimeReference) / 1000;
        }

        requestAnimationFrame(trackPose);
    }

    return (
        <div className='Dashboard'>
            <header>Dashboard</header>
            <div className="livefeed-wrapper">
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
            
        </div>
    );
}

export default Dashboard;