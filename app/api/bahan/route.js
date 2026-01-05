// app/api/bahan/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ================= GET =================
export async function GET() {
  const { data, error } = await supabase
    .from("bahan")
    .select("id_bahan, nama_bahan")
    .order("id_bahan", { ascending: true });

  if (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Data bahan berhasil diambil",
    data,
  });
}

// ================= POST =================
export async function POST(request) {
  const body = await request.json();

  const { nama_bahan } = body;

  if (!nama_bahan) {
    return NextResponse.json(
      { message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("bahan")
    .insert([{ nama_bahan }])
    .select();

  if (error) {
    return NextResponse.json(
      { message: "Gagal menambahkan data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Bahan berhasil ditambahkan",
    data,
  });
}

// ================= PUT =================
export async function PUT(request) {
  const body = await request.json();
  const { id_bahan, nama_bahan } = body;

  if (!id_bahan) {
    return NextResponse.json(
      { message: "ID bahan wajib ada" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("bahan")
    .update({ nama_bahan })
    .eq("id_bahan", id_bahan);

  if (error) {
    return NextResponse.json(
      { message: "Gagal update data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Bahan berhasil diupdate",
  });
}

// ================= DELETE =================
export async function DELETE(request) {
  const { id_bahan } = await request.json();

  if (!id_bahan) {
    return NextResponse.json(
      { message: "ID bahan wajib ada" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("bahan")
    .delete()
    .eq("id_bahan", id_bahan);

  if (error) {
    return NextResponse.json(
      { message: "Gagal menghapus data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Bahan berhasil dihapus",
  });
}

