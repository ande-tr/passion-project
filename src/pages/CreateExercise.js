import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import Counter from '../components/Counter';
import SnapshotGallery from '../components/SnapshotGallery';
import PoseEditor from '../components/PoseEditor';

function CreateExercise(){
    const [poseSnapshots, setPoseSnapshots] = useState([]);
    const [videoWidth, setVideoWidth] = useState(0);
    const [videoHeight, setvideoHeight] = useState(0);
    const [startCounter, setStartCounter] = useState(false);
    const [videoStream, setVideoStream] = useState();
    const [recordingStarted, setRecordingStarted] = useState(false);

    const snapshotInterval = useRef();
    let maxSnapshots = 100;
    const webcamRef = useRef(null);

    let poseLandmarker;
    let lastVideoTime = -1;
    let video = null;

    const handleRecordingStart = () => {
        setRecordingStarted(true);
        setStartCounter(false);
        console.log('Recording started');
        snapshotInterval.current = setInterval(() => {
            snapshotPose();
        }, 200);
    };

    const handleRecordingStop = () => {
        setRecordingStarted(false);
        setStartCounter(false);
        window.clearInterval(snapshotInterval.current);
        console.log('Recording stopped');
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

    useEffect(() => {
        if(poseSnapshots.length >= maxSnapshots){
            handleRecordingStop();
        }
    }, [poseSnapshots]);

    const snapshotPose = () => {
        let startTimeMs = performance.now();

        if(videoStream){
            if (lastVideoTime !== videoStream.currentTime) {
                lastVideoTime = videoStream.currentTime;

                poseLandmarker.detectForVideo(videoStream, startTimeMs, (result) => {
                    const snapshot = {
                        screenshot: webcamRef.current.getScreenshot(),
                        landmarks: result.landmarks,
                        timestamp: Date.now(),
                    };

                    setPoseSnapshots(prevSnapshots => [...prevSnapshots, snapshot]);
                });
            }
        }
    }

    return (
        <>
            <header>Record an exercise</header>
            <div className='header__description'>Record exercises and build your list <br />for future fitness sessions.</div>

            {(!startCounter && !recordingStarted ) && (
                <div className='timer-placeholder'></div>
            )}

            {(startCounter || recordingStarted ) && (
                <Counter onTimerFinish={handleRecordingStart} />
            )}

            <div className={((poseSnapshots.length > 0 && !recordingStarted) || poseSnapshots.length >= maxSnapshots) ? 'livefeed-wrapper canvas' : 'livefeed-wrapper'}>
                {((poseSnapshots.length > 0 && !recordingStarted) || poseSnapshots.length >= maxSnapshots) ? (
                    <PoseEditor poseCoordinates={poseSnapshots} videoWidth={videoWidth} videoHeight={videoHeight}/>
                ) : (
                    <>
                        <Webcam ref={webcamRef} className="webcam" onLoadedMetadata={setupCamera}/>
                        <button className='button primary-button create-exercise__record-btn' onClick={() => {
                            if(!recordingStarted){
                                setStartCounter(true);
                            }
                            if(recordingStarted){
                                handleRecordingStop();
                            }
                        }}>
                            {(!startCounter && !recordingStarted) && (
                                'Record exercise'
                            )}
                            {(startCounter && !recordingStarted) && (
                                '...'
                            )}
                            {(!startCounter && recordingStarted) && (
                                'Stop recording'
                            )}
                        </button>
                    </>
                )}
            </div>

            <SnapshotGallery poses={poseSnapshots} />
        </>
    );
}

export default CreateExercise;