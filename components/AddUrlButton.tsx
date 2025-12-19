"use client";
import { useState } from "react";
import AddUrlModal from "./AddUrlModal";

interface AddUrlButtonProps {
  onCreated: () => void;
}
export default function AddUrlButton({ onCreated }: AddUrlButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 text-white px-4 py-2 rounded-md shadow transition-opacity duration-200"
      >
        Add URL
      </button>
      {open && (
        <AddUrlModal
          onClose={() => setOpen(false)}
          onCreated={() => {
            onCreated();
          }}
        />
      )}
    </>
  );
}
