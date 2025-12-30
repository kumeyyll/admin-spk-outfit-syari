import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // WAJIB service role
);

export async function GET() {
  try {
    // =========================
    // 1. TOTAL OUTFIT
    // =========================
    const { count: totalOutfit, error: errOutfit } = await supabase
      .from("outfit")
      .select("*", { count: "exact", head: true });

    if (errOutfit) throw errOutfit;

    // =========================
    // 2. TOTAL KRITERIA
    // =========================
    const { count: totalKriteria, error: errKriteria } = await supabase
      .from("kriteria")
      .select("*", { count: "exact", head: true });

    if (errKriteria) throw errKriteria;

    // =========================
    // 3. TOTAL NILAI
    // =========================
    const { count: totalNilai, error: errNilai } = await supabase
      .from("nilai_outfit")
      .select("*", { count: "exact", head: true });

    if (errNilai) throw errNilai;

    // =========================
    // 4. AMBIL SEMUA DATA SAW
    // =========================
    const { data: nilaiData, error: errSAW } = await supabase
      .from("nilai_outfit")
      .select(`
        id_outfit,
        nilai,
        outfit ( nama_outfit ),
        kriteria ( id_kriteria, bobot, tipe )
      `);

    if (errSAW) throw errSAW;

    if (!nilaiData || nilaiData.length === 0) {
      return NextResponse.json({
        totalOutfit,
        totalKriteria,
        totalNilai,
        outfitTerbaik: "-"
      });
    }

    // =========================
    // 5. HITUNG MAX & MIN PER KRITERIA
    // =========================
    const maxMin = {};

    nilaiData.forEach((item) => {
      const id = item.kriteria.id_kriteria;
      if (!maxMin[id]) {
        maxMin[id] = { max: item.nilai, min: item.nilai };
      } else {
        maxMin[id].max = Math.max(maxMin[id].max, item.nilai);
        maxMin[id].min = Math.min(maxMin[id].min, item.nilai);
      }
    });

    // =========================
    // 6. HITUNG SKOR SAW
    // =========================
    const skorOutfit = {};

    nilaiData.forEach((item) => {
      const idOutfit = item.id_outfit;
      const { bobot, tipe, id_kriteria } = item.kriteria;

      let nilaiNormalisasi = 0;

      if (tipe === "benefit") {
        nilaiNormalisasi = item.nilai / maxMin[id_kriteria].max;
      } else {
        nilaiNormalisasi = maxMin[id_kriteria].min / item.nilai;
      }

      const skor = nilaiNormalisasi * bobot;

      if (!skorOutfit[idOutfit]) {
        skorOutfit[idOutfit] = {
          nama_outfit: item.outfit.nama_outfit,
          skor: 0
        };
      }

      skorOutfit[idOutfit].skor += skor;
    });

    // =========================
    // 7. CARI OUTFIT TERBAIK
    // =========================
    const outfitTerbaik = Object.values(skorOutfit)
      .sort((a, b) => b.skor - a.skor)[0];

    return NextResponse.json({
      totalOutfit,
      totalKriteria,
      totalNilai,
      outfitTerbaik: outfitTerbaik?.nama_outfit || "-"
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json(
      { message: "Dashboard error" },
      { status: 500 }
    );
  }
}
