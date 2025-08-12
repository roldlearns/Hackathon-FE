import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../components/navbar';

// Modal component that renders into document.body using a portal
function Modal({ children, onClose, initialFocusRef }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    // prevent background scroll while modal is open
    document.body.style.overflow = 'hidden';
    // focus the initial element if provided
    if (initialFocusRef && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [initialFocusRef]);

  // Render overlay + dialog into document.body to avoid stacking/context issues
  return createPortal(
    <div
      // full-screen overlay
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000, // as you requested
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)', // Safari fallback
      }}
      // Do NOT close on overlay click; we won't attach an onClick that closes.
      aria-modal="true"
      role="dialog"
    >
      {/* dialog box — stopPropagation to ensure clicks on the box don't reach overlay */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-8 modal-content"
        style={{
          zIndex: 1001,
          maxWidth: '400px',
          width: '90%',
          margin: '0 auto',
          animation: 'scaleIn 0.25s ease-out',
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

const App = () => {
  // --- State Variables ---
  const [heartRate, setHeartRate] = useState(75);
  const [stressThreshold, setStressThreshold] = useState(95);
  const [isStressed, setIsStressed] = useState(false);
  const [isNoiseCancellationOn, setIsNoiseCancellationOn] = useState(false);
  const [customAudioFile, setCustomAudioFile] = useState(null);
  const [audioSource, setAudioSource] = useState('white-noise');
  const [showNotification, setShowNotification] = useState(false);

  // Replace this with dynamic name if available
  const userName = 'Lambokalambo';

  const closeBtnRef = useRef(null);

  // Refs for the AudioContext and source to persist across re-renders
  const audioContext = useRef(null);
  const audioBuffer = useRef(null);
  const source = useRef(null);

  // A tiny silent WAV (example) — keep your original base64 if needed
  const whiteNoiseBase64 =
    'UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAAAAAADoAAAD2dGVzdGluZzEAAABkYXRhAAAAAA==';

  // --- Helper Functions ---
  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const createAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const playAudio = (buffer) => {
    if (source.current) {
      stopAudio();
    }
    createAudioContext();
    source.current = audioContext.current.createBufferSource();
    source.current.buffer = buffer;
    source.current.connect(audioContext.current.destination);
    source.current.loop = true;
    source.current.start(0);
  };

  const stopAudio = () => {
    try {
      if (source.current) {
        source.current.stop(0);
        source.current.disconnect();
        source.current = null;
      }
    } catch (e) {
      // ignore if already stopped
    }
  };

  // --- UseEffects to handle logic ---
  // Initialize and load white noise on component mount
  useEffect(() => {
    createAudioContext();
    const arrayBuffer = base64ToArrayBuffer(whiteNoiseBase64);
    // decodeAudioData expects an ArrayBuffer
    if (audioContext.current && arrayBuffer) {
      audioContext.current
        .decodeAudioData(arrayBuffer)
        .then((buffer) => {
          audioBuffer.current = buffer;
        })
        .catch((error) => console.error('Error decoding white noise:', error));
    }

    // Cleanup on component unmount
    return () => {
      stopAudio();
      if (audioContext.current) {
        audioContext.current.close().catch(() => {});
        audioContext.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to handle heart rate changes and trigger actions
  const [hasShownNotification, setHasShownNotification] = useState(false);
  useEffect(() => {
    const currentlyStressed = heartRate >= stressThreshold;
    setIsStressed(currentlyStressed);

    // update isStressed visual status
    setIsStressed(currentlyStressed);

  if (currentlyStressed && !hasShownNotification) {
    setShowNotification(true);
    setHasShownNotification(true); // prevent immediate reopen
    handleNoiseCancellation(true);
  }

  // reset flag when calm again
  if (!currentlyStressed) {
    setHasShownNotification(false);
    handleNoiseCancellation(false); // turn off
  }
}, [heartRate, stressThreshold, hasShownNotification]);

  // Effect to handle audio source changes
  useEffect(() => {
    if (isNoiseCancellationOn) {
      playCalmingAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSource]);

  // --- Event Handlers ---
  const handleNoiseCancellation = (shouldTurnOn) => {
    setIsNoiseCancellationOn(shouldTurnOn);
    if (shouldTurnOn) {
      playCalmingAudio();
    } else {
      stopAudio();
    }
  };

  const handleManualToggle = () => {
    handleNoiseCancellation(!isNoiseCancellationOn);
  };

  const playCalmingAudio = () => {
    if (!isNoiseCancellationOn) return;

    if (audioSource === 'white-noise' && audioBuffer.current) {
      playAudio(audioBuffer.current);
    } else if (audioSource === 'custom-audio' && customAudioFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        createAudioContext();
        // e.target.result is an ArrayBuffer
        audioContext.current
          .decodeAudioData(e.target.result)
          .then((buffer) => {
            audioBuffer.current = buffer;
            playAudio(audioBuffer.current);
          })
          .catch((error) => console.error('Error decoding custom audio:', error));
      };
      reader.readAsArrayBuffer(customAudioFile);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomAudioFile(file);
      setAudioSource('custom-audio');
      if (isNoiseCancellationOn) {
        playCalmingAudio();
      }
    }
  };

  // close handler (user must click this button)
  const handleCloseNotification = () => {
    setShowNotification(false);
    // keep noise cancellation state as-is; if you want to stop audio when closing, uncomment next line:
    // handleNoiseCancellation(false);
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; }
          @keyframes pulse-ring {
            0% { transform: scale(0.33); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
  }
          .bg-teal-50 { color: #0d9488 ; }
          .text-teal-500 { color: #14b8a6; }
          .text-teal-600 { color: #0d9488; }
          .modal-content {animation: scaleIn 0.25s ease-out;}
          .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.24, 0, 0.44, 1) infinite; }
          .custom-file-input { position: absolute; width: 100%; height: 100%; top: 0; left: 0; opacity: 0; cursor: pointer; }
          input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; width: 100%; }
          input[type="range"]::-webkit-slider-runnable-track { background: linear-gradient(to right, #4f46e5, #4f46e5 var(--progress, 0%), #e5e7eb var(--progress, 0%)); border-radius: 9999px; height: 8px; }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none; height: 20px; width: 20px; background: #4f46e5;
            border-radius: 9999px; margin-top: -6px; cursor: pointer; box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
          }
          input[type="range"]:focus::-webkit-slider-thumb { box-shadow: 0 0 0 3px #fff, 0 0 0 5px #a5b4fc; }
          #noise-cancellation-indicator { display: none; }
          .bg-gray-100 { background-color: #f3f4f6; }
          .text-gray-800 { color: #1f2937; }
          .container { width: 100%; margin-right: auto; margin-left: auto; max-width: 1280px; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .p-4 { padding: 1rem; }
          .md:p-8 { padding: 2rem; }
          .min-h-screen { min-height: 100vh; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .space-x-3 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.75rem; }
          .mb-8 { margin-bottom: 2rem; }
          .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
          .md:text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
          .font-extrabold { font-weight: 800; }
          .text-indigo-700 { color: #4338ca; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .md:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-8 { gap: 2rem; }
          .p-6 { padding: 1.5rem; }
          .bg-white { background-color: #fff; }
          .rounded-3xl { border-radius: 1.5rem; }
          .shadow-xl { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
          .col-span-1 { grid-column: span 1 / span 1; }
          .md:col-span-2 { grid-column: span 2 / span 2; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .font-bold { font-weight: 700; }
          .mb-6 { margin-bottom: 1.5rem; }
          .text-indigo-600 { color: #4f46e5; }
          .sm:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-6 { gap: 1.5rem; }
          .bg-rose-50 { background-color: #fff1f2; }
          .rounded-2xl { border-radius: 1rem; }
          .flex-col { flex-direction: column; }
          .text-red-500 { color: #ef4444; }
          .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .font-semibold { font-weight: 600; }
          .text-gray-600 { color: #4b5563; }
          .text-5xl { font-size: 3rem; line-height: 1; }
          .text-red-600 { color: #dc2626; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .font-medium { font-weight: 500; }
          .mt-4 { margin-top: 1rem; }
          .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .rounded-full { border-radius: 9999px; }
          .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 300ms; }
          .duration-300 { transition-duration: 300ms; }
          .bg-green-200 { background-color: #d1fae5; }
          .text-green-800 { color: #065f46; }
          .bg-red-200 { background-color: #fee2e2; }
          .text-red-800 { color: #991b1b; }
          .bg-blue-50 { background-color: #eff6ff; }
          .relative { position: relative; }
          .text-blue-500 { color: #3b82f6; }
          .text-blue-600 { color: #2563eb; }
          .absolute { position: absolute; }
          .top-4 { top: 1rem; }
          .right-4 { right: 1rem; }
          .h-4 { height: 1rem; }
          .w-4 { width: 1rem; }
          .bg-blue-500 { background-color: #3b82f6; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .bg-blue-600 { background-color: #2563eb; }
          .text-white { color: #fff; }
          .shadow-md { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
          .hover:bg-blue-700:hover { background-color: #1d4ed8; }
          .bg-red-500 { background-color: #ef4444; }
          .hover:bg-red-600:hover { background-color: #dc2626; }
          .block { display: block; }
          .font-medium { font-weight: 500; }
          .text-gray-700 { color: #374151; }
          .mb-2 { margin-bottom: 0.5rem; }
          .w-full { width: 100%; }
          .mt-2 { margin-top: 0.5rem; }
          .text-gray-500 { color: #6b7280; }
          .inline-flex { display: inline-flex; }
          .form-radio { appearance: none; -webkit-appearance: none; height: 1.25rem; width: 1.25rem; border-radius: 9999px; border-width: 1px; border-color: #d1d5db; background-color: #fff; transition: background-color 150ms ease-in-out; }
          .form-radio:checked { background-color: #4f46e5; border-color: transparent; }
          .form-radio:checked:focus { outline: none; box-shadow: 0 0 0 3px #eef2ff; }
          .form-radio:checked:hover { background-color: #4338ca; }
          .text-center { text-align: center; }
          .border-2 { border-width: 2px; }
          .border-dashed { border-style: dashed; }
          .border-gray-300 { border-color: #d1d5db; }
          .hover:border-indigo-400:hover { border-color: #818cf8; }
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .text-indigo-500 { color: #6366f1; }
          .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
          .mr-2 { margin-right: 0.5rem; }
          .bg-green-500 { background-color: #22c55e; }
          .hover:bg-green-600:hover { background-color: #16a34a; }
          .bg-yellow-500 { background-color: #eab308; }
          .hover:bg-yellow-600:hover { background-color: #ca8a04; }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}
      </style>

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />

      {/* Modal (portal) */}
      {showNotification && (
        <Modal onClose={handleCloseNotification} initialFocusRef={closeBtnRef}>
          {/* Icon & Header */}
          <div className="flex flex-col items-center p-6">
            <div className="bg-red-100 text-red-600 p-4 rounded-full shadow-md mb-4">
              <i className="fas fa-exclamation-triangle text-3xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Sensory Overload Alert
            </h2>
            <p className="text-gray-700 text-center leading-relaxed mb-6">
              <span className="font-semibold">{userName}</span> is currently
              experiencing <span className="text-red-500 font-semibold">sensory overload</span>.
              Please assist them as soon as possible.
            </p>
            <button
              ref={closeBtnRef}
              onClick={handleCloseNotification}
              className="px-8 py-2 bg-gradient-to-r from-red-500 to-red-600 text-black font-semibold rounded-full shadow-lg hover:from-red-600 hover:to-red-700 transition-transform transform hover:scale-105"
            >
              Close Alert
            </button>
          </div>
        </Modal>
      )}

      {/* Main Page — add blur + block pointer events when modal active as extra insurance */}
      <div
        aria-hidden={showNotification}
        style={{
          filter: showNotification ? 'blur(3px)' : 'none',
          userSelect: showNotification ? 'none' : 'auto',
        }}
      >
        <Navbar />
        <div className="bg-teal-50 text-gray-800">
          <div className="container mx-auto p-4 md:p-8 min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-center space-x-3 mb-8"></header>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Live Dashboard Section */}
              <div className="p-6 bg-white rounded-3xl shadow-xl col-span-1 md:col-span-2">
                <h2 className="text-2xl font-bold mb-6 text-indigo-600">Live Dashboard</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex gap-6 bg-teal-50">
                    {/* Heart Rate Display Card */}
                    <div
                      className={`p-6  rounded-2xl flex flex-col items-center justify-center w-full max-w-sm 
                        ${isStressed ? 'bg-rose-50' : 'bg-blue-50'}`}
                    >
                      <i
                        className={`fas fa-heartbeat text-4xl mb-3 animate-pulse 
                          ${isStressed ? 'text-red-500' : 'text-teal-500'}`}
                      ></i>
                      <span className="text-sm font-semibold text-gray-600">Heart Rate</span>
                      <span
                        id="heart-rate-display"
                        className={`text-5xl font-extrabold ${isStressed ? 'text-red-600' : 'text-teal-600'}`}
                      >
                        {heartRate}
                      </span>
                      <span
                        className={`text-xl font-medium ${isStressed ? 'text-red-500' : 'text-teal-500'}`}
                      >
                        BPM
                      </span>
                      <span
                        className={`mt-4 px-3 py-2 rounded-full text-sm font-semibold transition-colors duration-300 
                          ${isStressed ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}
                      >
                        {isStressed ? 'Stressed' : 'Calm'}
                      </span>
                    </div>

                    {/* Noise Cancellation Status Card */}
                    <div className="p-6 bg-blue-50 rounded-2xl flex flex-col items-center justify-center relative w-full max-w-sm">
                      <i className="fas fa-volume-mute text-blue-500 text-4xl mb-3"></i>
                      <span className="text-sm font-semibold text-gray-600">Noise Cancellation</span>
                      <span className={`text-4xl font-extrabold ${isNoiseCancellationOn ? 'text-green-600' : 'text-blue-600'}`}>
                        {isNoiseCancellationOn ? 'On' : 'Off'}
                      </span>
                      <div
                        id="noise-cancellation-indicator"
                        style={{ display: isNoiseCancellationOn ? 'flex' : 'none' }}
                        className="absolute top-4 right-4 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <span className="pulse-ring bg-blue-500"></span>
                      </div>
                      <button
                        onClick={handleManualToggle}
                        className={`mt-4 px-4 py-2 text-white font-semibold rounded-full shadow-md transition-colors duration-300 
                          ${isNoiseCancellationOn ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {isNoiseCancellationOn ? 'Turn Off' : 'Turn On'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Dashboard Section */}
              <div className="p-6 bg-white rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-indigo-600">Settings</h2>

                {/* Heart Rate Slider for Simulation */}
                <div className="mb-6">
                  <label htmlFor="heart-rate-slider" className="block text-sm font-medium text-gray-700 mb-2">Simulate Heart Rate (BPM)</label>
                  <input
                    type="range"
                    id="heart-rate-slider"
                    min="50"
                    max="150"
                    value={heartRate}
                    onChange={(e) => setHeartRate(parseInt(e.target.value))}
                    style={{ '--progress': `${(heartRate - 50) / (150 - 50) * 100}%` }}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-500 mt-2">Adjust heart rate to trigger stress response.</span>
                </div>

                {/* Stress Threshold Setting (kept but empty label in original) */}
                <div className="mb-6">
                  <label htmlFor="stress-threshold" className="block text-sm font-medium text-gray-700 mb-2"></label>
                </div>

                {/* Calming Audio Source Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audio Source</label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="audio-source"
                        value="white-noise"
                        checked={audioSource === 'white-noise'}
                        onChange={() => setAudioSource('white-noise')}
                        className="form-radio text-indigo-600"
                        id="white-noise-radio"
                      />
                      <span className="ml-2">White Noise</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="audio-source"
                        value="custom-audio"
                        checked={audioSource === 'custom-audio'}
                        onChange={() => setAudioSource('custom-audio')}
                        className="form-radio text-indigo-600"
                        id="custom-audio-radio"
                      />
                      <span className="ml-2">Custom Audio</span>
                    </label>
                  </div>
                </div>

                {/* Custom Audio Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Custom Calming Audio</label>
                  <div className="relative border-2 border-dashed border-gray-300 p-4 rounded-xl text-center hover:border-indigo-400 transition-colors duration-300">
                    <input type="file" id="audio-upload" className="custom-file-input" accept=".mp3, .wav" onChange={handleFileUpload} />
                    <p className="text-gray-500 text-sm">Click to upload or drag and drop a file</p>
                    <p id="uploaded-file-name" className="text-xs text-indigo-500 mt-2">{customAudioFile ? customAudioFile.name : ''}</p>
                  </div>
                </div>
              </div>

              {/* Audio Playback Controls */}
              <div className="p-6 bg-white rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-indigo-600">Audio Playback</h2>
                <div className="flex flex-col space-y-4">
                  <p className="text-sm font-medium text-gray-700">
                    Currently Playing:{' '}
                    <span className="font-bold">
                      {isNoiseCancellationOn ? (audioSource === 'white-noise' ? 'White Noise' : (customAudioFile ? customAudioFile.name : 'Custom Audio')) : 'None'}
                    </span>
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        // ensure audio context resumed if needed
                        createAudioContext();
                        if (audioContext.current && audioContext.current.state === 'suspended') {
                          audioContext.current.resume().then(() => {
                            setIsNoiseCancellationOn(true);
                            playCalmingAudio();
                          });
                        } else {
                          setIsNoiseCancellationOn(true);
                          playCalmingAudio();
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors duration-300"
                    >
                      <i className="fas fa-play mr-2"></i> Play
                    </button>
                    <button
                      onClick={() => audioContext.current && audioContext.current.suspend()}
                      className="flex-1 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-full hover:bg-yellow-600 transition-colors duration-300"
                    >
                      <i className="fas fa-pause mr-2"></i> Pause
                    </button>
                    <button
                      onClick={() => {
                        stopAudio();
                        setIsNoiseCancellationOn(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors duration-300"
                    >
                      <i className="fas fa-stop mr-2"></i> Stop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* end main content */}
    </>
  );
};

export default App;
