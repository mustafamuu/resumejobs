import { useState } from "react";
import { Camera, X } from "lucide-react";
import { compressProfilePhoto } from "@/lib/photo";

export function BuilderInput({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-input/60 px-3 py-2 text-sm outline-none transition-colors focus:border-primary ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

export function BuilderTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full resize-none rounded-lg border bg-input/60 px-3 py-2 text-sm outline-none transition-colors focus:border-primary ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </label>
  );
}

export function PhotoField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressProfilePhoto(file);
      onChange(dataUrl);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not process image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-input/40 p-3">
      <div className="relative">
        {value ? (
          <img src={value} alt="Profile" className="h-16 w-16 rounded-full object-cover ring-1 ring-border" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Camera className="h-5 w-5" />
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove photo"
            className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">Profile photo (optional, auto-compressed)</div>
        <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs hover:bg-secondary">
          <Camera className="h-3.5 w-3.5" /> {busy ? "Processing…" : value ? "Change photo" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
    </div>
  );
}

export function SkillsEditor({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...skills, trimmed]);
    setDraft("");
  };
  return (
    <div>
      <div className="mb-1 text-xs text-muted-foreground">Skills (press Enter to add)</div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-input/60 p-2">
        {skills.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">
            {s}
            <button
              type="button"
              onClick={() => onChange(skills.filter((x) => x !== s))}
              className="text-muted-foreground hover:text-destructive"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="React, Python, SQL..."
          className="flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
