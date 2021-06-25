// TODO: render a button to open the camera
// TODO: that button should open a modal with portal
// TODO: modal should have capture and cancel buttons
// TODO: cancel button should close the modal
// TODO: capture button should capture a photo and preview it on the modal capturing based on the roi
// TODO: modify blazeface so there is no request outside the react app

import React from 'react'
import {createGlobalStyle} from 'styled-components'
import styled from 'styled-components'
import {drawRoiOnCanvas} from './utils'
import * as tf from '@tensorflow/tfjs-core'
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm'
tfjsWasm.setWasmPath('/tfjs-backend-wasm.wasm')
//const blazeface = require("@tensorflow-models/blazeface");
const blazeface = require('@evoid/blazeface')
//const blazeface = require('tensorflow-models-blazeface/@tensorflow-models/blazeface')
const VideoStyle = createGlobalStyle`
    .modal {
      overflow-y: hidden !important;
    }
    .modal-content {
        background: transparent;
        box-shadow: unset;
        position: relative;
    }
    .snapshoot_button {
      font-size: 40px;
      color: #32c787;
    }
    .close_camera_button {
      font-size: 40px;
      color: #ff6b68;
    }
    .button_wrapper {
      position: fixed;
      top: 450px;
      width: 100%;
      text-align: center;
    }
    @media (min-width: 576px) {
      .modal-dialog {
        max-width: unset !important;
        margin: 0;
      }
    }
    @media (max-width: 770px) {
      .button_wrapper {
        top: 45vw;
      }
    }
    @media screen and (max-width: 576px) and (orientation:portrait) {
      .camera_canvas_wrapper {
          transform: scale(4) !important;
      }
      .button_wrapper {
        bottom: 0;
        top: unset;
      }
    }
`

const CameraCanvas = styled.canvas`
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 800px;
  max-height: 600px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
`

const HelpCanvas = styled.canvas`
  position: absolute;
  top: -3px;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 800px;
  max-height: 600px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  display: none;
`

const Video = styled.video`
  position: absolute;
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  width: 100%;
  height: auto;
  max-width: 800px;
  max-height: 600px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  top: -3px;
  text-align: center;
`

class Camera extends React.Component {
  constructor(props) {
    super(props)
    this.play = true
    this.stream = ''
    this.ticker = null
    this.ref = React.createRef()
    this.refCanvas = React.createRef()
    this.refVideo = React.createRef()
    this.helpCanvas = React.createRef()
    this.onClose = this.props.onClose
    this.avatarUrlPost = this.props.avatarUrlPost
    this.setCapturedImages = this.props.setCapturedImages
    this.takeSnapshot = this.props.takeSnapshot
    this.onCapture = this.props.onCapture
    this.handleClose = this.props.handleClose
  }

  async componentDidMount() {
    await tf.setBackend('wasm')
    await this.setupCamera()
    let video = this.refVideo.current
    video.play()

    let videoWidth = video.videoWidth
    let videoHeight = video.videoHeight
    video.width = videoWidth
    video.height = videoHeight

    const canvas = this.refCanvas.current
    canvas.width = videoWidth
    canvas.height = videoHeight
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'

    this.renderPrediction()
  }

  renderPrediction = async () => {
    tf.engine().startScope() // clean up unused tensors
    const model = await blazeface.load({maxFaces: 1, scoreThreshold: 0.95})
    if (this.play) {
      const canvas = this.refCanvas.current
      const ctx = canvas.getContext('2d')
      const returnTensors = false
      const flipHorizontal = true
      const annotateBoxes = true
      const predictions = await model.estimateFaces(
        this.refVideo.current,
        returnTensors,
        flipHorizontal,
        annotateBoxes,
      )

      if (predictions.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (let i = 0; i < predictions.length; i++) {
          if (returnTensors) {
            predictions[i].topLeft = predictions[i].topLeft.arraySync()
            predictions[i].bottomRight = predictions[i].bottomRight.arraySync()
            if (annotateBoxes) {
              predictions[i].landmarks = predictions[i].landmarks.arraySync()
            }
          }
          try {
          } catch (err) {
            console.log(err.message)
          }
          //const start = predictions[i].topLeft;
          //const end = predictions[i].bottomRight;
          //const size = [end[0] - start[0], end[1] - start[1]];

          if (annotateBoxes) {
            const landmarks = predictions[i].landmarks

            ctx.fillStyle = 'blue'
            for (let j = 0; j < landmarks.length; j++) {
              const x = landmarks[j][0]
              const y = landmarks[j][1]
              ctx.fillRect(x, y, 5, 5)
            }
          }
          drawRoiOnCanvas(canvas, ctx, predictions[i]) //this.portraitMode, // this.setDisableButtons)
        }
      }
      requestAnimationFrame(this.renderPrediction)
    }
    tf.engine().endScope()
  }

  setupCamera = async () => {
    const video = this.refVideo.current
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: {
          min: 640,
        },
        height: {
          min: 480,
        },
        facingMode: 'user',
      },
    })
    
    //video.setAttribute("controls", "true");
    this.stream = stream
    video.setAttribute("playsinline", "true");
    video.srcObject = stream

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video)
      }
    })
  }

  capturePhoto = () => {
    const video = this.refVideo.current
    const canvas = this.helpCanvas.current
    // scale the canvas accordingly
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    // draw the video at that frame and apply mirror effect
    let ctx = canvas.getContext('2d')
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0)
    this.helpCanvas.current.toBlob((blob) => this.onCapture(blob), 'image/jpeg', 1)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    // convert it to a usable data URL
    //const dataURL = canvas.toDataURL();
    // this.takeSnapshot(
    //   dataURL,
    //   this.setCapturedImages,
    //   this.avatarUrlPost,
    //   canvas,
    //   video.videoWidth,
    //   video.videoHeight
    // );
  }

  handleCapture() {
    const context = this.refCanvas.current.getContext('2d')

    context.drawImage(
      this.refVideo.current,
      0,
      0,
      300,
      300,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    )
  }

  componentWillUnmount() {
    this.play = false
    let video = this.refVideo.current
    video.pause()
    video.src = ''
    this.stream.getTracks()[0].stop()
  }

  render() {
    return (
      <div>
        <VideoStyle></VideoStyle>
        <div className="camera_canvas_wrapper">
          <Video ref={this.refVideo}></Video>
          <CameraCanvas ref={this.refCanvas}></CameraCanvas>
          <HelpCanvas ref={this.helpCanvas}></HelpCanvas>
        </div>
        <div className="button_wrapper">
          <button
            id="snapshotButton"
            className="snapshoot_button btn btn-link"
            onClick={() => this.capturePhoto()} //this.capturePhoto()}
          >
            Capture
          </button>
          <button
            className="close_camera_button btn btn-link"
            onClick={() => this.handleClose()} //this.onClose}
          >
            Close
          </button>
        </div>
      </div>
    )
  }
}

export default Camera
