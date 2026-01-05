export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen font-[Poppins] bg-gradient-to-br from-[#FADADD] via-[#E8B4B8] to-white text-[#5C3D3D]">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gradient-to-b from-[#E8B4B8] via-[#FADADD] to-white shadow-xl flex flex-col items-center py-10 rounded-r-3xl">
        <h1 className="text-3xl font-extrabold mb-10 tracking-wide text-[#5C3D3D] drop-shadow-sm">
          Nyari<span className="text-[#A76E6E]">Gamis</span> 💕
        </h1>

        <nav className="w-full flex flex-col items-center">
          {[
            { name: "🏠 Dashboard", path: "/admin/dashboard" },
            { name: "🧾 Data Kriteria", path: "/admin/kriteria" },
            { name: "🧾 Data Warna", path: "/admin/warna" },
            { name: "🧾 Data Bahan", path: "/admin/bahan" },
            { name: "🧾 Data Gaya", path: "/admin/gaya" },
            { name: "👗 Data Alternatif (Gamis)", path: "/admin/outfit" },
            { name: "⭐ Nilai Kriteria / Penilaian", path: "/admin/nilai" },
            // { name: "📊 Hasil Perhitungan SAW", path: "/admin/hasil" },
            // { name: "👩‍💻 Manajemen Admin", path: "/admin/manajemen" },
            { name: "🚪 Logout", path: "/login" },
          ].map((item, i) => (
            <a
              key={i}
              href={item.path}
              className="w-4/5 text-center py-3 my-2 rounded-full bg-gradient-to-r from-[#FADADD] to-[#E8B4B8] hover:from-[#E8B4B8] hover:to-[#FADADD] text-[#5C3D3D] font-semibold tracking-wide shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              {item.name}
            </a>
          ))}
        </nav>

        <footer className="mt-auto text-sm text-[#7A4E4E] opacity-75">
          <p>✨ NyariGamis Admin ✨</p>
        </footer>
      </aside>

      {/* Konten Halaman */}
      <main className="flex-1 p-10 overflow-y-auto bg-white/60 backdrop-blur-sm rounded-l-3xl shadow-inner">
        {children}
      </main>
    </div>
  )
}
