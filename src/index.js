import React, {useState} from 'react';
import ReactDOM from 'react-dom';
//import './index.css';
import Camera from './Camera';
//import * as serviceWorker from './serviceWorker';




function App() {

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cardImage, setCardImage] = useState();

  return (
    <>
    {isCameraOpen && (
      <Camera
        onCapture={blob => setCardImage(blob)}
        onClear={() => setCardImage(undefined)}
      />
    )}

    {cardImage && (
      <div>
        <h2>Preview</h2>
        <img alt="hello" src={cardImage && URL.createObjectURL(cardImage)} />
      </div>
    )}

    <button onClick={() => setIsCameraOpen(true)}>Open Camera</button>
    <button
      onClick={() => {
        setIsCameraOpen(false);
        setCardImage(undefined);
      }}
    >
      Close Camera
    </button>
  </>
  )

}

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
