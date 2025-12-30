"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";

export default function DataNilaiPage() {
  const API_NILAI = "/api/nilai_outfit";
  const API_KRITERIA = "/api/kriteria";
  const API_OUTFIT = "/api/outfit";

  const [nilai, setNilai] = useState([]);
  const [kriteria, setKriteria] = useState([]);
  const [outfit, setOutfit] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 🔍 SEARCH
  const [search, setSearch] = useState("");

  // 📄 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [form, setForm] = useState({
    id_nilai: null,
    id_outfit: "",
    id_kriteria: "",
    nilai: "",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [resNilai, resKriteria, resOutfit] = await Promise.all([
        fetch(API_NILAI),
        fetch(API_KRITERIA),
        fetch(API_OUTFIT),
      ]);

      const jsonNilai = await resNilai.json();
      const jsonKriteria = await resKriteria.json();
      const jsonOutfit = await resOutfit.json();

      setNilai(Array.isArray(jsonNilai.data) ? jsonNilai.data : []);
      setKriteria(Array.isArray(jsonKriteria.data) ? jsonKriteria.data : []);
      setOutfit(Array.isArray(jsonOutfit.data) ? jsonOutfit.data : []);
    } catch (err) {
      setError("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setIsEditing(false);
    setForm({ id_nilai: null, id_outfit: "", id_kriteria: "", nilai: "" });
    setModalOpen(true);
  }

  function openEdit(item) {
    setIsEditing(true);
    setForm(item);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      id_nilai: form.id_nilai,
      id_outfit: Number(form.id_outfit),
      id_kriteria: Number(form.id_kriteria),
      nilai: Number(form.nilai),
    };

    const res = await fetch(API_NILAI, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Gagal menyimpan data");
      return;
    }

    setModalOpen(false);
    fetchAll();
  }

  async function handleDelete(id) {
    if (!confirm("Hapus nilai ini?")) return;

    await fetch(API_NILAI, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_nilai: id }),
    });

    fetchAll();
  }

  const getOutfitName = (id) =>
    outfit.find((o) => o.id_outfit === id)?.nama_outfit || "-";

  const getKriteriaName = (id) =>
    kriteria.find((k) => k.id_kriteria === id)?.nama_kriteria || "-";

  /* ======================
     🔍 FILTER SEARCH
  ====================== */
  const filteredData = useMemo(() => {
    return nilai.filter((n) =>
      `${getOutfitName(n.id_outfit)} ${getKriteriaName(n.id_kriteria)}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [nilai, search, outfit, kriteria]);

  /* ======================
     📄 PAGINATION
  ====================== */
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FADADD] via-[#E8B4B8]/40 to-white p-10 font-[Poppins]">

      <h1 className="text-3xl font-extrabold text-[#9B5C6B] mb-6 text-center">
        📊 Data Nilai Kriteria
      </h1>

      {/* 🔍 SEARCH */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Cari Gamis / kriteria..."
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
              <th>Gamis</th>
              <th>Kriteria</th>
              <th>Nilai</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item, i) => (
              <tr key={item.id_nilai}>
                <td>{startIndex + i + 1}</td>
                <td>{getOutfitName(item.id_outfit)}</td>
                <td>{getKriteriaName(item.id_kriteria)}</td>
                <td>{item.nilai}</td>
                <td className="flex justify-center gap-2">
                  <button onClick={() => openEdit(item)}>✏️</button>
                  <button onClick={() => handleDelete(item.id_nilai)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 📄 PAGINATION */}
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
            ➕ Tambah Nilai
          </button>
        </div>
      </div>

      {/* MODAL (ASLI PUNYAMU – AMAN) */}
      {modalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setModalOpen(false)}
            />

            <form
              onSubmit={handleSubmit}
              className="relative bg-white rounded-2xl p-6 w-[90%] max-w-xl z-10"
            >
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? "Edit Nilai" : "Tambah Nilai"}
              </h2>

              <select
                value={form.id_outfit}
                onChange={(e) =>
                  setForm((s) => ({ ...s, id_outfit: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded"
                required
              >
                <option value="">-- Pilih Gamis --</option>
                {outfit.map((o) => (
                  <option key={o.id_outfit} value={o.id_outfit}>
                    {o.nama_outfit}
                  </option>
                ))}
              </select>

              <select
                value={form.id_kriteria}
                onChange={(e) =>
                  setForm((s) => ({ ...s, id_kriteria: e.target.value }))
                }
                className="w-full mb-3 p-2 border rounded"
                required
              >
                <option value="">-- Pilih Kriteria --</option>
                {kriteria.map((k) => (
                  <option key={k.id_kriteria} value={k.id_kriteria}>
                    {k.nama_kriteria}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                value={form.nilai}
                onChange={(e) =>
                  setForm((s) => ({ ...s, nilai: e.target.value }))
                }
                className="w-full mb-4 p-2 border rounded"
                required
              />

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <button className="bg-[#E8B4B8] text-white px-4 py-2 rounded">
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
