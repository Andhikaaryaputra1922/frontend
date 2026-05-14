import { CourseForm } from "../course-form";

export default function CreateCoursePage() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
           <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Buat Kursus Baru
           </h1>
           <p className="mt-2 text-sm text-slate-500">
              Lengkapi detail kursus Anda untuk mulai membangun kurikulum.
           </p>
        </header>

        <CourseForm />
      </div>
    </main>
  );
}
