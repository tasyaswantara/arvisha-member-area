import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ContentLoading() {
  return (
    <div className="min-h-screen bg-[#f7fbff] text-[#142447]">
      <LoadingSpinner label="Memuat..." className="min-h-[60vh] flex-col gap-3" />
    </div>
  );
}
