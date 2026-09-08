import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export default function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  visible,
  onToggle,
  error
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="text-sm font-semibold text-[#142447]" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-3">
        <LockKeyhole
          aria-hidden="true"
          className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7890b5]"
          size={21}
          strokeWidth={1.8}
        />
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className={`h-14 w-full rounded-xl border bg-white pl-14 pr-14 text-base text-[#142447] outline-none transition placeholder:text-[#a1b2cd] focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
            error ? "border-red-300" : "border-[#d7e2f0]"
          }`}
          id={id}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#7890b5] transition hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
          onClick={onToggle}
          type="button"
        >
          {visible ? <EyeOff size={21} /> : <Eye size={21} />}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
