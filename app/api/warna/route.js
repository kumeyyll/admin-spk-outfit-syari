// app/api/warna/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ================= GET =================
export async function GET() {
  const { data, error } = await supabase
    .from("warna")
    .select("id_warna, nama_warna")
    .order("id_warna", { ascending: true });

  if (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Data warna berhasil diambil",
    data,
  });
}

// ================= POST =================
export async function POST(request) {
  const body = await request.json();

  const { nama_warna } = body;

  if (!nama_warna) {
    return NextResponse.json(
      { message: "Data tidak lengkap" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("warna")
    .insert([{ nama_warna }])
    .select();

  if (error) {
    return NextResponse.json(
      { message: "Gagal menambahkan data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Warna berhasil ditambahkan",
    data,
  });
}

// ================= PUT =================
export async function PUT(request) {
  const body = await request.json();
  const { id_warna, nama_warna } = body;

  if (!id_warna) {
    return NextResponse.json(
      { message: "ID warna wajib ada" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("warna")
    .update({ nama_warna })
    .eq("id_warna", id_warna);

  if (error) {
    return NextResponse.json(
      { message: "Gagal update data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Warna berhasil diupdate",
  });
}

// ================= DELETE =================
export async function DELETE(request) {
  const { id_warna } = await request.json();

  if (!id_warna) {
    return NextResponse.json(
      { message: "ID warna wajib ada" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("warna")
    .delete()
    .eq("id_warna", id_warna);

  if (error) {
    return NextResponse.json(
      { message: "Gagal menghapus data", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Warna berhasil dihapus",
  });
}

