"use client";
import { useEffect, useState } from "react";
import AddUrlButton from "./AddUrlButton";
import DeleteModal from "./DeleteModal";
import { toast } from "sonner";
import { deleteLink, getMyLinks } from "@/lib/api";
import { motion } from "framer-motion";

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
                        {origin ? `${origin}/${link.slug}` : `/${link.slug}`}
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

      {/* Delete Modal */}
      {deleteModalOpen && (
        <DeleteModal
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          isDeleting={deleting}
        />
      )}
    </div>
  );
}
