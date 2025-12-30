import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ SERVER ONLY
);

/* ================= GET ================= */
export async function GET() {
  const { data, error } = await supabase
    .from("outfit")
    .select("*")
    .order("id_outfit", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/* ================= POST ================= */
export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("gambar");

  let fileName = null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    fileName = `${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("outfit-images")
      .upload(fileName, file, {
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
  }

  const { error } = await supabase.from("outfit").insert([
    {
      kode_outfit: formData.get("kode_outfit"),
      nama_outfit: formData.get("nama_outfit"),
      harga: formData.get("harga"),
      bahan: formData.get("bahan"),
      warna: formData.get("warna"),
      gaya: formData.get("gaya"),
      gambar: fileName, // ✅ SIMPAN FILENAME
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Outfit berhasil ditambahkan" });
}

/* ================= PUT ================= */
export const runtime = "nodejs"; // 🔴 WAJIB

export async function PUT(req) {
  const formData = await req.formData();
  const id = formData.get("id_outfit");

  /* 1️⃣ DATA LAMA */
  const { data: oldData } = await supabase
    .from("outfit")
    .select("gambar")
    .eq("id_outfit", id)
    .single();

  let imageName = oldData?.gambar || null;

  /* 2️⃣ FILE BARU */
  const file = formData.get("gambar");

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop();
    const newFileName = `${Date.now()}.${ext}`;

    /* 🔴 HAPUS GAMBAR LAMA */
    if (imageName) {
      await supabase.storage
        .from("outfit-images")
        .remove([imageName]);
    }

    /* 🔥 KONVERSI FILE */
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    /* 🟢 UPLOAD BARU */
    const { error: uploadError } = await supabase.storage
      .from("outfit-images")
      .upload(newFileName, fileBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    imageName = newFileName;
  }

  /* 3️⃣ UPDATE DB */
  await supabase
    .from("outfit")
    .update({
      kode_outfit: formData.get("kode_outfit"),
      nama_outfit: formData.get("nama_outfit"),
      harga: formData.get("harga"),
      bahan: formData.get("bahan"),
      warna: formData.get("warna"),
      gaya: formData.get("gaya"),
      gambar: imageName,
    })
    .eq("id_outfit", id);

  return NextResponse.json({ message: "Outfit berhasil diupdate" });
}



/* ================= DELETE ================= */
export async function DELETE(req) {
  const { id_outfit } = await req.json();

  const { error } = await supabase
    .from("outfit")
    .delete()
    .eq("id_outfit", id_outfit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Outfit berhasil dihapus" });
}
