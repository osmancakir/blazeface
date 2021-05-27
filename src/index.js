import React, {useState} from 'react'
import ReactDOM from 'react-dom'
//import './index.css';
import Camera from './Camera'
//import * as serviceWorker from './serviceWorker';

function App() {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [cardImage, setCardImage] = useState()

  const handleClose = () => {
    setIsCameraOpen(false)
    setCardImage(undefined)
  }

  return (
    <>
      {isCameraOpen && (
        <Camera onCapture={(blob) => setCardImage(blob)} handleClose={handleClose} />
      )}

      {cardImage && (
        <div>
          <h2>Preview</h2>
          <img
            alt="hello"
            style={{
              display: 'block',
              width: '20%',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginTop: '500px',
            }}
            src={cardImage && URL.createObjectURL(cardImage)}
          />
        </div>
      )}
      <div style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}}>
        <button onClick={() => setIsCameraOpen(true)}>Open Camera</button>
        <button
          onClick={() => {
            handleClose()
          }}
        >
          Close Camera
        </button>
      </div>
    </>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
