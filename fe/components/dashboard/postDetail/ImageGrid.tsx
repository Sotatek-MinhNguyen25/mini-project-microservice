import Image from 'next/image';
import { useState } from 'react';
import { ImageGallery } from './ImageGallery';

interface ImageType {
  id: string;
  url: string;
  altText: string;
}

interface ImageGridProps {
  images: ImageType[];
}

export function ImageGrid({ images }: ImageGridProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (images.length === 0) return null;

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  // Layout for 1-2 images: display normally
  if (images.length <= 2) {
    return (
      <>
        <div className="grid gap-3 rounded-xl overflow-hidden">
          {images.map((image, index) => (
            <div 
              key={image.id} 
              className="relative group cursor-pointer"
              onClick={() => openGallery(index)}
            >
              <Image
                src={image.url || '/placeholder.svg'}
                alt={image.altText}
                width={800}
                height={600}
                className="rounded-xl object-cover w-full max-h-96 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        <ImageGallery
          images={images}
          isOpen={isGalleryOpen}
          onClose={closeGallery}
          initialIndex={selectedImageIndex}
        />
      </>
    );
  }

  // Layout for 3+ images: 1 big left, 2 right (or 1 big left, 1 right top, counter right bottom)
  const mainImage = images[0];
  const sideImages = images.slice(1);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 rounded-xl overflow-hidden h-96">
        {/* Main image - left side */}
        <div 
          className="relative group cursor-pointer"
          onClick={() => openGallery(0)}
        >
          <Image
            src={mainImage.url || '/placeholder.svg'}
            alt={mainImage.altText}
            width={400}
            height={400}
            className="rounded-xl object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Right side */}
        <div className="flex flex-col gap-3">
          {/* Second image - right top */}
          <div 
            className="relative group cursor-pointer flex-1"
            onClick={() => openGallery(1)}
          >
            <Image
              src={sideImages[0]?.url || '/placeholder.svg'}
              alt={sideImages[0]?.altText || ''}
              width={400}
              height={200}
              className="rounded-xl object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Third image or counter - right bottom */}
          <div className="relative group cursor-pointer flex-1">
            {images.length === 3 ? (
              <div onClick={() => openGallery(2)}>
                <Image
                  src={sideImages[1]?.url || '/placeholder.svg'}
                  alt={sideImages[1]?.altText || ''}
                  width={400}
                  height={200}
                  className="rounded-xl object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div 
                className="relative"
                onClick={() => openGallery(2)}
              >
                <Image
                  src={sideImages[1]?.url || '/placeholder.svg'}
                  alt={sideImages[1]?.altText || ''}
                  width={400}
                  height={200}
                  className="rounded-xl object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay with count */}
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center group-hover:bg-black/70 transition-colors duration-300">
                  <span className="text-white text-2xl font-bold">
                    +{images.length - 2}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageGallery
        images={images}
        isOpen={isGalleryOpen}
        onClose={closeGallery}
        initialIndex={selectedImageIndex}
      />
    </>
  );
}
