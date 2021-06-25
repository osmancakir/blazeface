import React from 'react'
import Webcam from 'react-webcam'

// const videoConstraints = {
//     width: { min: 480 },
//     height: { min: 720 },
//     aspectRatio: 0.6666666667
//   };

// const Camera = () => {

    
//     return (
//         <Webcam 
//         videoConstraints={videoConstraints} 
//         width={480} 
//         height={720}
//        />
//     )
// }

const Camera = () => {
    const webcamRef = React.useRef(null);
    const [imgSrc, setImgSrc] = React.useState(null);
  
    const capture = React.useCallback(() => {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }, [webcamRef, setImgSrc]);
  
    return (
      <>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
        />
        <button onClick={capture}>Capture photo</button>
        {imgSrc && (
          <img
            src={imgSrc}
          />
        )}
      </>
    );
  };
  
 // ReactDOM.render(<WebcamCapture />, document.getElementById("root"));
  
  // https://www.npmjs.com/package/react-webcam
  

export default Camera