import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
    onImagesChange: (images: UploadedImage[]) => void;
    maxImages?: number;
}

export interface UploadedImage {
    id: string;
    data: string; // base64
    mimeType: string;
    preview: string;
    name: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesChange, maxImages = 16 }) => {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (files: FileList | null) => {
        if (!files) return;

        const newImages: UploadedImage[] = [];
        const remainingSlots = maxImages - images.length;

        for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target?.result as string;
                const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix

                const uploadedImage: UploadedImage = {
                    id: `${Date.now()}-${i}`,
                    data: base64Data,
                    mimeType: file.type,
                    preview: base64,
                    name: file.name,
                };

                newImages.push(uploadedImage);

                if (newImages.length === Math.min(files.length, remainingSlots)) {
                    const updatedImages = [...images, ...newImages];
                    setImages(updatedImages);
                    onImagesChange(updatedImages);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeImage = (id: string) => {
        const updatedImages = images.filter(img => img.id !== id);
        setImages(updatedImages);
        onImagesChange(updatedImages);
    };

    const handleCameraCapture = () => {
        // Trigger file input with camera
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment');
            fileInputRef.current.click();
        }
    };

    return (
        <div className="w-full">
            {/* Upload Area */}
            {images.length < maxImages && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                        transition-all duration-200
                        ${isDragging
                            ? 'border-cyan-400 bg-cyan-500/10'
                            : 'border-white/20 hover:border-cyan-400/50 bg-white/5'
                        }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />

                    <Upload className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                    <p className="text-sm text-gray-400">
                        Drop images here or click to upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {images.length}/{maxImages} images • PNG, JPG, GIF
                    </p>

                    <div className="flex gap-2 justify-center mt-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                            className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-400 text-xs transition-all"
                        >
                            <ImageIcon className="w-3 h-3 inline mr-1" />
                            Browse
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCameraCapture();
                            }}
                            className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded text-purple-400 text-xs transition-all"
                        >
                            <Camera className="w-3 h-3 inline mr-1" />
                            Camera
                        </button>
                    </div>
                </div>
            )}

            {/* Image Previews */}
            <AnimatePresence>
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-4 gap-2 mt-3"
                    >
                        {images.map((image) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative group aspect-square"
                            >
                                <img
                                    src={image.preview}
                                    alt={image.name}
                                    className="w-full h-full object-cover rounded border border-white/10"
                                />
                                <button
                                    onClick={() => removeImage(image.id)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                    {image.name}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageUpload;
