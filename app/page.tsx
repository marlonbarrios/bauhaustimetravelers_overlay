'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as fal from '@fal-ai/serverless-client';
import ImageOverlay from './components/ImageOverlay'

fal.config({
  proxyUrl: '/api/fal/proxy',
});

const seed = Math.floor(Math.random() * 100000);

// Update dimensions to be more proportional
const DIMENSIONS = {
  width: 1280,  // More reasonable width
  height: 960   // Maintaining 4:3 aspect ratio
};

export default function Home() {
  const [input, setInput] = useState('realistic only one human body of different genders, ethnicities, ages and epochs with strange sculptural transparent colorful goggles and body armor the style of bauhaus and mondrian, dramatic light and plain background, calder mobiles hats, photo-realistic');
  const [image, setImage] = useState<string | null>(null);
  const [strength, setStrength] = useState(0.50);
  const [audioSrc] = useState('/bauhaus.mp3');
  const webcamRef = useRef<Webcam>(null);

  const baseArgs = useCallback(() => ({
    sync_mode: true,
    strength,
  }), [strength]);

  const getDataUrl = useCallback(async () => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return null;

    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Failed to get canvas context');
          return;
        }
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.src = screenshot;
    });
  }, [webcamRef]);

  useEffect(() => {
    const captureImageAndSend = async () => {
      const dataUrl = await getDataUrl();
      if (dataUrl) {
        fal.realtime.connect('110602490-sdxl-turbo-realtime', {
          connectionKey: 'fal-ai/fast-lightning-sdxl',
          onResult: (result) => {
            if (result.error) return;
            setImage(result.images[0].url);
          },
        }).send({
          ...baseArgs(),
          prompt: input,
          image_url: dataUrl,
        });
      }
    };

    const captureInterval = 20;
    const intervalId = setInterval(captureImageAndSend, captureInterval);
    return () => clearInterval(intervalId);
  }, [getDataUrl, baseArgs, input]);

  return (
    <main className="min-h-screen">
      <div className="fixed inset-0 flex flex-col items-center justify-start p-4 bg-black gap-4">
        <div className="text-center">
          <h1 className="text-base text-white">
            bauhaus time traveler | duet in <a href='https://en.wikipedia.org/wiki/Latent_spacelatent' className="underline">latent space</a> | 
            <span className="opacity-70"> by <a href='https://marlonbarrios.github.io/' className="underline">marlon barrios solano</a> | 
            <a href='https://lakestudiosberlin.com/' className="underline">Lake Studios Berlin</a> 2024</span>
          </h1>
        </div>

        <div className="relative overflow-hidden" style={{ width: DIMENSIONS.width, height: DIMENSIONS.height }}>
          <ImageOverlay generatedImageUrl={image} dimensions={DIMENSIONS} />
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={DIMENSIONS.width}
            height={DIMENSIONS.height}
            className="absolute top-0 left-0 z-20 mix-blend-soft-light"
            style={{ 
              transform: 'scaleX(-1)',
              opacity: 0.7,
              transition: 'opacity 0.3s ease-in-out'
            }}
            videoConstraints={{
              width: DIMENSIONS.width,
              height: DIMENSIONS.height,
              facingMode: "user"
            }}
          />
        </div>

        <div className="z-30 flex items-center justify-center gap-4 w-full">
          <textarea 
            className='border rounded-lg p-1 w-[600px] text-black resize-none h-7 text-xs'
            value={input} 
            onChange={(e) => setInput(e.target.value)}
          />
          <audio 
            controls 
            src={audioSrc} 
            loop
            className="w-32 h-7"
          >
            Your browser does not support the audio element.
          </audio>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={strength} 
              onChange={(e) => setStrength(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="w-8 text-xs text-white">{strength}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
