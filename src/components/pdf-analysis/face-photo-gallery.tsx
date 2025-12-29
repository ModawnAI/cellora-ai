'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Eye, SunDim, Sparkle, ArrowRight } from '@phosphor-icons/react';
import Image from 'next/image';

interface FacePhoto {
  id: string;
  src: string;
  type: 'regular' | 'uv';
  page: number;
  label?: string;
}

interface FacePhotoGalleryProps {
  photos: FacePhoto[];
  className?: string;
}

function PhotoCard({ photo, index }: { photo: FacePhoto; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['17.5deg', '-17.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-17.5deg', '17.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const isUV = photo.type === 'uv';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative group cursor-pointer"
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: isUV
              ? 'linear-gradient(45deg, rgba(138, 43, 226, 0.4), rgba(0, 191, 255, 0.4))'
              : 'linear-gradient(45deg, rgba(208, 235, 186, 0.4), rgba(130, 114, 99, 0.4))',
            filter: 'blur(20px)',
            transform: 'translateZ(-10px)',
          }}
        />

        {/* Image container */}
        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-cellora-warm-gray/20 group-hover:border-cellora-dark-green/40 transition-colors duration-300 shadow-lg">
          <Image
            src={photo.src}
            alt={photo.label || `Face photo ${index + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Type badge */}
          <motion.div
            className="absolute top-3 left-3 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2"
            style={{
              background: isUV
                ? 'rgba(138, 43, 226, 0.8)'
                : 'rgba(208, 235, 186, 0.8)',
              transform: 'translateZ(30px)',
            }}
          >
            {isUV ? (
              <SunDim size={16} weight="fill" className="text-white" />
            ) : (
              <Eye size={16} weight="fill" className="text-cellora-dark-green" />
            )}
            <span className={`text-xs font-medium ${isUV ? 'text-white' : 'text-cellora-dark-green'}`}>
              {isUV ? 'UV Analysis' : 'Standard'}
            </span>
          </motion.div>

          {/* Page number */}
          <motion.div
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
            style={{ transform: 'translateZ(30px)' }}
          >
            <span className="text-xs font-mono text-white">{photo.page}</span>
          </motion.div>

          {/* Bottom info bar */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between"
                style={{ transform: 'translateZ(40px)' }}
              >
                <div className="flex items-center gap-2">
                  <Sparkle size={16} weight="fill" className="text-cellora-mint" />
                  <span className="text-sm text-white font-medium">
                    {photo.label || `Page ${photo.page}`}
                  </span>
                </div>
                <motion.div
                  className="w-8 h-8 rounded-full bg-cellora-mint/80 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <ArrowRight size={16} weight="bold" className="text-cellora-dark-green" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function FacePhotoGallery({ photos, className = '' }: FacePhotoGalleryProps) {
  const regularPhotos = photos.filter(p => p.type === 'regular');
  const uvPhotos = photos.filter(p => p.type === 'uv');

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-cellora-dark-green mb-2">
          Face Analysis Gallery
        </h2>
        <p className="text-cellora-warm-gray">
          {photos.length} photos extracted from your skin analysis report
        </p>
      </motion.div>

      {/* Regular photos section */}
      {regularPhotos.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cellora-mint/30 flex items-center justify-center">
              <Eye size={18} weight="fill" className="text-cellora-dark-green" />
            </div>
            <h3 className="text-xl font-semibold text-cellora-dark-green">Standard Photos</h3>
            <span className="text-sm text-cellora-warm-gray">({regularPhotos.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
            {regularPhotos.map((photo, index) => (
              <PhotoCard key={photo.id} photo={photo} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* UV photos section */}
      {uvPhotos.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <SunDim size={18} weight="fill" className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-cellora-dark-green">UV Analysis Photos</h3>
            <span className="text-sm text-cellora-warm-gray">({uvPhotos.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: '1200px' }}>
            {uvPhotos.map((photo, index) => (
              <PhotoCard key={photo.id} photo={photo} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
