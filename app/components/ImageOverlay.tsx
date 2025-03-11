import { useRef } from 'react'

interface ImageOverlayProps {
  generatedImageUrl: string | null;
  dimensions: {
    width: number;
    height: number;
  };
}

export default function ImageOverlay({ generatedImageUrl, dimensions }: ImageOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div 
      className="absolute top-0 left-0" 
      ref={containerRef}
      style={{
        width: dimensions.width,
        height: dimensions.height
      }}
    >
      {generatedImageUrl && (
        <img
          src={generatedImageUrl}
          alt="Generated overlay"
          className="absolute top-0 left-0 object-cover z-20"
          style={{
            width: dimensions.width,
            height: dimensions.height
          }}
        />
      )}
    </div>
  )
} 