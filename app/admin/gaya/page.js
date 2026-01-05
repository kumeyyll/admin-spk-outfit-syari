"use client";

import React, { useEffect, useState } from "react";


export default function DataGayaPage() {
  const API_BASE = "/api/gaya";

  const [gaya, setGaya] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id_gaya: null,
    nama_gaya: "",
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
      setGaya(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setIsEditing(false);
    setForm({ id_gaya: null, nama_gaya: "" });
    setModalOpen(true);
  }

  function openEdit(item) {
    setIsEditing(true);
    setForm({
      id_gaya: item.id_gaya,
      nama_gaya: item.nama_gaya ?? "",
    });
    setModalOpen(true);
  }

    async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      id_gaya: form.id_gaya,
      nama_gaya: form.nama_gaya.trim(),
    };

    // Validasi form
    if (!payload.nama_gaya) {
      alert("Mohon isi semua field dengan benar");
      return;
    }

    try {
      let res; // ✅ deklarasi dulu di sini

      if (isEditing) {
        // === PUT (EDIT) ===
        res = await fetch(API_BASE, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal update gaya");
      } else {
        // === POST (TAMBAH) ===
        res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Gagal tambah gaya");
      }

      await fetchData();
      setModalOpen(false);
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    }
  }

  async function handleDelete(id) {
    const ok = confirm("Hapus gaya ini?");
    if (!ok) return;

    try {
      const res = await fetch(API_BASE, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_gaya: id }), // ✅ kirim id dari parameter
      });

      if (!res.ok) throw new Error("Gagal menghapus gaya");

      // update list
      setGaya((prev) => prev.filter((p) => p.id_gaya !== id)); // ✅ pakai id dari parameter
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    }
  }
    

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FADADD] via-[#E8B4B8]/40 to-white p-10 rounded-3xl font-[Poppins] transition-all duration-300">
      <h1 className="text-3xl font-extrabold text-[#9B5C6B] mb-10 text-center tracking-wide drop-shadow-sm">
        ✨ Data Gaya ✨
      </h1>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-[#E8B4B8]/30">
        {loading && <div className="text-center py-4">Loading...</div>}
        {error && <div className="text-red-500 text-center py-2">{error}</div>}

        <table className="w-full text-center border border-[#FADADD] rounded-2xl overflow-hidden">
          <thead className="bg-[#FADADD] text-[#9B5C6B] font-semibold">
            <tr>
              <th className="border border-[#FADADD] p-3">No</th>
              <th className="border border-[#FADADD] p-3">Nama Gaya</th>
              <th className="border border-[#FADADD] p-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 bg-white/70">
            {gaya.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" className="p-6">Belum ada data</td>
              </tr>
            ) : (
              gaya.map((item, i) => (
                <tr key={item.id_gaya} className="hover:bg-[#FADADD]/30 transition-all duration-200">
                  <td className="border border-[#FADADD] p-3">{i + 1}</td>
                  <td className="border border-[#FADADD] p-3">{item.nama_gaya}</td>
                  <td className="border border-[#FADADD] p-3 flex justify-center gap-3">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-[#E8B4B8] hover:text-[#C88A96] transition-all duration-200"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(item.id_gaya)}
                      className="text-[#E8B4B8] hover:text-[#C88A96] transition-all duration-200"
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-center mt-8">
          <button
            onClick={openAdd}
            className="bg-[#E8B4B8] hover:bg-[#C88A96] text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all duration-300 hover:shadow-pink-200/50"
          >
            ➕ Tambah Gaya
          </button>
        </div>
      </div>

      <footer className="text-center text-gray-600 text-sm mt-10 italic">
        © 2025 | SPK Rekomendasi Gamis <br />
        <span className="text-[#9B5C6B] font-semibold">by Kumeyyy 🩷</span>
      </footer>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleSubmit}
            className="relative bg-white rounded-2xl p-6 w-[90%] max-w-xl shadow-lg z-10"
          >
            <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Gaya" : "Tambah Gaya"}</h2>

            <label className="block mb-2 text-sm">
              Nama Gaya
              <input
                value={form.nama_gaya}
                onChange={(e) => setForm((s) => ({ ...s, nama_gaya: e.target.value }))}
                className="w-full mt-1 p-2 border rounded"
                required
              />
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Batal
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-[#E8B4B8] text-white">
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
