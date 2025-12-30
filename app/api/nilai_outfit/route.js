import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ server only
);

/* ================= GET ================= */
export async function GET() {
  const { data, error } = await supabase
    .from("nilai_outfit")
    .select("id_nilai, id_outfit, id_kriteria, nilai")
    .order("id_nilai", { ascending: true });

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Data nilai_outfit berhasil diambil",
    data,
  });
}

/* ================= POST ================= */
export async function POST(req) {
  const body = await req.json();

  if (!body.id_outfit || !body.id_kriteria || body.nilai === undefined) {
    return NextResponse.json(
      { message: "ID Outfit, ID Kriteria, dan Nilai wajib diisi" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("nilai_outfit")
    .insert([
      {
        id_outfit: body.id_outfit,
        id_kriteria: body.id_kriteria,
        nilai: body.nilai,
      },
    ]);

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "nilai_outfit berhasil ditambahkan" },
    { status: 201 }
  );
}

/* ================= PUT ================= */
export async function PUT(req) {
  const body = await req.json();

  if (!body.id_nilai) {
    return NextResponse.json(
      { message: "ID Nilai wajib disertakan" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("nilai_outfit")
    .update({
      id_outfit: body.id_outfit,
      id_kriteria: body.id_kriteria,
      nilai: body.nilai,
    })
    .eq("id_nilai", body.id_nilai);

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Data nilai_outfit berhasil diupdate",
  });
}

/* ================= DELETE ================= */
export async function DELETE(req) {
  const { id_nilai } = await req.json();

  if (!id_nilai) {
    return NextResponse.json(
      { message: "ID Nilai wajib disertakan" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("nilai_outfit")
    .delete()
    .eq("id_nilai", id_nilai);

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "nilai_outfit berhasil dihapus",
  });
}
