import { useEffect, useRef } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia(
      { video: true }
    ).then((currentStream) => {
      webcamRef.current.srcObject = currentStream

    }).catch((err) => {
      console.log(err);

    });
  }
  useEffect(() => {
    startVideo();

    const loadModels = () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models'),
      ]).then(() => {
        console.log("Models Loaded");
        handleVideo();
      }).catch((err) => {
        console.log(err);
      });

    }
    // ?To prevent the image from loading before the models are loaded 
    webcamRef.current && loadModels();
  }, [])

  const handleVideo = () => {
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(webcamRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

      canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(webcamRef.current);

      faceapi.matchDimensions(canvasRef.current, { width: 700, height: 600 });

      const resized = faceapi.resizeResults(detections, { width: 700, height: 600 });

      faceapi.draw.drawDetections(canvasRef.current, resized);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resized);

    }, 500)
  }



  return (
    <>
      <div className="app-container">
        <div className="webcam-container">
          <video
            ref={webcamRef}
            crossOrigin='anonymous'
            autoPlay
            height={600}
            width={700}
          />
          <canvas
            ref={canvasRef}
            width={700} height={600} />
        </div>


      </div>

    </>
  )
}

export default App
