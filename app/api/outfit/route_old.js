import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "spk_outfit_syari",
};

const pool = mysql.createPool(dbConfig);

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

/* ================= GET ================= */
export async function GET() {
  const conn = await pool.getConnection();
  const [rows] = await conn.query(
    "SELECT * FROM outfit ORDER BY id_outfit ASC"
  );
  conn.release();
  return NextResponse.json({ data: rows });
}

/* ================= POST ================= */
export async function POST(req) {
  const formData = await req.formData();

  const file = formData.get("gambar");
  const filename = file
    ? `${Date.now()}-${file.name.replace(/\s+/g, "_")}`
    : null;

  if (file) {
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(bytes));
  }

  const conn = await pool.getConnection();
  await conn.query(
    `INSERT INTO outfit 
    (kode_outfit, nama_outfit, harga, bahan, warna, gaya, gambar)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      formData.get("kode_outfit"),
      formData.get("nama_outfit"),
      formData.get("harga"),
      formData.get("bahan"),
      formData.get("warna"),
      formData.get("gaya"),
      filename,
    ]
  );
  conn.release();

  return NextResponse.json({ message: "Gamis berhasil ditambahkan" });
}

/* ================= PUT ================= */
export async function PUT(req) {
  const formData = await req.formData();
  const id = formData.get("id_outfit");

  const conn = await pool.getConnection();

  // ambil data lama
  const [[oldData]] = await conn.query(
    "SELECT gambar FROM Gamis WHERE id_outfit = ?",
    [id]
  );

  let gambarFinal = oldData?.gambar || null;

  const file = formData.get("gambar");

  // === JIKA UPLOAD GAMBAR BARU ===
  if (file && file.size > 0) {
    // hapus gambar lama
    if (gambarFinal) {
      const oldPath = path.join(uploadDir, gambarFinal);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // simpan gambar baru
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(bytes));

    gambarFinal = filename;
  }

  // update data
  await conn.query(
    `UPDATE outfit SET
      kode_outfit=?,
      nama_outfit=?,
      harga=?,
      bahan=?,
      warna=?,
      gaya=?,
      gambar=?
     WHERE id_outfit=?`,
    [
      formData.get("kode_outfit"),
      formData.get("nama_outfit"),
      formData.get("harga"),
      formData.get("bahan"),
      formData.get("warna"),
      formData.get("gaya"),
      gambarFinal,
      id,
    ]
  );

  conn.release();

  return NextResponse.json({ message: "Gamis berhasil diupdate" });
}


/* ================= DELETE ================= */
export async function DELETE(req) {
  const { id_outfit } = await req.json();
  const conn = await pool.getConnection();

  // ambil nama gambar
  const [[data]] = await conn.query(
    "SELECT gambar FROM Gamis WHERE id_outfit = ?",
    [id_outfit]
  );

  // hapus file gambar
  if (data?.gambar) {
    const filePath = path.join(uploadDir, data.gambar);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  // hapus data DB
  await conn.query("DELETE FROM Gamis WHERE id_outfit = ?", [id_outfit]);
  conn.release();

  return NextResponse.json({ message: "Gamis & gambar berhasil dihapus" });
}

