////////// ROI_RECTANGLE
let x = start[0]; // x axis of the topLeft of the prediction rectangle
let y = start[1]; // y axis of the topLeft of the prediction rectangle
let w = size[0] + 50; // make rectangle a little bit bigger
let h = size[1] + 50;

const xCen = x + w / 2;
const yCen = y + h / 2;

const ROI_SIZE = 0.65;

if (canvas.width / canvas.height === 45 / 35) {
  var roiWidth = h * ROI_SIZE;
  var roiHeight = w * ROI_SIZE;
} else {
  var roiWidth = h * ROI_SIZE;
  var roiHeight = roiWidth * (45 / 35);
}

const hMax = 2 * roiHeight;
const wMax = 2 * roiWidth;
const shift = -32;

x = xCen - roiWidth; //+ shiftX
y = yCen - roiHeight + shift;
w = wMax;
h = hMax;
////////////////////////////

//ELLIPSE CENTER

let majorAxisY = roiHeight * 0.8;
let eCenterY = yCen - (0.6 * majorAxisY) / 4 + shift;
let minorAxisX = roiWidth * 0.7;
let eMinorAxis = minorAxisX * 1.1;
let eCenterX = xCen;
let eMajorAxis = majorAxisY * 1.1;
let arcCenterX = xCen;
let maxFaceHeight = hMax * 0.73;
let arcCenterY =
  yCen + (1.05 * majorAxisY - maxFaceHeight / 2) + shift;
let arcMinorAxis = eMinorAxis;
let arcMajorAxis = majorAxisY * 0.5;

//////// ROI CONDITIONS
// facial landmarks
let rightEyeCenter = predictions[i].landmarks[0];
let leftEyeCenter = predictions[i].landmarks[1];
let noseCenter = predictions[i].landmarks[2];
let mouthCenter = predictions[i].landmarks[3];

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


let rightEyeRotationRightLeft =
  (Math.abs(rightEyeCenter[0] - xCen) / hMax) * 100;
let leftEyeRotationRightLeft =
  (Math.abs(leftEyeCenter[0] - xCen) / hMax) * 100;
let headRotationRightLeft =
  (Math.abs(eyesCenter[0] - xCen) / hMax) * 100;

let mouthNoseDiff = noseCenter
  .map((item, index) => {
    return item - mouthCenter[index];
  })
  .map((item) => Math.abs(item));
let mouthNoseDist =
  (Math.sqrt(mouthNoseDiff[0] ** 2 + mouthNoseDiff[1] ** 2) / wMax) *
  100;


//compute the euclidean distance between the eye centroids
let eyeDist = Math.sqrt(dX ** 2 + dY ** 2);
let eyeDistPerc = ((wMax - eyeDist) / wMax) * 100;

// compute the Euclidean distance between the eye midpoint and nose midpoint
let midEyeNoseDist = Math.sqrt(
  dX_MidEyeNose ** 2 + dY_MidEyeNose ** 2
);
let midEyeNoseDistNorm = (midEyeNoseDist / hMax) * 100;


//CONDITIONS
if (
  // values need adjustment
  10 > angle_wrt_horizontal_axis > 350 ||
  angleWrtVerticalAxis > 15
  //     ||
  //     angleWrtVerticalAxis < 5
  //     ||
  //     headRotationRightLeft > 4
  //     ||
  //     rightEyeRotationRightLeft < 4.5
  //     ||
  //     rightEyeRotationRightLeft > 12.5
  //     ||
  //     leftEyeRotationRightLeft < 4.5
  //     ||
  //     leftEyeRotationRightLeft > 12.5
  //     ||
  //     eyeDistPerc > 81
  //     ||
  //     eyeDistPerc < 69
  //     ||
  //     trial <  27.9 // seems not working
  //     ||
  //     trial > 28.8 // (eyeDist / hMax) * 100 >
  //     ||
  //     midEyeNoseDistNorm < 7
  //     ||
  //    midEyeNoseDistNorm > 15
  //    ||
  //    mouthNoseDist < 10.5 )
) {
  ctx.beginPath();

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#FF0000";
  ctx.strokeRect(x, y, w, h);
  ctx.ellipse(
    eCenterX,
    eCenterY,
    eMinorAxis,
    eMajorAxis,
    Math.PI,
    0,
    2 * Math.PI
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = "#A9A9A9";  // red
  ctx.moveTo(eCenterX, eCenterY - 20);
  ctx.lineTo(eCenterX, eCenterY + 20);
  ctx.moveTo(eCenterX - 20, eCenterY);
  ctx.lineTo(eCenterX + 20, eCenterY);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(
    arcCenterX,
    arcCenterY,
    arcMinorAxis,
    arcMajorAxis,
    Math.PI,
    Math.PI / 4,
    (3 * Math.PI) / 4
  );
  ctx.stroke();

  
} else {
  ctx.beginPath();

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#00FF00";
  ctx.strokeRect(x, y, w, h);
  ctx.ellipse(
    eCenterX,
    eCenterY,
    eMinorAxis,
    eMajorAxis,
    Math.PI,
    0,
    2 * Math.PI
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = "#A9A9A9"; // green
  ctx.moveTo(eCenterX, eCenterY - 20);
  ctx.lineTo(eCenterX, eCenterY + 20);
  ctx.moveTo(eCenterX - 20, eCenterY);
  ctx.lineTo(eCenterX + 20, eCenterY);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(
    arcCenterX,
    arcCenterY,
    arcMinorAxis,
    arcMajorAxis,
    Math.PI,
    Math.PI / 4,
    (3 * Math.PI) / 4
  );
  ctx.stroke();
  
}