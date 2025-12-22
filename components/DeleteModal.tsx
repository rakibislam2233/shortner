"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteModal({
  onClose,
  onConfirm,
  isDeleting,
}: DeleteModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Lock background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Close on ESC
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, isDeleting]);

  const modal = (
    <div
      className="fixed inset-0 z-[9999] bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={!isDeleting ? onClose : undefined}
    >
      {/* Centering wrapper with spacing */}
      <div
        className="flex lg:h-screen w-screen items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-md"
        >
          {/* Header with Warning Icon */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center rounded-t-lg">
            <h2 className="text-lg font-semibold text-white">Delete Link</h2>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-white/90 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-4">
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-base">
                Are you sure you want to delete this link?
              </p>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 py-2 px-4 rounded-md">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="font-medium">
                  This action cannot be undone
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                No
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className={`bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white px-8 py-2 rounded-md shadow transition-opacity duration-200 flex items-center justify-center space-x-2 min-w-[80px] ${
                  isDeleting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
