import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { useNavigate } from 'react-router-dom';

function PoseEditor({poseCoordinates, videoWidth, videoHeight}) {
    const [exerciseName, setExerciseName] = useState("");

    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const interval = useRef();

    let ctx;
    let drawingUtils;
    let index = 0;

    const calculateAngleThreePoints = (A, B, C) => {
        const angleAB = Math.atan2(B.y - A.y, B.x - A.x);
        const angleBC = Math.atan2(C.y - B.y, C.x - B.x);
    
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

    useEffect(() => {
        ctx = canvasRef.current.getContext("2d");
        drawingUtils = new DrawingUtils(ctx);
        drawPose();

        return () => {
            window.clearTimeout(interval.current);
        };
    }, [])

    const handleSaveExercise = (e) => {
        e.preventDefault();

        let tempAnglesArray = {};
        poseCoordinates.forEach((pose, index) => {
            tempAnglesArray['pose'+index] = calculateSetOfAngles(pose);
        })

        // console.log(poseCoordinates);

        if(localStorage.getItem(exerciseName) === null){
            localStorage.setItem(exerciseName, JSON.stringify(tempAnglesArray));
            window.clearTimeout(interval.current);
            navigate('/exercises');
        }
        else{
            alert('The name is already taken!');
        }
    }

    const drawPose = () => {
        const landmarks = poseCoordinates[index].landmarks;

        for (const landmark of landmarks) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            drawingUtils.drawLandmarks(landmark, {
                radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)
            });
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
        }
        if(index === poseCoordinates.length - 1){
            index = 0;
        }
        else{
            index++;
        }
        interval.current= setTimeout(drawPose, 250);
    
    }

    return(
        <>
            <div className='pose-editor-wrapper'>
                <div className='pose-editor__pose-video'>
                    <canvas width="500px" height="375px" style={{width: '100%', height: '100%'}} ref={canvasRef}></canvas> 
                </div>
            </div>
            <form name="save-exercise" onSubmit={handleSaveExercise}>
                <input type="text" value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} className='pose-editor__name' placeholder="Exercise name" required/>
                <input type="submit" className='button pose-editor__save' value="Save exercise" />
            </form>
        </>
    );
}

export default PoseEditor;