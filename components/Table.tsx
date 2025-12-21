"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AddUrlButton from "./AddUrlButton";
import { toast } from "sonner";
import Link from "next/link";
import { deleteLink } from "@/lib/api";

interface LinkEntry {
  _id: string;
  imageName: string;
  image: string;
  urlMobile: string;
  urlDesktop?: string;
  createdAt: string;
}

interface TableProps {
  initialLinks: LinkEntry[];
}

export default function Table({ initialLinks }: TableProps) {
  const [links, setLinks] = useState<LinkEntry[]>(initialLinks);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("");

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      setMounted(true);
    }
  }, []);

  const handleCreated = (newLink: LinkEntry) => {
    setLinks(prev => [newLink, ...prev]);
  };

  // Filter the list based on the search term
  const filtered = links.filter((link) =>
    link?.imageName?.toLowerCase().includes(search.toLowerCase())
  );

  // Open delete modal
  const openDeleteModal = (linkId: string) => {
    setLinkToDelete(linkId);
    setDeleteModalOpen(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModalOpen(false);
    setLinkToDelete(null);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!linkToDelete || deleting) return;

    setDeleting(true);
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      await deleteLink(token, linkToDelete);
      setLinks((prev) => prev.filter((item) => item._id !== linkToDelete));
      toast.success("Link deleted successfully");
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete link");
    } finally {
      setDeleting(false);
    }
  };

  // Delete Confirmation Modal Component (styled like AddUrlModal)
  const DeleteModal = () => {
    useEffect(() => {
      // Lock scroll
      document.body.style.overflow = "hidden";

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeDeleteModal();
      };
      document.addEventListener("keydown", handleEsc);

      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEsc);
      };
    }, []);

    if (!deleteModalOpen || !mounted) return null;

    const modalContent = (
      <div
        className="fixed inset-0 z-[9999] bg-black/50"
        role="dialog"
        aria-modal="true"
        onClick={closeDeleteModal}
      >
        <div
          className="flex lg:h-screen w-screen items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in mt-20 lg:mt-0">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete
              </h2>
              <button
                onClick={closeDeleteModal}
                className="text-white/90 hover:text-white transition"
                aria-label="Close modal"
                disabled={deleting}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-8 text-center space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete this link?
              </p>
              <p className="text-lg font-semibold text-red-600">
                "{links.find(l => l._id === linkToDelete)?.imageName}"
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between px-6 pb-6 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md transition disabled:opacity-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={`bg-gradient-to-r from-red-600 to-pink-600 hover:opacity-90 text-white px-6 py-2 rounded-md shadow transition-opacity duration-200 ${
                  deleting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-2xl border border-gray-200">
        {/* Header with Add URL button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tighter text-gray-800 border-l-4 border-blue-600 pl-3">
            Your Links
          </h1>
          <AddUrlButton onCreated={handleCreated} />
        </div>

        {/* Search input */}
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="Search Image"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  Image Name
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  Mobile Url
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  Desktop Url
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  Short Url
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((link, idx) => (
                  <tr
                    key={link._id}
                    className="hover:bg-gray-50 odd:bg-gray-50 even:bg-white transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {link?.imageName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-700">
                      <a
                        href={link.urlMobile}
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.urlMobile}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-700">
                      {link.urlDesktop ? (
                        <a
                          href={link.urlDesktop}
                          className="underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {link.urlDesktop}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-700">
                      <Link
                        href={`/${link.imageName}`}
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {origin
                          ? `${origin}/${link.imageName}`
                          : `/${link.imageName}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                      <button
                        onClick={() => openDeleteModal(link._id)}
                        className="underline hover:text-red-700 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <DeleteModal />
    </div>
  );
}
