'use client'

import { useState } from "react";

export default function OperatorMessage({ content, imageIds = [] }: OperatorMessageProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (<>
        <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-primary">
                {content && <p>{content}</p>}
                {imageIds.length > 0 && (
                    <div className="flex flex-row flex-wrap gap-3 mt-3">
                        {imageIds.map((imageId) => (
                            <div
                                key={imageId}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedImage(imageId)}
                            >
                                <img
                                    src={`http://localhost:8000/img/${imageId}`}
                                    alt={imageId}
                                    className="h-32 w-32 object-cover rounded-lg"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {selectedImage && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                onClick={() => setSelectedImage(null)}
            >
                <div
                    className="relative max-w-[80vh] max-h-[80vh] bg-base-100 rounded-lg overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={`http://localhost:8000/img/${selectedImage}`}
                        alt={selectedImage}
                        className="w-full h-full object-contain"
                    />
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost bg-base-100 hover:bg-base-200"
                    >
                        ✕
                    </button>
                </div>
            </div>
        )}
    </>)
}

interface OperatorMessageProps extends React.HTMLProps<'div'> {
    content: string,
    imageIds?: string[],
}