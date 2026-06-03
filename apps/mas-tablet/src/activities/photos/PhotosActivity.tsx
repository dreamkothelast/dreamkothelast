import { useState, useRef, useCallback, useEffect, type ChangeEvent } from "react";
import { useAudio } from "../../hooks/useAudio";
import { useSpeech } from "../../hooks/useSpeech";
import type { ActivityProps } from "../../types";
import { Icon } from "../../components/Icon";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StoredPhoto {
  id: string;
  name: string;
  src: string; // base64 data URL
}

const STORAGE_KEY = "mas-tablet-photos";
const MAX_PHOTOS = 20;

function loadPhotos(): StoredPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePhotos(photos: StoredPhoto[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  } catch {
    // LocalStorage plein — ignorer silencieusement
  }
}

// Prénom extrait du nom de fichier (sans extension, underscores → espaces)
function guessName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[_\-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || "Mes proches";
}

// ── Composant principal ───────────────────────────────────────────────────────
export function PhotosActivity({ volume = 0.7, reducedMotion }: ActivityProps) {
  const { playClick, playMatch } = useAudio(volume);
  const { parler } = useSpeech(Math.min(1, volume + 0.2));

  const [photos, setPhotos] = useState<StoredPhoto[]>(loadPhotos);
  const [view, setView] = useState<"grid" | "fullscreen">("grid");
  const [selected, setSelected] = useState<StoredPhoto | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  // ── Upload d'une photo ────────────────────────────────────────────────────
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Réinitialise l'input pour pouvoir re-sélectionner le même fichier
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (evt) => {
      const src = evt.target?.result as string;
      if (!src) return;
      playMatch();
      const newPhoto: StoredPhoto = {
        id: Date.now().toString(),
        name: guessName(file.name),
        src,
      };
      setPhotos((prev) => {
        const next = [newPhoto, ...prev].slice(0, MAX_PHOTOS);
        savePhotos(next);
        return next;
      });
    };
    reader.readAsDataURL(file);
  }, [playMatch]);

  // ── Ouvrir en plein écran ─────────────────────────────────────────────────
  const openPhoto = useCallback((photo: StoredPhoto) => {
    playClick();
    parler(photo.name);
    setSelected(photo);
    setView("fullscreen");
    setDeleteConfirm(false);
    setEditingName(false);
  }, [playClick, parler]);

  const closeFullscreen = useCallback(() => {
    setView("grid");
    setSelected(null);
    setDeleteConfirm(false);
    setEditingName(false);
  }, []);

  // ── Renommer ──────────────────────────────────────────────────────────────
  const startRename = useCallback(() => {
    if (!selected) return;
    setNameValue(selected.name);
    setEditingName(true);
  }, [selected]);

  const saveRename = useCallback(() => {
    if (!selected) return;
    const trimmed = nameValue.trim() || selected.name;
    const updated = { ...selected, name: trimmed };
    setSelected(updated);
    setPhotos((prev) => {
      const next = prev.map((p) => (p.id === selected.id ? updated : p));
      savePhotos(next);
      return next;
    });
    setEditingName(false);
  }, [selected, nameValue]);

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const deletePhoto = useCallback(() => {
    if (!selected) return;
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== selected.id);
      savePhotos(next);
      return next;
    });
    closeFullscreen();
  }, [selected, closeFullscreen]);

  // ── Vue plein écran ───────────────────────────────────────────────────────
  if (view === "fullscreen" && selected) {
    return (
      <div className="flex flex-col w-full h-full bg-black select-none">
        {/* Barre d'actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/80 gap-4 z-10">
          <button
            onClick={closeFullscreen}
            className="font-masque font-bold text-white text-xl px-6 py-3 rounded-[1.5rem] bg-white/20 hover:bg-white/30 active:scale-95 transition-all min-h-[56px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white inline-flex items-center gap-2"
          >
            <Icon name="arrow-left" size={22} /> Retour
          </button>

          <div className="flex gap-3">
            {deleteConfirm ? (
              <>
                <button
                  onClick={deletePhoto}
                  className="font-masque font-bold text-white text-xl px-6 py-3 rounded-[1.5rem] bg-red-600 hover:bg-red-700 active:scale-95 transition-all min-h-[56px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
                >
                  <Icon name="trash" size={22} className="mr-2" /> Confirmer la suppression
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="font-masque font-bold text-white text-xl px-6 py-3 rounded-[1.5rem] bg-white/20 hover:bg-white/30 active:scale-95 transition-all min-h-[56px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="font-masque font-bold text-white text-xl px-6 py-3 rounded-[1.5rem] bg-red-700/60 hover:bg-red-700/80 active:scale-95 transition-all min-h-[56px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
              >
                <Icon name="trash" size={22} className="mr-2" /> Supprimer
              </button>
            )}
          </div>
        </div>

        {/* Photo */}
        <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
          <img
            src={selected.src}
            alt={selected.name}
            className="max-w-full max-h-full object-contain rounded-2xl"
            style={{
              boxShadow: "0 0 60px rgba(255,255,255,0.1)",
              transition: reducedMotion ? "none" : undefined,
            }}
          />
        </div>

        {/* Nom — tap pour modifier */}
        <div className="flex items-center justify-center gap-4 py-6 bg-black/80">
          {editingName ? (
            <div className="flex items-center gap-3">
              <input
                ref={nameInputRef}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveRename();
                  if (e.key === "Escape") setEditingName(false);
                }}
                className="font-masque font-bold text-brun text-3xl px-6 py-3 rounded-[1.5rem] bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-soleil min-w-[300px] text-center"
                placeholder="Prénom ou nom..."
              />
              <button
                onClick={saveRename}
                className="font-masque font-bold text-white text-2xl px-6 py-3 rounded-[1.5rem] bg-vert active:scale-95 transition-all min-h-[56px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-vert"
              >
                <Icon name="check" size={26} />
              </button>
            </div>
          ) : (
            <button
              onClick={startRename}
              className="flex items-center gap-3 font-masque font-bold text-white text-4xl hover:text-white/80 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white rounded-xl px-4 py-2"
              aria-label="Modifier le nom"
            >
              {selected.name}
              <Icon name="pencil" size={28} className="opacity-60" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Vue grille ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-b from-[#FFF8F0] to-[#FFF3E0] select-none">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-4 sm:py-5">
        <div>
          <h2 className="font-masque font-bold text-brun text-2xl sm:text-4xl inline-flex items-center gap-2 sm:gap-3"><Icon name="camera" size={40} className="w-7 h-7 sm:w-10 sm:h-10" /> Mes Photos</h2>
          <p className="font-masque text-brun/50 text-base sm:text-lg mt-0.5">
            {photos.length === 0
              ? "Ajoute les photos de tes proches"
              : `${photos.length} photo${photos.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Bouton Ajouter */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={photos.length >= MAX_PHOTOS}
          className={[
            "font-masque font-bold text-white text-lg sm:text-2xl px-4 sm:px-8 py-3 sm:py-4 rounded-[1.5rem]",
            "flex items-center gap-2 sm:gap-3 min-h-[56px] sm:min-h-[72px]",
            "shadow-[0_6px_20px_rgba(0,0,0,0.25)]",
            "transition-all duration-200 hover:scale-[1.03] active:scale-95",
            "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun",
            photos.length >= MAX_PHOTOS ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
          style={{ backgroundColor: "#FF6F00" }}
        >
          <Icon name="camera" size={32} className="w-6 h-6 sm:w-8 sm:h-8" />
          Ajouter une photo
        </button>

        {/* Input fichier caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Sélectionner une photo"
        />
      </div>

      {/* État vide */}
      {photos.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div
            className="w-48 h-48 rounded-[3rem] flex items-center justify-center"
            style={{ backgroundColor: "#FF6F00" + "22" }}
          >
            <Icon name="camera" size={120} />
          </div>
          <div className="text-center">
            <p className="font-masque font-bold text-brun text-3xl">Aucune photo pour l'instant</p>
            <p className="font-masque text-brun/50 text-xl mt-2">
              Appuie sur "Ajouter une photo" pour commencer
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-masque font-bold text-white text-3xl px-12 py-6 rounded-[2rem] cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_8px_28px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun"
            style={{ backgroundColor: "#FF6F00" }}
          >
            <Icon name="camera" size={36} className="mr-3" /> Ajouter une photo
          </button>
        </div>
      )}

      {/* Grille de photos */}
      {photos.length > 0 && (
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => openPhoto(photo)}
                tabIndex={idx + 1}
                className={[
                  "flex flex-col overflow-hidden rounded-[1.5rem]",
                  "shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
                  "cursor-pointer select-none",
                  "transition-all duration-200 hover:scale-[1.04] active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun",
                  "bg-white",
                ].join(" ")}
                aria-label={`Photo de ${photo.name}`}
              >
                {/* Image */}
                <div className="w-full aspect-square overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Nom */}
                <div
                  className="px-4 py-3 text-center"
                  style={{ backgroundColor: "#FF6F00" }}
                >
                  <span className="font-masque font-bold text-white text-xl truncate block">
                    {photo.name}
                  </span>
                </div>
              </button>
            ))}

            {/* Tuile "Ajouter" si < MAX */}
            {photos.length < MAX_PHOTOS && (
              <button
                onClick={() => fileInputRef.current?.click()}
                tabIndex={photos.length + 1}
                className={[
                  "flex flex-col items-center justify-center",
                  "aspect-square rounded-[1.5rem]",
                  "border-4 border-dashed border-brun/20",
                  "cursor-pointer hover:border-brun/40 hover:bg-brun/5 active:scale-95",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-[6px] focus-visible:ring-brun",
                ].join(" ")}
                aria-label="Ajouter une photo"
              >
                <span className="text-6xl text-brun/30" aria-hidden>+</span>
                <span className="font-masque text-brun/40 text-lg mt-2">Ajouter</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
