// app/api/gaya/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ================= GET =================
export async function GET() {
  const { data, error } = await supabase
    .from("gaya")
    .select("id_gaya, nama_gaya")
    .order("id_gaya", { ascending: true });

  if (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Data gaya berhasil diambil",
    data,
  });
}

// ================= POST =================
export async function POST(request) {
  const body = await request.json();

  const { nama_gaya } = body;

  if (!nama_gaya) {
    return NextResponse.json(
      { message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("gaya")
    .insert([{ nama_gaya }])
    .select();

  if (error) {
    return NextResponse.json(
      { message: "Gagal menambahkan data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Gaya berhasil ditambahkan",
    data,
  });
}

// ================= PUT =================
export async function PUT(request) {
  const body = await request.json();
  const { id_gaya, nama_gaya } = body;

  if (!id_gaya) {
    return NextResponse.json(
      { message: "ID gaya wajib ada" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("gaya")
    .update({ nama_gaya })
    .eq("id_gaya", id_gaya);

  if (error) {
    return NextResponse.json(
      { message: "Gagal update data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Gaya berhasil diupdate",
  });
}

// ================= DELETE =================
export async function DELETE(request) {
  const { id_gaya } = await request.json();

  if (!id_gaya) {
    return NextResponse.json(
      { message: "ID gaya wajib ada" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("gaya")
    .delete()
    .eq("id_gaya", id_gaya);

  if (error) {
    return NextResponse.json(
      { message: "Gagal menghapus data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Gaya berhasil dihapus",
  });
}

