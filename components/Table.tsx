"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AddUrlButton from "./AddUrlButton";
import { toast } from "sonner";
import Link from "next/link";
import { deleteLink, getMyLinks } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export interface LinkEntry {
  _id: string;
  imageName: string;
  slug: string;
  image: string;
  urlMobile: string;
  urlDesktop?: string;
  createdAt: string;
}

export default function Table() {
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("");

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const response = await getMyLinks(token);
        setLinks(response.data || []);
      } catch (error) {
        console.error("Error fetching links:", error);
        toast.error("Failed to load links");
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      setMounted(true);
      fetchLinks();
    }
  }, []);

  // Function to refresh links
  const refreshLinks = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await getMyLinks(token);
      setLinks(response.data || []);
    } catch (error) {
      console.error("Error refreshing links:", error);
      toast.error("Failed to refresh links");
    }
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
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

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

  // Beautiful Delete Confirmation Modal
  const DeleteModal = () => {
    useEffect(() => {
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
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={closeDeleteModal}
        >
          <div
            className="flex min-h-screen w-screen items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Animated Warning Icon */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 px-6 pt-8 pb-4 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg mb-4"
                >
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-800"
                >
                  Delete Link?
                </motion.h2>
              </div>

              {/* Body */}
              <div className="px-6 py-6 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-3"
                >
                  <p className="text-gray-600 text-base">
                    Are you sure you want to delete this link?
                  </p>

                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>This action cannot be undone</span>
                  </div>
                </motion.div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 px-6 pb-6 pt-2"
              >
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
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
          <AddUrlButton onCreated={refreshLinks} />
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
                filtered?.map((link, idx) => (
                  <motion.tr
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
                      <a
                        href={`/${link.slug}`}
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {origin
                          ? `${origin}/${link.imageName}`
                          : `/${link.imageName}`}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                      <button
                        onClick={() => openDeleteModal(link._id)}
                        className="underline hover:text-red-700 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
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
