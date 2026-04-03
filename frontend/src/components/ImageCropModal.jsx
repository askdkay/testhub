import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiX, FiCheck, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi';

function ImageCropModal({ image, onClose, onCropComplete }) {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const imgRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1,
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
    }

    async function getCroppedImg() {
        if (!completedCrop || !imgRef.current) return;

        const canvas = document.createElement('canvas');
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext('2d');
        const pixelRatio = window.devicePixelRatio;

        canvas.width = completedCrop.width * pixelRatio * scaleX;
        canvas.height = completedCrop.height * pixelRatio * scaleY;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
                resolve(file);
            }, 'image/jpeg', 0.95);
        });
    }

    const handleSave = async () => {
        const croppedFile = await getCroppedImg();
        if (croppedFile) {
            onCropComplete(croppedFile);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full"
            >
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Crop Profile Picture</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1}
                        circularCrop
                        className="max-h-96"
                    >
                        <img
                            ref={imgRef}
                            src={image}
                            alt="Crop"
                            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                            onLoad={onImageLoad}
                            className="max-w-full max-h-96 object-contain"
                        />
                    </ReactCrop>

                    <div className="flex justify-center gap-4 mt-4">
                        <button
                            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                        >
                            <FiZoomOut size={20} />
                        </button>
                        <button
                            onClick={() => setScale(s => Math.min(2, s + 0.1))}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                        >
                            <FiZoomIn size={20} />
                        </button>
                        <button
                            onClick={() => setRotate(r => r + 90)}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                        >
                            <FiRotateCw size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold flex items-center gap-2"
                    >
                        <FiCheck />
                        Apply & Save
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default ImageCropModal;