import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ================= GET ================= */
export async function GET() {
  const { data, error } = await supabase
    .from("outfit")
    .select(`
      id_outfit,
      kode_outfit,
      nama_outfit,
      harga,
      gambar,
      warna:id_warna ( id_warna, nama_warna ),
      bahan:id_bahan ( id_bahan, nama_bahan ),
      gaya:id_gaya ( id_gaya, nama_gaya )
    `)
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
      .upload(fileName, file, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
  }

  const { error } = await supabase.from("outfit").insert([{
    kode_outfit: formData.get("kode_outfit"),
    nama_outfit: formData.get("nama_outfit"),
    harga: formData.get("harga"),
    id_warna: formData.get("id_warna"),
    id_bahan: formData.get("id_bahan"),
    id_gaya: formData.get("id_gaya"),
    gambar: fileName,
  }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Outfit berhasil ditambahkan" });
}

/* ================= PUT ================= */
export const runtime = "nodejs";

export async function PUT(req) {
  const formData = await req.formData();
  const id = formData.get("id_outfit");

  const { data: oldData } = await supabase
    .from("outfit")
    .select("gambar")
    .eq("id_outfit", id)
    .single();

  let imageName = oldData?.gambar || null;

  const file = formData.get("gambar");

  if (file && file.size > 0) {
    if (imageName) {
      await supabase.storage.from("outfit-images").remove([imageName]);
    }

    const ext = file.name.split(".").pop();
    const newFileName = `${Date.now()}.${ext}`;
    const buffer = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("outfit-images")
      .upload(newFileName, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    imageName = newFileName;
  }

  await supabase
    .from("outfit")
    .update({
      kode_outfit: formData.get("kode_outfit"),
      nama_outfit: formData.get("nama_outfit"),
      harga: formData.get("harga"),
      id_warna: formData.get("id_warna"),
      id_bahan: formData.get("id_bahan"),
      id_gaya: formData.get("id_gaya"),
      gambar: imageName,
    })
    .eq("id_outfit", id);

  return NextResponse.json({ message: "Outfit berhasil diupdate" });
}

/* ================= DELETE ================= */
export async function DELETE(req) {
  const { id_outfit } = await req.json();

  await supabase.from("outfit").delete().eq("id_outfit", id_outfit);

  return NextResponse.json({ message: "Outfit berhasil dihapus" });
}
