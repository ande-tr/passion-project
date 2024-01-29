import React, { useEffect, useState, useRef } from 'react';
import Webcam from 'react-webcam';
import Counter from '../components/Counter';
import { FilesetResolver, PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { useParams } from 'react-router-dom';
import {calculateSetOfAngles} from '../helpers'


function Play(){
    const { exerciseName } = useParams();
    const [videoWidth, setVideoWidth] = useState(0);
    const [videoHeight, setvideoHeight] = useState(0);
    const [startCounter, setStartCounter] = useState(false);
    const [videoStream, setVideoStream] = useState();
    const [recordingStarted, setRecordingStarted] = useState(false);
    const [isExerciseFirstTime, setIsExerciseFirstTime] = useState(true);

    const reqPoseTrack = useRef();

    let exercise = JSON.parse(localStorage.getItem(exerciseName));
    exercise = Object.keys(exercise).map(key => exercise[key]);
    exercise = Object.values(exercise);

    const webcamRef = useRef(null);
    let poseLandmarker;
    let lastVideoTime = -1;
    let video = null;

    const maxPoseIndex = exercise.length;
    const possibleCorrectPoses = exercise.length;

    const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
    let flagExerciseOver = false;
    let exerciseAccuracy = 0;
    let correctPoses = possibleCorrectPoses;
    let poseStartTimeReference = null;
    let elapsedTime = null;
    let lastPoseStatus = false;

    const startExercise = () => {
        console.log('Counter finished. Starting exercise.');
        if(isExerciseFirstTime){
            setIsExerciseFirstTime(false);
        }

        exerciseAccuracy = 0;
        correctPoses = possibleCorrectPoses;
        poseStartTimeReference = null;
        elapsedTime = null;
        lastPoseStatus = false;

        setCurrentPoseIndex(0);
        setStartCounter(false);
        setRecordingStarted(true);
        trackPose();
    }

    const handleExerciseFinish = () => {
        setStartCounter(false);
        setRecordingStarted(false);
        window.cancelAnimationFrame(reqPoseTrack.current);

        console.log('Exercise is finished.');

        if(currentPoseIndex !== maxPoseIndex){
            if(correctPoses + currentPoseIndex !== possibleCorrectPoses){
                correctPoses = possibleCorrectPoses - correctPoses - currentPoseIndex + 1;
            }
            else{
                correctPoses = possibleCorrectPoses - correctPoses - currentPoseIndex;
            }
        }

        exerciseAccuracy = (correctPoses / possibleCorrectPoses) * 100;
        console.log("Exercise accuracy: " + exerciseAccuracy + "%");
    }

    const checkPoseMatch = (recordedAngles, correctAngles, threshold) => {
        let numberOfCorrectAngles = 13;

        for (let i = 0; i < recordedAngles.length; i++) {
            const recordedAngle = recordedAngles[i];
            const correctAngle = correctAngles[i];

            if (Math.abs(recordedAngle - correctAngle) > threshold) {
                numberOfCorrectAngles--;
            }
        }
        if(numberOfCorrectAngles < 8){
            console.log('Wrong');
            lastPoseStatus = false;
            return false;
        }
        else{
            console.log('Correct');
            setCurrentPoseIndex(currentPoseIndex + 1);
            lastPoseStatus = true;
            elapsedTime = 0;
            return true;
        }
    };

    const setupPrediction = async () => {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");

        poseLandmarker = await PoseLandmarker.createFromOptions(
            vision,
            {
                baseOptions: {
                    // modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task"
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
                    //pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task<
                    // modelAssetPath: "../models/pose_landmarker_heavy.task"
                    // modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task"
                },
                runningMode: "VIDEO"
        });
    };

    const setupCamera = () => {
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4
          ) {
          
            video = webcamRef.current.video;

            setVideoWidth(video.width);
            setvideoHeight(video.height);
            
            video.width = videoWidth;
            video.height = videoHeight;
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            setVideoStream(video)
          }
          else{
            console.log("Some value is undefined");
          }
    }

    useEffect(() => {
        if(startCounter){
            setupPrediction();
        }
    }, [startCounter]);


    const trackPose = () => {
        if(!flagExerciseOver){
            console.log('in function');
        let startTimeMs = performance.now();

        if(videoStream){
            if(!poseStartTimeReference){
                poseStartTimeReference = performance.now();
            }

            if (lastVideoTime !== videoStream.currentTime) {
                lastVideoTime = videoStream.currentTime;

                if(lastPoseStatus){
                    poseStartTimeReference = performance.now();
                }
    
                if(elapsedTime >= 1){
                    elapsedTime = 0;
                    poseStartTimeReference = performance.now();
                    correctPoses--;
                    setCurrentPoseIndex(currentPoseIndex + 1);
                }
    
                poseLandmarker.detectForVideo(videoStream, startTimeMs, (pose) => {
                    let tempAnglesArray = [];
                    tempAnglesArray.push(calculateSetOfAngles(pose));
    
                    if(currentPoseIndex < maxPoseIndex){
                        checkPoseMatch(tempAnglesArray[0], exercise[currentPoseIndex], 2);
                    }
    
                    if(currentPoseIndex === maxPoseIndex){
                        flagExerciseOver = true;                
                    }
                });
    
                elapsedTime = (performance.now() - poseStartTimeReference) / 1000;
            }
        }

            reqPoseTrack.current = requestAnimationFrame(trackPose);
        }
        else{
            handleExerciseFinish();         
        }
    }

    return (
        <>
            <header>{exerciseName}</header>

            {(!startCounter && !recordingStarted ) && (
                <div className='timer-placeholder'></div>
            )}

            {(startCounter || recordingStarted ) && (
                <Counter onTimerFinish={startExercise} />
            )}
            <div className='livefeed-wrapper'>
                <Webcam ref={webcamRef} className="webcam" onLoadedMetadata={setupCamera}/>
                <button className='button primary-button create-exercise__record-btn' onClick={() => {
                    if(!recordingStarted){
                        setStartCounter(true);
                    }
                    if(recordingStarted){
                        handleExerciseFinish();
                    }
                }}>
                    
                    {(!startCounter && !recordingStarted) && (
                        isExerciseFirstTime ? (
                            'Start exercise'
                        ):
                        ( 
                            'Restart exercise'
                        )
                    )}
                    {(startCounter && !recordingStarted) && (
                        '...'
                    )}
                    {(!startCounter && recordingStarted) && (
                        'Stop the exercise'
                    )}
                </button>
            </div>
        </>
    );
}

export default Play;