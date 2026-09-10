export default function LoadingSpinner({ label = "Memuat...", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sm text-[#6f87ad] ${className}`} role="status" aria-live="polite">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
