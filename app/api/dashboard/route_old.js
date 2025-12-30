import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "spk_outfit_syari",
});

export async function GET() {
  const conn = await pool.getConnection();

  try {
    // jumlah outfit
    const [[{ totalOutfit }]] = await conn.query(
      "SELECT COUNT(*) AS totalOutfit FROM outfit"
    );

    // jumlah kriteria
    const [[{ totalKriteria }]] = await conn.query(
      "SELECT COUNT(*) AS totalKriteria FROM kriteria"
    );

    // total penilaian
    const [[{ totalNilai }]] = await conn.query(
      "SELECT COUNT(*) AS totalNilai FROM nilai_outfit"
    );

    // outfit terbaik (ranking SAW tertinggi)
    const [[bestOutfit]] = await conn.query(`
      SELECT o.nama_outfit, SUM(
        CASE 
          WHEN k.tipe = 'benefit' THEN (n.nilai / max_n.max_val) * k.bobot
          ELSE (min_n.min_val / n.nilai) * k.bobot
        END
      ) AS skor
      FROM nilai_outfit n
      JOIN outfit o ON o.id_outfit = n.id_outfit
      JOIN kriteria k ON k.id_kriteria = n.id_kriteria
      JOIN (
        SELECT id_kriteria, MAX(nilai) AS max_val
        FROM nilai_outfit GROUP BY id_kriteria
      ) max_n ON max_n.id_kriteria = n.id_kriteria
      JOIN (
        SELECT id_kriteria, MIN(nilai) AS min_val
        FROM nilai_outfit GROUP BY id_kriteria
      ) min_n ON min_n.id_kriteria = n.id_kriteria
      GROUP BY o.id_outfit
      ORDER BY skor DESC
      LIMIT 1
    `);

    conn.release();

    return NextResponse.json({
      totalOutfit,
      totalKriteria,
      totalNilai,
      outfitTerbaik: bestOutfit?.nama_outfit || "-",
    });
  } catch (err) {
    conn.release();
    return NextResponse.json({ message: "Dashboard error" }, { status: 500 });
  }
}
