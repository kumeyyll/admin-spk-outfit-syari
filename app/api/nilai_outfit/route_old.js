// app/api/kriteria/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'spk_outfit_syari'
};

const pool = mysql.createPool(dbConfig);

// 1. FUNGSI GET (Mengambil Semua Data)
export async function GET() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT id_nilai, id_outfit, id_kriteria, nilai FROM nilai_outfit');
        connection.release();
        
        return NextResponse.json({
            message: "Data nilai_outfit berhasil diambil",
            data: rows,
        }, {
            status: 200
        });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: "Gagal mengambil data dari database" }, { status: 500 });
    }
}

// 2. FUNGSI POST (Menambahkan Data Baru)
export async function POST(request) {
    try {
        const Newnilaioutfit = await request.json();

        if (!Newnilaioutfit.id_outfit || !Newnilaioutfit.id_kriteria || !Newnilaioutfit.nilai) {
            return NextResponse.json({
                message: "Data nilai_outfit tidak lengkap. ID Outfit, ID Kriteria, dan Nilai wajib diisi."
            }, { status: 400 });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'INSERT INTO nilai_outfit (id_outfit, id_kriteria, nilai) VALUES (?, ?, ?)',
            [Newnilaioutfit.id_outfit, Newnilaioutfit.id_kriteria, Newnilaioutfit.nilai]
        );
        connection.release();

        return NextResponse.json({
            message: "nilai_outfit berhasil ditambahkan",
            data: Newnilaioutfit
        }, { status: 201 });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: "Gagal menambahkan data ke database" }, { status: 500 });
    }
}

// 3. FUNGSI PUT (Mengupdate Data)
export async function PUT(request) {
    try {
        const updatedData = await request.json();
        const { id_outfit, id_kriteria } = updatedData;

        if (!id_outfit || !id_kriteria) {
            return NextResponse.json({ message: "ID Outfit dan ID Kriteria wajib disertakan" }, { status: 400 });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'UPDATE nilai_outfit SET id_outfit = ?, id_kriteria = ?, nilai = ? WHERE id_nilai = ?',
            [updatedData.id_outfit, updatedData.id_kriteria, updatedData.nilai, updatedData.id_nilai]
        );
        connection.release();

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: `Data dengan ID ${id_nilai} tidak ditemukan` }, { status: 404 });
        }

        return NextResponse.json({
            message: "Data nilai_outfit berhasil diupdate",
            data: updatedData
        }, { status: 200 });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: "Gagal mengupdate data di database" }, { status: 500 });
    }
}

// 4. FUNGSI DELETE (Menghapus Data)
export async function DELETE(request) {
    try {
        const { id_nilai } = await request.json();

        if (!id_nilai) {
            return NextResponse.json({ message: "ID wajib disertakan" }, { status: 400 });
        }

        const connection = await pool.getConnection();
        const [result] = await connection.query('DELETE FROM nilai_outfit WHERE id_nilai = ?', [id_nilai]);
        connection.release();

        if (result.affectedRows === 0) {
            return NextResponse.json({ message: `nilai_outfit dengan ID ${id_nilai} tidak ditemukan` }, { status: 404 });
        }

        return NextResponse.json({
            message: `nilai_outfit dengan ID ${id_nilai} berhasil dihapus`
        }, { status: 200 });

    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: "Gagal menghapus data dari database" }, { status: 500 });
    }
}
