export const calculateAngleThreePoints = (A, B, C) => {
    const angleAB = Math.atan2(B.y - A.y, B.x - A.x);
    const angleBC = Math.atan2(C.y - B.y, C.x - B.x);

    let angle = angleBC - angleAB;

    angle = (angle >= 0) ? angle : (2 * Math.PI + angle);
    angle = angle * (180 / Math.PI);

    return angle;
}

export const calculateSetOfAngles = (pose) => {
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