"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";

export default function DataOutfitPage() {
  const API_BASE = "/api/outfit";

  const [outfit, setOutfit] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gambar, setGambar] = useState(null);

  const [listWarna, setListWarna] = useState([]);
const [listBahan, setListBahan] = useState([]);
const [listGaya, setListGaya] = useState([]);


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
    id_warna: "",
    id_bahan: "",
    id_gaya: "",
  });

  useEffect(() => {
    fetchData();
    fetch("/api/warna").then(r => r.json()).then(d => setListWarna(d.data));
  fetch("/api/bahan").then(r => r.json()).then(d => setListBahan(d.data));
  fetch("/api/gaya").then(r => r.json()).then(d => setListGaya(d.data));
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
      id_warna: "",
      id_bahan: "",
      id_gaya: "",
    });
    setGambar(null);
    setModalOpen(true);
  }

  function openEdit(item) {
    setIsEditing(true);
    setForm({
      id_outfit: item.id_outfit,
      kode_outfit: item.kode_outfit,
      nama_outfit: item.nama_outfit,
      harga: item.harga,
      id_warna: item.warna.id_warna,
      id_bahan: item.bahan.id_bahan,
      id_gaya: item.gaya.id_gaya,
    });
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
      `${o.kode_outfit} ${o.nama_outfit} ${o.nama_bahan} ${o.nama_warna} ${o.nama_gaya}`
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
                <td>{item.bahan?.nama_bahan}</td>
<td>{item.warna?.nama_warna}</td>
<td>{item.gaya?.nama_gaya}</td>
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

  {/* KODE */}
  <input
    value={form.kode_outfit}
    onChange={(e) => setForm(s => ({ ...s, kode_outfit: e.target.value }))}
    placeholder="Kode Outfit"
    className="w-full mb-2 p-2 border rounded"
    required
  />

  {/* NAMA */}
  <input
    value={form.nama_outfit}
    onChange={(e) => setForm(s => ({ ...s, nama_outfit: e.target.value }))}
    placeholder="Nama Outfit"
    className="w-full mb-2 p-2 border rounded"
    required
  />

  {/* HARGA */}
  <input
    type="number"
    value={form.harga}
    onChange={(e) => setForm(s => ({ ...s, harga: e.target.value }))}
    placeholder="Harga"
    className="w-full mb-2 p-2 border rounded"
    required
  />

  {/* WARNA */}
  <select
    value={form.id_warna}
    onChange={(e) => setForm(s => ({ ...s, id_warna: e.target.value }))}
    className="w-full mb-2 p-2 border rounded"
    required
  >
    <option value="">-- Pilih Warna --</option>
    {listWarna.map(w => (
      <option key={w.id_warna} value={w.id_warna}>
        {w.nama_warna}
      </option>
    ))}
  </select>

  {/* BAHAN */}
  <select
    value={form.id_bahan}
    onChange={(e) => setForm(s => ({ ...s, id_bahan: e.target.value }))}
    className="w-full mb-2 p-2 border rounded"
    required
  >
    <option value="">-- Pilih Bahan --</option>
    {listBahan.map(b => (
      <option key={b.id_bahan} value={b.id_bahan}>
        {b.nama_bahan}
      </option>
    ))}
  </select>

  {/* GAYA */}
  <select
    value={form.id_gaya}
    onChange={(e) => setForm(s => ({ ...s, id_gaya: e.target.value }))}
    className="w-full mb-2 p-2 border rounded"
    required
  >
    <option value="">-- Pilih Gaya --</option>
    {listGaya.map(g => (
      <option key={g.id_gaya} value={g.id_gaya}>
        {g.nama_gaya}
      </option>
    ))}
  </select>

  {/* GAMBAR */}
  <input
    type="file"
    onChange={(e) => setGambar(e.target.files[0])}
    className="mb-4"
  />

  <div className="flex justify-end gap-2">
    <button type="button" onClick={() => setModalOpen(false)}>
      Batal
    </button>
    <button
      type="submit"
      className="bg-[#E8B4B8] text-white px-4 py-2 rounded"
    >
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
