"use client";
import ProtectedRoute from "@/components/ProtectedRoute ";
import Table from "../components/Table";
import Header from "@/components/Header";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Table />
    </ProtectedRoute>
  );
}
