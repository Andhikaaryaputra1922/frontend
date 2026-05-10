"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import {
  Trash2,
  FileUp,
  Link,
  FileText,
  Video,
  Image as ImageIcon,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  course: {
    id: string;
    title: string;
  };
  attachmentUrl?: string;
};

type Props = {
  baseUrl: string;
  token: string;
  filteredCourses: Course[];
  assignments: Assignment[];
};

export function AssignmentsClient({
  filteredCourses,
  assignments,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [localAssignments, setLocalAssignments] =
    useState(assignments);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [showSuccessToast, setShowSuccessToast] =
    useState(false);

  const defaultNewAssignment = {
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
    courseId: "",
  };

  // Hindari setState sinkron di useEffect (kena rule react-hooks/set-state-in-effect).
  // Ambil draft sekali via lazy initializer.
  const [newAssignment, setNewAssignment] = useState(() => {
    if (typeof window === "undefined") return defaultNewAssignment;
    const saved = localStorage.getItem("assignmentDraft");
    if (!saved) return defaultNewAssignment;
    try {
      const parsed = JSON.parse(saved) as Partial<typeof defaultNewAssignment>;
      return { ...defaultNewAssignment, ...parsed };
    } catch {
      return defaultNewAssignment;
    }
  });

  /*
  =========================
  AUTO SAVE DRAFT
  =========================
  */

  useEffect(() => {
    localStorage.setItem(
      "assignmentDraft",
      JSON.stringify(newAssignment)
    );
  }, [newAssignment]);

  /*
  =========================
  DRAG DROP
  =========================
  */

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);

      toast.success("File berhasil dipilih");
    }
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    multiple: false,
  });

  /*
  =========================
  PREVIEW FILE
  =========================
  */

  const previewUrl = file
    ? URL.createObjectURL(file)
    : null;

  /*
  =========================
  HANDLE INPUT
  =========================
  */

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setNewAssignment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
  =========================
  CREATE ASSIGNMENT
  =========================
  */

  const handleCreateAssignment = async () => {
    if (
      !newAssignment.courseId ||
      !newAssignment.title
    ) {
      toast.error(
        "Judul dan kursus wajib diisi"
      );

      return;
    }

    setLoading(true);

    const loadingToast = toast.loading(
      "Mengupload tugas..."
    );

    try {
      const formData = new FormData();

      formData.append(
        "title",
        newAssignment.title
      );

      formData.append(
        "description",
        newAssignment.description
      );

      formData.append(
        "dueDate",
        newAssignment.dueDate
      );

      formData.append(
        "maxScore",
        String(newAssignment.maxScore)
      );

      formData.append(
        "courseId",
        newAssignment.courseId
      );

      if (file) {
        formData.append("file", file);
      }

      if (linkUrl) {
        formData.append("linkUrl", linkUrl);
      }

      const response = await fetch(
        "/api/assignments",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        toast.dismiss(loadingToast);

        toast.success(
          "Tugas berhasil diterbitkan!"
        );

        localStorage.removeItem(
          "assignmentDraft"
        );

        setNewAssignment({
          title: "",
          description: "",
          dueDate: "",
          maxScore: 100,
          courseId: "",
        });

        setFile(null);

        setLinkUrl("");

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.dismiss(loadingToast);

        toast.error(
          "Gagal membuat assignment"
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);

      toast.error(
        "Terjadi kesalahan sistem"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =========================
  DELETE
  =========================
  */

  const openDeleteConfirm = (
    id: string
  ) => {
    setSelectedId(id);

    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    const oldAssignments =
      localAssignments;

    setLocalAssignments((prev) =>
      prev.filter(
        (item) => item.id !== selectedId
      )
    );

    setIsDeleteModalOpen(false);

    toast.success(
      "Assignment berhasil dihapus"
    );

    try {
      const response = await fetch(
        `/api/assignments/${selectedId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setLocalAssignments(oldAssignments);

        toast.error(
          "Gagal menghapus assignment"
        );
      }
    } catch {
      setLocalAssignments(oldAssignments);

      toast.error(
        "Terjadi kesalahan sistem"
      );
    }
  };

  return (
    <>
      <div className="space-y-10">

        {/* ========================= */}
        {/* FORM */}
        {/* ========================= */}

        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">

          <div className="flex items-center gap-3 mb-8">

            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Plus size={20} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Buat Assignment
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Upload materi dan instruksi tugas
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* LEFT */}

            <div className="space-y-5">

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
                  Judul Tugas
                </label>

                <input
                  type="text"
                  name="title"
                  value={newAssignment.title}
                  onChange={handleInputChange}
                  placeholder="Contoh: Tugas React Dasar"
                  className="mt-2 block w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
                  Mata Kuliah
                </label>

                <select
                  name="courseId"
                  value={newAssignment.courseId}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4 focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">
                    -- Pilih Mata Kuliah --
                  </option>

                  {filteredCourses.map(
                    (course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
                    Deadline
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={newAssignment.dueDate}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
                    Max Score
                  </label>

                  <input
                    type="number"
                    name="maxScore"
                    value={newAssignment.maxScore}
                    onChange={handleInputChange}
                    className="mt-2 block w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4"
                  />
                </div>

              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">
                  Deskripsi
                </label>

                <textarea
                  rows={6}
                  name="description"
                  value={newAssignment.description}
                  onChange={handleInputChange}
                  placeholder="Instruksi assignment..."
                  className="mt-2 block w-full rounded-2xl border-gray-200 bg-gray-50/50 p-4"
                />
              </div>

            </div>

            {/* RIGHT */}

            <div className="space-y-5">

              {/* DRAG DROP */}

              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-[2rem]
                  p-10 transition-all cursor-pointer
                  ${
                    isDragActive
                      ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                      : "border-gray-200 hover:border-indigo-300"
                  }
                `}
              >

                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center text-center">

                  <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-5">
                    <FileUp
                      className="text-indigo-500"
                      size={32}
                    />
                  </div>

                  <h3 className="font-black text-lg text-gray-900">
                    Drag & Drop File
                  </h3>

                  <p className="text-sm text-gray-400 mt-2">
                    PDF, Video, atau Gambar
                  </p>

                  {file && (
                    <div className="mt-5 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                      {file.name}
                    </div>
                  )}

                </div>
              </div>

              {/* LINK */}

              <div className="relative">

                <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                  <Link size={16} />
                </div>

                <input
                  type="url"
                  placeholder="Atau tempel URL..."
                  value={linkUrl}
                  onChange={(e) =>
                    setLinkUrl(e.target.value)
                  }
                  className="w-full pl-12 rounded-2xl border-gray-200 bg-gray-50/50 p-4"
                />
              </div>

              {/* PREVIEW */}

              {previewUrl && (
                <div className="rounded-[2rem] overflow-hidden border border-gray-200 bg-white shadow-sm">

                  {file?.type.startsWith(
                    "image/"
                  ) && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-h-[350px] object-cover"
                    />
                  )}

                  {file?.type.startsWith(
                    "video/"
                  ) && (
                    <video
                      controls
                      className="w-full"
                    >
                      <source
                        src={previewUrl}
                        type={file.type}
                      />
                    </video>
                  )}

                  {file?.type ===
                    "application/pdf" && (
                    <iframe
                      src={previewUrl}
                      className="w-full h-[500px]"
                    />
                  )}

                </div>
              )}

            </div>
          </div>

          {/* BUTTON */}

          <div className="mt-10 flex justify-end">

            <button
              onClick={handleCreateAssignment}
              disabled={loading}
              className="px-8 py-4 bg-black text-white rounded-full font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading
                ? "Memproses..."
                : "Terbitkan Assignment"}
            </button>

          </div>

        </section>

        {/* ========================= */}
        {/* LIST */}
        {/* ========================= */}

        <section>

          <h3 className="text-xl font-black text-gray-900 mb-5 px-2">
            Daftar Assignment
          </h3>

          {/* SKELETON */}

          {loading && (
            <div className="grid gap-4 mb-4">

              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white border rounded-[2rem] p-6"
                >
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />

                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                </div>
              ))}

            </div>
          )}

          <div className="grid gap-4">

            {localAssignments.length ===
              0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[2rem] text-gray-400 border-2 border-dashed">
                Belum ada assignment dibuat
              </div>
            )}

            {localAssignments.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                className="group relative flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2rem] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all overflow-hidden"
              >

                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">

                    {item.attachmentUrl?.includes(
                      ".pdf"
                    ) ? (
                      <FileText size={24} />
                    ) : item.attachmentUrl?.includes(
                        "mp4"
                      ) ? (
                      <Video size={24} />
                    ) : (
                      <ImageIcon size={24} />
                    )}

                  </div>

                  <div>

                    <h4 className="font-black text-gray-900">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-3 mt-2">

                      <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full text-gray-500">
                        {item.course.title}
                      </span>

                      <span className="text-xs text-gray-400">
                        Deadline{" "}
                        {new Date(
                          item.dueDate
                        ).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>

                    </div>
                  </div>
                </div>

                {/* DELETE */}

                <button
                  onClick={() =>
                    openDeleteConfirm(
                      item.id
                    )
                  }
                  className="translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
                >
                  <Trash2 size={20} />
                </button>

              </motion.div>
            ))}

          </div>

        </section>
      </div>

      {/* ========================= */}
      {/* MODAL */}
      {/* ========================= */}

      <AnimatePresence>

        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >

            <motion.div
              initial={{
                scale: 0.9,
                opacity: 0,
                y: 20,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
                y: 20,
              }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-gray-100"
            >

              <div className="flex flex-col items-center text-center">

                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle size={40} />
                </div>

                <h3 className="text-2xl font-black text-gray-900">
                  Hapus Assignment?
                </h3>

                <p className="text-gray-500 mt-3 leading-relaxed">
                  Data yang dihapus tidak dapat
                  dikembalikan.
                </p>

              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">

                <button
                  onClick={() =>
                    setIsDeleteModalOpen(
                      false
                    )
                  }
                  className="py-4 px-6 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>

                <button
                  onClick={confirmDelete}
                  className="py-4 px-6 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all"
                >
                  Ya, Hapus
                </button>

              </div>

            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </>
  );
}
