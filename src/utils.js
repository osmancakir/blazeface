export const drawRoiOnCanvas = (canvas, ctx, predictions, portraitMode, setDisableButtons) => {
    const equalizer = portraitMode ? 60 : 0;
    const start = predictions.topLeft;
    const end = predictions.bottomRight;
    const size = [end[0] - start[0], end[1] - start[1]];

    // ROI_RECTANGLE
    let x = start[0]-17; // x axis of the topLeft of the prediction rectangle -13 to center the rectangle around the face
    let y = start[1]; // y axis of the topLeft of the prediction rectangle
    let w = size[0] + 50; // make rectangle a little bit bigger
    let h = size[1] + 50;

    const xCen = x + w / 2;
    const yCen = y + h / 2;

    const ROI_SIZE = 0.65;

    let roiWidth
    let roiHeight

    if (canvas.width / canvas.height === 45 / 35) {
      roiWidth = h * ROI_SIZE;
      roiHeight = w * ROI_SIZE;
    } else {
      roiWidth = h * ROI_SIZE;
      roiHeight = roiWidth * (45 / 35);
    }

    const hMax = 2 * roiHeight;
    const wMax = 2 * roiWidth;
    const shift = 0;

    x = xCen - roiWidth;
    y = yCen - roiHeight + shift;
    w = wMax;
    h = hMax

    // CENTER POINTS
    let xCenFin = x + (w/2)
    let yCenFin = y+(h/2)

    //ELLIPSE CENTER
    let majorAxisY = roiHeight * 0.8;
    let eCenterY = yCen - (0.6 * majorAxisY) / 4 + shift;
    let minorAxisX = roiWidth * 0.7;
    let eMinorAxis = minorAxisX * 1.1;
    let eCenterX = xCen;
    let eMajorAxis = majorAxisY * 1.1;
    //let arcCenterX = xCen;
    //let maxFaceHeight = hMax * 0.73;
    //let arcCenterY = yCen + (1.05 * majorAxisY - maxFaceHeight / 2) + shift;
    //let arcMinorAxis = eMinorAxis;
    //let arcMajorAxis = majorAxisY * 0.5;

    // ROI CONDITIONS
    // facial landmarks
    let rightEyeCenter = predictions.landmarks[0];
    let leftEyeCenter = predictions.landmarks[1];
    let noseCenter = predictions.landmarks[2]

    // compute center (x,y) coordinates between the two eyes in the input image
    let eyesCenter = [
      (leftEyeCenter[0] + rightEyeCenter[0]) / 2,
      (leftEyeCenter[1] + rightEyeCenter[1]) / 2,
    ];

    // compute the angle of rotation between the eye centroids
    let dY = rightEyeCenter[1] - leftEyeCenter[1];
    let dX = rightEyeCenter[0] - leftEyeCenter[0];

    let radiansToDegrees = (radians) => {
      let pi = Math.PI;
      return radians * (180 / pi);
    };

    let angle_wrt_horizontal_axis = Math.abs(
      radiansToDegrees(Math.atan2(dY, dX)) - 180
    );

    //compute the angle of rotation between the mid-eye point and mid-nose point
    let dY_MidEyeNose = noseCenter[1] - eyesCenter[1];
    let dX_MidEyeNose = noseCenter[0] - eyesCenter[0];

    let angleWrtVerticalAxis = Math.abs(
      radiansToDegrees(Math.atan2(dY_MidEyeNose, dX_MidEyeNose)) - 90
    );
    let notInPosition =
      xCenFin - roiWidth < 0 ||
      xCenFin + roiWidth > canvas.width ||
      yCenFin * (16 / 9 + 4 / 3) - roiHeight - 700 < 0 ||
      yCenFin + roiHeight > canvas.height ||
      10 > angle_wrt_horizontal_axis > 350 ||
      angleWrtVerticalAxis > 15 ||
      10 > angle_wrt_horizontal_axis > 350 ||
      angleWrtVerticalAxis > 15;
    //setDisableButtons(notInPosition)
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = notInPosition ? "#FF0000" :  "#00FF00"; // red or green;
    ctx.strokeRect(x + equalizer, y + equalizer, w-2*equalizer, h-2*equalizer);
    ctx.ellipse(
    eCenterX,
    eCenterY,
    eMinorAxis - equalizer,
    eMajorAxis - equalizer,
    Math.PI,
    0,
    2 * Math.PI
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "#A9A9A9";
    ctx.moveTo(eCenterX, eCenterY - 20);
    ctx.lineTo(eCenterX, eCenterY + 20);
    ctx.moveTo(eCenterX - 20, eCenterY);
    ctx.lineTo(eCenterX + 20, eCenterY);
    ctx.stroke();
}