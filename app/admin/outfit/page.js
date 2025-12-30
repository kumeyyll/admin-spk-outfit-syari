"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";

export default function DataOutfitPage() {
  const API_BASE = "/api/outfit";

  const [outfit, setOutfit] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gambar, setGambar] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 🔍 SEARCH
  const [search, setSearch] = useState("");

  // 📄 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    id_outfit: null,
    kode_outfit: "",
    nama_outfit: "",
    harga: "",
    bahan: "",
    warna: "",
    gaya: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const json = await res.json();
      setOutfit(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setIsEditing(false);
    setForm({
      id_outfit: null,
      kode_outfit: "",
      nama_outfit: "",
      harga: "",
      bahan: "",
      warna: "",
      gaya: "",
    });
    setGambar(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setIsEditing(true);
    setForm(item);
    setGambar(null);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
  e.preventDefault();
  const formData = new FormData();

  Object.keys(form).forEach((key) => {
    if (form[key] !== null) formData.append(key, form[key]);
  });

  if (gambar instanceof File) {
    formData.append("gambar", gambar);
  }

  const res = await fetch(API_BASE, {
    method: isEditing ? "PUT" : "POST",
    body: formData,
  });

  if (!res.ok) {
    alert("Gagal menyimpan data");
    return;
  }

  setGambar(null); // 🔥 WAJIB
  setModalOpen(false);
  fetchData();
}


  async function handleDelete(id) {
    if (!confirm("Hapus Gamis ini?")) return;

    await fetch(API_BASE, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_outfit: id }),
    });

    fetchData();
  }

  /* ==========================
     🔍 FILTER SEARCH
  ========================== */
  const filteredData = useMemo(() => {
    return outfit.filter((o) =>
      `${o.kode_outfit} ${o.nama_outfit} ${o.bahan} ${o.warna} ${o.gaya}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [outfit, search]);

  /* ==========================
     📄 PAGINATION
  ========================== */
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FADADD] via-[#E8B4B8]/40 to-white p-10 rounded-3xl font-[Poppins]">

      <h1 className="text-3xl font-extrabold text-[#9B5C6B] mb-6 text-center">
        👗 Data Alternatif (Gamis)
      </h1>

      {/* 🔍 SEARCH */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Cari gamis..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-xl border w-64"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6">

        <table className="w-full text-center border rounded-xl">
          <thead className="bg-[#FADADD]">
            <tr>
              <th>No</th>
              <th>Kode</th>
              <th>Nama</th>
              <th>Harga</th>
              <th>Bahan</th>
              <th>Warna</th>
              <th>Gaya</th>
              <th>Gambar</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item, i) => (
              <tr key={item.id_outfit}>
                <td>{startIndex + i + 1}</td>
                <td>{item.kode_outfit}</td>
                <td>{item.nama_outfit}</td>
                <td>{item.harga}</td>
                <td>{item.bahan}</td>
                <td>{item.warna}</td>
                <td>{item.gaya}</td>
                <td>
                  <img
  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/outfit-images/${item.gambar}`}
  className="w-16 h-16 mx-auto rounded"
/>

                </td>
                <td>
                  <button onClick={() => openEdit(item)}>✏️</button>
                  <button onClick={() => handleDelete(item.id_outfit)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 📄 PAGINATION BUTTON */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ⬅️ Prev
          </button>

          <span>
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next ➡️
          </button>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={openAdd}
            className="bg-[#E8B4B8] text-white px-6 py-2 rounded-xl"
          >
            ➕ Tambah Gamis
          </button>
        </div>
      </div>

      {/* MODAL (punyamu tetap aman, GA DIUBAH) */}
      {modalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setModalOpen(false)}
            />
            <form
              onSubmit={handleSubmit}
              className="relative bg-white rounded-xl p-6 z-10 w-[90%] max-w-xl"
            >
              <h2 className="text-xl mb-4">
                {isEditing ? "Edit Gamis" : "Tambah Gamis"}
              </h2>

              {["kode_outfit","nama_outfit","harga","bahan","warna","gaya"].map((f) => (
                <input
                  key={f}
                  value={form[f] ?? ""}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, [f]: e.target.value }))
                  }
                  placeholder={f.replace("_"," ")}
                  className="w-full mb-2 p-2 border rounded"
                  required
                />
              ))}

              <input type="file" onChange={(e) => setGambar(e.target.files[0])} />

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="bg-[#E8B4B8] text-white px-4 py-2 rounded">
                  Simpan
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </div>
  );
}
