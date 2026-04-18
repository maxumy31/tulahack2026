'use client'

import { useState } from 'react';

interface ComplexityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (complexity: number) => void;
}

export default function ComplexityModal({ isOpen, onClose, onConfirm }: ComplexityModalProps) {
    const [complexity, setComplexity] = useState(5);

    const handleConfirm = () => {
        onConfirm(complexity);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open">
            <form method="dialog" className="modal-box">
                <button
                    type="button"
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>
                
                <h3 className="font-bold text-lg mb-4">Оцените сложность задачи</h3>
                
                <div className="py-6">
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-sm font-medium">Сложность:</span>
                        <span className="text-2xl font-bold text-primary">{complexity}</span>
                    </div>
                    
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={complexity}
                        onChange={(e) => setComplexity(Number(e.target.value))}
                        className="range range-primary w-full mt-4"
                    />
                    
                    <div className="flex justify-between text-xs text-base-content opacity-60 mt-2 px-2">
                        <span>1 - Очень просто</span>
                        <span>10 - Очень сложно</span>
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleConfirm}
                    >
                        Подтвердить
                    </button>
                </div>
            </form>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    );
}
