"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeftIcon,
  BackspaceIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  DocumentPlusIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  PaperAirplaneIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PaperClipIcon,
  DocumentIcon,
  UserPlusIcon,
  FaceSmileIcon,
  CheckIcon,
  HeartIcon,
  HandRaisedIcon,
  PauseIcon,
  PlayIcon,
  SparklesIcon,
  SwatchIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { UserIcon as UserIconSolid } from "@heroicons/react/24/solid";
import { Keyboard } from "lucide-react";
import { useTheme } from "next-themes";
import type { EmojiClickData } from "emoji-picker-react";
import { EmojiStyle, SuggestionMode, Theme } from "emoji-picker-react";
import type { PDFDocumentLoadingTask, RenderTask } from "pdfjs-dist";

import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { conversations, initialMessagesByConversation, initialTimeline, type ChatMessage, type Conversation } from "@/components/chat/chat-data";
import { ChatWallpaperLayer } from "@/components/chat/ChatWallpaperLayer";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

const MESSAGE_TEXTAREA_MAX_HEIGHT = 136;
const AUDIO_WAVEFORM_BARS = [10, 18, 14, 24, 16, 30, 20, 12, 26, 18, 32, 14, 24, 16];

const formatAudioDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getTimestamp = () => new Date().getTime();

type ConversationTag = {
  id: string;
  label: string;
  color: string;
};

const TAG_COLORS = [
  { value: "#3b82f6", label: "Azul", bg: "bg-blue-500", text: "text-white" },
  { value: "#22c55e", label: "Verde", bg: "bg-green-500", text: "text-white" },
  { value: "#ef4444", label: "Rojo", bg: "bg-red-500", text: "text-white" },
  { value: "#eab308", label: "Amarillo", bg: "bg-yellow-500", text: "text-white" },
  { value: "#a855f7", label: "Morado", bg: "bg-purple-500", text: "text-white" },
  { value: "#f97316", label: "Naranja", bg: "bg-orange-500", text: "text-white" },
  { value: "#ec4899", label: "Rosa", bg: "bg-pink-500", text: "text-white" },
  { value: "#14b8a6", label: "Turquesa", bg: "bg-teal-500", text: "text-white" },
];

type PendingAttachment = {
  id: string;
  name: string;
  objectUrl: string;
  size: number;
  type: string;
};

const isPdfAttachment = (attachment: PendingAttachment) =>
  attachment.type === "application/pdf" ||
  attachment.name.toLowerCase().endsWith(".pdf");

const isPdfFile = (fileType?: string, fileName?: string) =>
  fileType === "application/pdf" || fileName?.toLowerCase().endsWith(".pdf");

const isImageFile = (fileType?: string, fileName?: string) =>
  Boolean(fileType?.startsWith("image/")) ||
  /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(fileName ?? "");

const isVideoFile = (fileType?: string, fileName?: string) =>
  Boolean(fileType?.startsWith("video/")) ||
  /\.(3gp|avi|m4v|mkv|mov|mp4|mpeg|mpg|ogg|ogv|webm)$/i.test(fileName ?? "");

const getFileExtension = (fileName: string) => {
  const extension = fileName.split(".").pop();

  if (!extension || extension === fileName) {
    return "FILE";
  }

  return extension.slice(0, 4).toUpperCase();
};

const getFileBadge = (fileName: string, fileType?: string) => {
  const normalizedName = fileName.toLowerCase();
  const normalizedType = fileType?.toLowerCase() ?? "";

  if (
    normalizedType.includes("word") ||
    /\.(doc|docx)$/i.test(normalizedName)
  ) {
    return {
      className: "bg-blue-600 text-white",
      label: "DOC",
    };
  }

  if (
    normalizedType.includes("excel") ||
    normalizedType.includes("spreadsheet") ||
    /\.(xls|xlsx|csv)$/i.test(normalizedName)
  ) {
    return {
      className: "bg-emerald-600 text-white",
      label: "XLS",
    };
  }

  if (
    normalizedType.includes("powerpoint") ||
    normalizedType.includes("presentation") ||
    /\.(ppt|pptx)$/i.test(normalizedName)
  ) {
    return {
      className: "bg-orange-600 text-white",
      label: "PPT",
    };
  }

  return {
    className: "bg-slate-500 text-white",
    label: getFileExtension(fileName),
  };
};

const mobileEmojiCategories = [
  {
    id: "smileys",
    label: "Caras",
    icon: FaceSmileIcon,
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "🥹",
      "😅",
      "😂",
      "🤣",
      "🥲",
      "😊",
      "☺️",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🥳",
      "😏",
      "😒",
      "😞",
      "😔",
      "😟",
      "😕",
      "🙁",
      "☹️",
      "😣",
      "😖",
      "😫",
      "😩",
      "🥺",
      "😢",
      "😭",
      "😤",
      "😠",
      "😡",
      "🤬",
      "🤯",
      "😳",
      "🥵",
      "🥶",
      "😱",
    ],
  },
  {
    id: "gestures",
    label: "Gestos",
    icon: HandRaisedIcon,
    emojis: [
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "👌",
      "🤌",
      "🤏",
      "✌️",
      "🤞",
      "🫰",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "🫶",
      "🤲",
      "🤝",
      "🙏",
    ],
  },
  {
    id: "hearts",
    label: "Amor",
    icon: HeartIcon,
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "♥️",
      "💋",
      "💯",
      "🔥",
      "✨",
    ],
  },
  {
    id: "objects",
    label: "Objetos",
    icon: SparklesIcon,
    emojis: [
      "🎉",
      "🎊",
      "🎁",
      "🛍️",
      "🧾",
      "📦",
      "📌",
      "📍",
      "✂️",
      "🧵",
      "🪡",
      "👕",
      "👚",
      "👗",
      "🧥",
      "👖",
      "🧢",
      "👟",
      "👜",
      "💼",
      "📱",
      "☎️",
      "💬",
      "✅",
      "☑️",
      "❌",
      "⚠️",
      "⭐",
      "🌟",
      "💰",
      "💳",
      "🚚",
    ],
  },
  {
    id: "symbols",
    label: "Simbolos",
    icon: SwatchIcon,
    emojis: [
      "🔴",
      "🟠",
      "🟡",
      "🟢",
      "🔵",
      "🟣",
      "⚫",
      "⚪",
      "⬛",
      "⬜",
      "🟥",
      "🟧",
      "🟨",
      "🟩",
      "🟦",
      "🟪",
      "⬆️",
      "➡️",
      "⬇️",
      "⬅️",
      "↗️",
      "↘️",
      "🔁",
      "🔔",
      "🔕",
      "📣",
      "🔒",
      "🔓",
      "🔎",
      "💡",
      "📅",
      "⏰",
    ],
  },
];

function MobileEmojiPanel({
  activeCategory,
  onBackspace,
  onCategoryChange,
  onEmojiSelect,
  panelRef,
}: {
  activeCategory: string;
  onBackspace: () => void;
  onCategoryChange: (categoryId: string) => void;
  onEmojiSelect: (emoji: string) => void;
  panelRef: RefObject<HTMLDivElement | null>;
}) {
  const touchStartRef = useRef<{
    moved: boolean;
    target: HTMLButtonElement | null;
    x: number;
    y: number;
  } | null>(null);
  const selectedCategory =
    mobileEmojiCategories.find((category) => category.id === activeCategory) ??
    mobileEmojiCategories[0];
  const handleActionTouchStart = (event: ReactTouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0];

    touchStartRef.current = touch
      ? {
          moved: false,
          target: event.currentTarget,
          x: touch.clientX,
          y: touch.clientY,
        }
      : null;
  };
  const handleActionTouchMove = (event: ReactTouchEvent<HTMLButtonElement>) => {
    const touch = event.touches[0];
    const touchStart = touchStartRef.current;

    if (!touch || !touchStart) {
      return;
    }

    const moved =
      Math.abs(touch.clientX - touchStart.x) > 8 ||
      Math.abs(touch.clientY - touchStart.y) > 8;

    if (moved) {
      touchStart.moved = true;
    }
  };
  const runMouseAction = (
    event: ReactMouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    const touchStart = touchStartRef.current;

    if (touchStart) {
      const isSameTarget = touchStart.target === event.currentTarget;
      const shouldRunTouchTap = isSameTarget && !touchStart.moved;
      touchStartRef.current = null;

      if (!shouldRunTouchTap) {
        return;
      }

      event.preventDefault();
      action();
      return;
    }

    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    action();
  };
  const runKeyboardAction = (
    event: ReactMouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    if (event.detail === 0) {
      action();
    }
  };

  return (
    <div
      ref={panelRef}
      data-testid="mobile-emoji-panel"
      className="relative z-50 -mx-2 mt-2 flex h-[42dvh] max-h-[380px] min-h-[300px] flex-col overflow-hidden border-t border-slate-200 bg-white text-slate-900 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:shadow-[0_-12px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-slate-300 dark:bg-slate-600" />

      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-slate-500 dark:text-slate-300">
        <MagnifyingGlassIcon className="h-6 w-6 shrink-0" />
        <div className="flex h-11 flex-1 items-center justify-center rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            className="flex h-9 w-24 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white dark:shadow-none"
            aria-label="Emojis"
          >
            <FaceSmileIcon className="h-6 w-6" />
          </button>
        </div>
        <button
          type="button"
          onTouchStart={handleActionTouchStart}
          onTouchMove={handleActionTouchMove}
          onMouseDown={(event) => runMouseAction(event, onBackspace)}
          onClick={(event) => runKeyboardAction(event, onBackspace)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Borrar emoji"
        >
          <BackspaceIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <div className="grid grid-cols-8 gap-y-3">
          {selectedCategory.emojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              type="button"
              onTouchStart={handleActionTouchStart}
              onTouchMove={handleActionTouchMove}
              onMouseDown={(event) =>
                runMouseAction(event, () => onEmojiSelect(emoji))
              }
              onClick={(event) =>
                runKeyboardAction(event, () => onEmojiSelect(emoji))
              }
              className="flex aspect-square items-center justify-center rounded-xl text-[2rem] leading-none transition-colors hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700"
              aria-label={`Insertar emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-5 border-t border-slate-200 bg-white px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 dark:border-slate-800 dark:bg-slate-950">
        {mobileEmojiCategories.map((category) => {
          const Icon = category.icon;
          const selected = category.id === selectedCategory.id;

          return (
            <button
              key={category.id}
              type="button"
              onTouchStart={handleActionTouchStart}
              onTouchMove={handleActionTouchMove}
              onMouseDown={(event) =>
                runMouseAction(event, () => onCategoryChange(category.id))
              }
              onClick={(event) =>
                runKeyboardAction(event, () => onCategoryChange(category.id))
              }
              className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                selected
                  ? "bg-slate-900 text-white dark:bg-slate-800"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
              }`}
              aria-label={category.label}
              aria-pressed={selected}
            >
              <Icon className="h-6 w-6" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConversationRow({
  conversation,
  onSelect,
  tags,
}: {
  conversation: Conversation;
  onSelect: () => void;
  tags: ConversationTag[];
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex w-full gap-3 border-b border-border px-3 py-3 text-left transition-colors hover:bg-muted/60 ${
        conversation.active ? "bg-muted" : "bg-background"
      }`}
    >
      {conversation.active && (
        <span className="absolute left-0 top-0 h-full w-1 bg-muted-foreground" />
      )}
      <ChatAvatar />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {conversation.id}
          </h3>
          <span className="shrink-0 text-[11px] text-foreground">
            {conversation.time}
          </span>
        </div>
        {conversation.preview ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {conversation.preview}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">Sin ultimo mensaje</p>
        )}
        {tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex items-center justify-end gap-2 text-muted-foreground">
          <EyeIcon className="h-4 w-4" />
          <ChevronDownIcon className="h-3.5 w-3.5" />
          <span className="rounded bg-muted-foreground/35 px-1.5 py-0.5 text-[10px] font-semibold text-background">
            {conversation.initials}
          </span>
        </div>
      </div>
    </button>
  );
}

function MessageBubble({
  item,
  onOpenImagePreview,
}: {
  item: ChatMessage;
  onOpenImagePreview: (image: { alt: string; url: string }) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  if (item.type === "date") {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          {item.text}
        </span>
      </div>
    );
  }

  if (item.type === "system") {
    return (
      <div className="ml-auto w-fit max-w-[92%] rounded-md bg-card px-3 py-3 text-sm text-card-foreground shadow-sm md:max-w-[70%]">
        <p className="whitespace-pre-wrap break-words">{item.text}</p>
        <p className="mt-2 text-right text-[10px] text-muted-foreground">{item.time}</p>
      </div>
    );
  }

  if (item.type === "outgoing-file") {
    const isImageAttachment = isImageFile(item.fileType, item.text) && item.fileUrl;
    const isVideoAttachment = isVideoFile(item.fileType, item.text) && item.fileUrl;
    const isPdfAttachmentMessage = isPdfFile(item.fileType, item.text) && item.fileUrl;
    const fileBadge = getFileBadge(item.text, item.fileType);

    return (
      <div className={`whatsapp-outgoing-bubble ml-auto w-fit max-w-[88%] rounded-md text-sm shadow-sm md:max-w-[55%] ${isImageAttachment || isVideoAttachment || isPdfAttachmentMessage ? "p-1.5" : "px-3 py-3"}`}>
        {isImageAttachment ? (
          <button
            type="button"
            onClick={() =>
              onOpenImagePreview({ alt: item.text, url: item.fileUrl ?? "" })
            }
            aria-label={item.text}
            className="block h-64 w-[min(68vw,320px)] rounded bg-cover bg-center"
            style={{ backgroundImage: `url("${item.fileUrl}")` }}
          />
        ) : isVideoAttachment ? (
          <video
            src={item.fileUrl}
            controls
            playsInline
            preload="metadata"
            className="max-h-72 w-[min(76vw,360px)] rounded bg-black"
          />
        ) : isPdfAttachmentMessage ? (
          <div className="w-[min(76vw,340px)] overflow-hidden rounded bg-[#1f2c24] dark:bg-[#1f2428]">
            <PdfFirstPagePreview
              attachment={{
                id: item.id,
                name: item.text,
                objectUrl: item.fileUrl ?? "",
                size: item.fileSize ?? 0,
                type: item.fileType ?? "application/pdf",
              }}
              className="flex h-28 w-full items-start justify-center overflow-hidden bg-white"
              maxHeight={180}
              maxWidth={340}
            />
            <div className="flex items-center gap-3 bg-black/20 px-3 py-3 text-white">
              <div className="flex h-9 w-8 shrink-0 flex-col items-center justify-center rounded-sm bg-red-600 text-[9px] font-black leading-none text-white">
                PDF
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-5">
                  {item.text}
                </p>
                <p className="mt-0.5 text-xs text-white/65">
                  {item.pageCount ? `${item.pageCount} paginas · ` : ""}
                  PDF
                  {item.fileSize ? ` · ${formatFileSize(item.fileSize)}` : ""}
                </p>
              </div>
              {item.fileUrl && (
                <a
                  href={item.fileUrl}
                  download={item.text}
                  onClick={(event) => event.stopPropagation()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={`Descargar ${item.text}`}
                >
                  <ArrowDownTrayIcon className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between gap-3 font-semibold">
              <span className="min-w-0 break-words">Cristofer Leonardo:</span>
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </div>
            <div className="whatsapp-outgoing-file flex items-center gap-3 rounded px-3 py-2 text-xs font-semibold">
              <span
                className={`flex h-9 w-8 shrink-0 items-center justify-center rounded-sm text-[9px] font-black leading-none ${fileBadge.className}`}
              >
                {fileBadge.label}
              </span>
              <span className="min-w-0 flex-1 break-words">{item.text}</span>
              {item.fileUrl && (
                <a
                  href={item.fileUrl}
                  download={item.text}
                  onClick={(event) => event.stopPropagation()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/20 text-current/80 transition-colors hover:bg-black/5 hover:text-current dark:hover:bg-white/10"
                  aria-label={`Descargar ${item.text}`}
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </>
        )}
        <p className={`whatsapp-outgoing-meta flex items-center justify-end gap-1 text-[10px] ${isImageAttachment ? "mt-1 px-1" : "mt-2"}`}>
          {item.time}
          <CheckIcon className="whatsapp-outgoing-check h-3 w-3" />
        </p>
      </div>
    );
  }

  if (item.type === "outgoing-audio") {
    return (
      <div className="whatsapp-outgoing-bubble outgoing-audio-bubble desktop-audio-bubble ml-auto w-fit max-w-[88%] rounded-md px-3 py-3 text-sm shadow-sm md:max-w-[55%] md:rounded-lg md:px-3.5 md:py-2.5 md:shadow-[0_1px_1px_rgba(11,20,26,0.18)]">
        <audio ref={audioRef} src={item.audioUrl} preload="metadata" />
        <div className="flex min-w-[240px] max-w-full items-center gap-3 md:min-w-[330px] md:gap-2.5">
          <div className="relative h-10 w-10 shrink-0">
            <div className="desktop-audio-avatar flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-muted-foreground md:h-11 md:w-11">
              <UserIconSolid className="h-5 w-5" />
            </div>
            <div className="desktop-audio-mic absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
              <MicrophoneIcon className="h-3 w-3" />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
            <button
              onClick={handleTogglePlay}
              className="desktop-audio-play flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-emerald-700 hover:bg-black/5 md:h-9 md:w-9"
              aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
            >
              {isPlaying ? (
                <PauseIcon className="desktop-audio-play-icon h-5 w-5" />
              ) : (
                <PlayIcon className="desktop-audio-play-icon h-5 w-5" />
              )}
            </button>
            <div className="relative flex h-8 flex-1 items-center gap-0.5 overflow-hidden md:h-9">
              {AUDIO_WAVEFORM_BARS.map((height, index) => {
                const barPosition = (index / AUDIO_WAVEFORM_BARS.length) * 100;
                const isPlayed = barPosition <= progress;
                return (
                  <span
                    key={`${height}-${index}`}
                    className="desktop-audio-wave-bar absolute bottom-0 w-0.5 rounded-full transition-colors md:w-1"
                    style={{
                      height,
                      left: `${(index / AUDIO_WAVEFORM_BARS.length) * 100}%`,
                      backgroundColor: isPlayed
                        ? "var(--chat-audio-played, rgb(255, 255, 255))"
                        : "var(--chat-audio-idle, rgba(255, 255, 255, 0.4))",
                    }}
                  />
                );
              })}
            </div>
            <span className="desktop-audio-duration shrink-0 text-xs md:w-10 md:text-right md:font-medium">
              {formatAudioDuration(item.duration ?? 0)}
            </span>
          </div>
        </div>
        <p className="desktop-audio-time whatsapp-outgoing-meta mt-2 flex items-center justify-end gap-1 text-[10px] md:mt-1">
          {item.time}
          <CheckIcon className="whatsapp-outgoing-check h-3 w-3" />
        </p>
      </div>
    );
  }

  if (item.type === "outgoing") {
    return (
      <div className="whatsapp-outgoing-bubble ml-auto w-fit max-w-[88%] rounded-md px-3 py-3 text-sm shadow-sm md:max-w-[55%]">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 whitespace-pre-wrap break-words">{item.text}</p>
          <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" />
        </div>
        <p className="whatsapp-outgoing-meta mt-4 flex items-center justify-end gap-1 text-[10px]">
          {item.time}
          <CheckIcon className="whatsapp-outgoing-check h-3 w-3" />
        </p>
      </div>
    );
  }

  return (
    <div className="mr-auto w-fit max-w-[88%] rounded-md bg-card px-3 py-3 text-sm text-card-foreground shadow-sm md:max-w-[55%]">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 whitespace-pre-wrap break-words">{item.text}</p>
        <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" />
      </div>
      <p className="mt-4 text-right text-[10px] text-muted-foreground">{item.time}</p>
    </div>
  );
}

function PdfFirstPagePreview({
  attachment,
  className,
  maxHeight,
  maxWidth,
  onPageCount,
}: {
  attachment: PendingAttachment;
  className?: string;
  maxHeight: number;
  maxWidth: number;
  onPageCount?: (pageCount: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onPageCountRef = useRef(onPageCount);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    onPageCountRef.current = onPageCount;
  }, [onPageCount]);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    let renderTask: RenderTask | null = null;

    const renderPdf = async () => {
      setFailed(false);
      setLoaded(false);

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const currentLoadingTask = pdfjs.getDocument(attachment.objectUrl);
        loadingTask = currentLoadingTask;
        const pdf = await currentLoadingTask.promise;
        onPageCountRef.current?.(pdf.numPages);
        const page = await pdf.getPage(1);

        if (cancelled) {
          return;
        }

        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!canvas || !context) {
          return;
        }

        const viewport = page.getViewport({ scale: 1 });
        const ratio =
          typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio, 2);
        const baseScale = Math.min(
          maxWidth / viewport.width,
          maxHeight / viewport.height,
        );
        const scaledViewport = page.getViewport({ scale: baseScale * ratio });

        canvas.width = Math.floor(scaledViewport.width);
        canvas.height = Math.floor(scaledViewport.height);
        canvas.style.width = `${Math.floor(scaledViewport.width / ratio)}px`;
        canvas.style.height = `${Math.floor(scaledViewport.height / ratio)}px`;

        const currentRenderTask = page.render({
          canvas,
          canvasContext: context,
          viewport: scaledViewport,
        });
        renderTask = currentRenderTask;
        await currentRenderTask.promise;
        setLoaded(true);
      } catch (error) {
        if (!cancelled) {
          const errorName =
            error instanceof Error ? error.name : "UnknownPdfPreviewError";

          if (errorName !== "RenderingCancelledException") {
            setFailed(true);
          }
        }
      }
    };

    void renderPdf();

    return () => {
      cancelled = true;
      renderTask?.cancel();
      void loadingTask?.destroy();
    };
  }, [attachment.objectUrl, maxHeight, maxWidth]);

  if (failed) {
    return (
      <div className={className}>
        <DocumentIcon className="mb-4 h-14 w-14 text-emerald-600" />
        <p className="max-w-xs break-words text-center text-sm font-semibold">
          {attachment.name}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {formatFileSize(attachment.size)}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      {!loaded && !failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-white text-xs font-semibold text-slate-500">
          Cargando PDF...
        </div>
      )}
      <canvas ref={canvasRef} className="rounded bg-white shadow-2xl" />
    </div>
  );
}

export default function ChatPage() {
  const { resolvedTheme } = useTheme();
  const [messageDraft, setMessageDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialTimeline);
  const [activeConversationId, setActiveConversationId] = useState<string | null>("932889985");
  const allMessagesRef = useRef<Record<string, ChatMessage[]>>({ ...initialMessagesByConversation });

  const switchConversation = (conversationId: string) => {
    if (activeConversationId) {
      allMessagesRef.current = { ...allMessagesRef.current, [activeConversationId]: messages };
    }
    setActiveConversationId(conversationId);
    setMessages(allMessagesRef.current[conversationId] ?? []);
  };

  const [activeFilter, setActiveFilter] = useState<"all" | "waiting" | "resolved">("all");
  const [waitingIds, setWaitingIds] = useState<Set<string>>(
    new Set(conversations.filter((c) => c.waiting).map((c) => c.id)),
  );
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const moveFromWaiting = (conversationId: string | null) => {
    if (!conversationId) return;
    setWaitingIds((current) => {
      const next = new Set(current);
      next.delete(conversationId);
      return next;
    });
    if (activeFilter === "waiting") {
      setActiveFilter("all");
    }
  };

  const resolveConversation = (conversationId: string) => {
    setWaitingIds((current) => {
      const next = new Set(current);
      next.delete(conversationId);
      return next;
    });
    setResolvedIds((current) => new Set(current).add(conversationId));
  };

  const handleResolveCurrent = () => {
    if (!activeConversationId) return;
    allMessagesRef.current = { ...allMessagesRef.current, [activeConversationId]: messages };
    resolveConversation(activeConversationId);
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleReopenCurrent = () => {
    if (!activeConversationId) return;
    setResolvedIds((current) => {
      const next = new Set(current);
      next.delete(activeConversationId);
      return next;
    });
    setActiveFilter("all");
  };

  const filteredConversations = conversations.filter((c) => {
    if (activeFilter === "waiting") return waitingIds.has(c.id);
    if (activeFilter === "resolved") return resolvedIds.has(c.id);
    return !waitingIds.has(c.id) && !resolvedIds.has(c.id);
  });

  const changeFilter = (filter: "all" | "waiting" | "resolved") => {
    setActiveFilter(filter);
    if (activeConversationId) {
      const willBeVisible = conversations.filter((c) => {
        if (filter === "waiting") return waitingIds.has(c.id);
        if (filter === "resolved") return resolvedIds.has(c.id);
        return !waitingIds.has(c.id) && !resolvedIds.has(c.id);
      }).find((c) => c.id === activeConversationId);
      if (!willBeVisible) {
        allMessagesRef.current = { ...allMessagesRef.current, [activeConversationId]: messages };
        setActiveConversationId(null);
        setMessages([]);
      }
    }
  };
  const [conversationTags, setConversationTags] = useState<Record<string, ConversationTag[]>>({});
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0].value);

  const activeConversationTags = activeConversationId ? (conversationTags[activeConversationId] ?? []) : [];

  const addTag = () => {
    if (!activeConversationId || !newTagLabel.trim()) return;
    const tag: ConversationTag = {
      id: `tag-${getTimestamp()}`,
      label: newTagLabel.trim(),
      color: newTagColor,
    };
    setConversationTags((current) => ({
      ...current,
      [activeConversationId]: [...(current[activeConversationId] ?? []), tag],
    }));
    setNewTagLabel("");
    setNewTagColor(TAG_COLORS[0].value);
  };

  const removeTag = (tagId: string) => {
    if (!activeConversationId) return;
    setConversationTags((current) => ({
      ...current,
      [activeConversationId]: (current[activeConversationId] ?? []).filter((t) => t.id !== tagId),
    }));
  };

  const openTagModal = () => {
    setNewTagLabel("");
    setNewTagColor(TAG_COLORS[0].value);
    setIsTagModalOpen(true);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [activeMobileEmojiCategory, setActiveMobileEmojiCategory] =
    useState(mobileEmojiCategories[0].id);
  const [mobileView, setMobileView] = useState<"list" | "conversation">("list");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("crm:chat-mobile-view", {
        detail: { conversationOpen: mobileView === "conversation" },
      }),
    );
  }, [mobileView]);
  const [isDesktopRecording, setIsDesktopRecording] = useState(false);
  const [desktopRecordingSeconds, setDesktopRecordingSeconds] = useState(0);
  const [desktopRecorderError, setDesktopRecorderError] = useState("");
  const [desktopAudioPreview, setDesktopAudioPreview] = useState<{
    audioUrl: string;
    duration: number;
  } | null>(null);
  const [isDesktopAudioPreviewPlaying, setIsDesktopAudioPreviewPlaying] =
    useState(false);
  const [desktopAudioProgress, setDesktopAudioProgress] = useState(0);
  const [isMobileRecording, setIsMobileRecording] = useState(false);
  const [mobileRecordingSeconds, setMobileRecordingSeconds] = useState(0);
  const [mobileAudioPreview, setMobileAudioPreview] = useState<{
    audioUrl: string;
    duration: number;
  } | null>(null);
  const [isMobileAudioPreviewPlaying, setIsMobileAudioPreviewPlaying] =
    useState(false);
  const [mobileAudioProgress, setMobileAudioProgress] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>(
    [],
  );
  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);
  const [attachmentCaption, setAttachmentCaption] = useState("");
  const [pdfPageCounts, setPdfPageCounts] = useState<Record<string, number>>({});
  const [imagePreview, setImagePreview] = useState<{
    alt: string;
    url: string;
  } | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);
  const pendingAttachmentsRef = useRef<PendingAttachment[]>([]);
  const mobileInputRef = useRef<HTMLTextAreaElement>(null);
  const desktopInputRef = useRef<HTMLTextAreaElement>(null);
  const mobileEmojiPanelRef = useRef<HTMLDivElement>(null);
  const desktopEmojiPanelRef = useRef<HTMLDivElement>(null);
  const mobileEmojiButtonRef = useRef<HTMLButtonElement>(null);
  const desktopEmojiButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingCursorPositionRef = useRef<number | null>(null);
  const desktopMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const desktopAudioChunksRef = useRef<Blob[]>([]);
  const desktopRecordingStreamRef = useRef<MediaStream | null>(null);
  const desktopRecordingStartedAtRef = useRef(0);
  const desktopRecordingIntervalRef = useRef<number | null>(null);
  const desktopRecordingActionRef = useRef<"preview" | "send" | "cancel">(
    "preview",
  );
  const desktopAudioPreviewRef = useRef<HTMLAudioElement>(null);
  const recordedAudioUrlsRef = useRef<string[]>([]);
  const sentAttachmentUrlsRef = useRef<string[]>([]);
  const mobileMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mobileAudioChunksRef = useRef<Blob[]>([]);
  const mobileRecordingStreamRef = useRef<MediaStream | null>(null);
  const mobileRecordingStartedAtRef = useRef(0);
  const mobileRecordingIntervalRef = useRef<number | null>(null);
  const mobileAudioPreviewRef = useRef<HTMLAudioElement>(null);

  const isMobileViewport = () =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  const getActiveMessageInput = () =>
    isMobileViewport() ? mobileInputRef.current : desktopInputRef.current;
  const emojiPickerTheme = resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT;
  const getMessageTime = () =>
    new Intl.DateTimeFormat("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

  const resizeMessageTextarea = (textarea: HTMLTextAreaElement | null) => {
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, MESSAGE_TEXTAREA_MAX_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > MESSAGE_TEXTAREA_MAX_HEIGHT ? "auto" : "hidden";
  };

  const clearDesktopRecordingTimer = () => {
    if (desktopRecordingIntervalRef.current === null) {
      return;
    }

    window.clearInterval(desktopRecordingIntervalRef.current);
    desktopRecordingIntervalRef.current = null;
  };

  const stopDesktopRecordingStream = () => {
    desktopRecordingStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    desktopRecordingStreamRef.current = null;
  };

  const revokeRecordedAudioUrl = (audioUrl: string) => {
    URL.revokeObjectURL(audioUrl);
    recordedAudioUrlsRef.current = recordedAudioUrlsRef.current.filter(
      (recordedAudioUrl) => recordedAudioUrl !== audioUrl,
    );
  };

  const handleDeleteDesktopAudioPreview = () => {
    if (!desktopAudioPreview) {
      return;
    }

    desktopAudioPreviewRef.current?.pause();
    setIsDesktopAudioPreviewPlaying(false);
    setDesktopAudioProgress(0);
    revokeRecordedAudioUrl(desktopAudioPreview.audioUrl);
    setDesktopAudioPreview(null);
  };

  const handleToggleDesktopAudioPreview = () => {
    const audio = desktopAudioPreviewRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      if (audio.duration && audio.currentTime >= audio.duration) {
        audio.currentTime = 0;
        setDesktopAudioProgress(0);
      }

      void audio.play();
      setIsDesktopAudioPreviewPlaying(true);
      return;
    }

    audio.pause();
    setIsDesktopAudioPreviewPlaying(false);
  };

  const handleSendDesktopAudioPreview = () => {
    if (!desktopAudioPreview) {
      return;
    }

    desktopAudioPreviewRef.current?.pause();
    setIsDesktopAudioPreviewPlaying(false);
    setDesktopAudioProgress(0);

    setMessages((current) => [
      ...current,
      {
        id: `audio-${getTimestamp()}`,
        type: "outgoing-audio",
        text: "Audio",
        time: getMessageTime(),
        audioUrl: desktopAudioPreview.audioUrl,
        duration: desktopAudioPreview.duration,
      },
    ]);
    moveFromWaiting(activeConversationId);
    setDesktopAudioPreview(null);
  };

  useEffect(() => {
    const audio = desktopAudioPreviewRef.current;

    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setDesktopAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsDesktopAudioPreviewPlaying(false);
      setDesktopAudioProgress(100);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [desktopAudioPreview]);

  const handleFinishDesktopAudioRecording = () => {
    clearDesktopRecordingTimer();
    stopDesktopRecordingStream();

    const recorder = desktopMediaRecorderRef.current;
    const audioChunks = desktopAudioChunksRef.current;
    const recordingAction = desktopRecordingActionRef.current;
    const duration = Math.max(
      1,
      Math.round((getTimestamp() - desktopRecordingStartedAtRef.current) / 1000),
    );

    setIsDesktopRecording(false);
    setDesktopRecordingSeconds(0);
    desktopMediaRecorderRef.current = null;
    desktopAudioChunksRef.current = [];
    desktopRecordingActionRef.current = "preview";

    if (recordingAction === "cancel" || audioChunks.length === 0) {
      return;
    }

    const audioBlob = new Blob(audioChunks, {
      type: recorder?.mimeType || "audio/webm",
    });
    const audioUrl = URL.createObjectURL(audioBlob);
    recordedAudioUrlsRef.current.push(audioUrl);

    if (recordingAction === "send") {
      setMessages((current) => [
        ...current,
        {
          id: `audio-${getTimestamp()}`,
          type: "outgoing-audio",
          text: "Audio",
          time: getMessageTime(),
          audioUrl,
          duration,
        },
      ]);
      moveFromWaiting(activeConversationId);
      return;
    }

    setDesktopAudioProgress(0);
    setDesktopAudioPreview({ audioUrl, duration });
  };

  const clearMobileRecordingTimer = () => {
    if (mobileRecordingIntervalRef.current === null) return;
    window.clearInterval(mobileRecordingIntervalRef.current);
    mobileRecordingIntervalRef.current = null;
  };

  const stopMobileRecordingStream = () => {
    mobileRecordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    mobileRecordingStreamRef.current = null;
  };

  const handleDeleteMobileAudioPreview = () => {
    if (!mobileAudioPreview) return;
    mobileAudioPreviewRef.current?.pause();
    setIsMobileAudioPreviewPlaying(false);
    setMobileAudioProgress(0);
    URL.revokeObjectURL(mobileAudioPreview.audioUrl);
    setMobileAudioPreview(null);
  };

  const handleToggleMobileAudioPreview = () => {
    const audio = mobileAudioPreviewRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (audio.duration && audio.currentTime >= audio.duration) {
        audio.currentTime = 0;
        setMobileAudioProgress(0);
      }

      void audio.play();
      setIsMobileAudioPreviewPlaying(true);
    } else {
      audio.pause();
      setIsMobileAudioPreviewPlaying(false);
    }
  };

  useEffect(() => {
    const audio = mobileAudioPreviewRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      if (audio.duration) setMobileAudioProgress((audio.currentTime / audio.duration) * 100);
    };
    const handleEnded = () => {
      setIsMobileAudioPreviewPlaying(false);
      setMobileAudioProgress(0);
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [mobileAudioPreview]);

  const handleSendMobileAudioPreview = () => {
    if (!mobileAudioPreview) return;
    mobileAudioPreviewRef.current?.pause();
    setIsMobileAudioPreviewPlaying(false);
    setMobileAudioProgress(0);
    setMessages((current) => [
      ...current,
      {
        id: `audio-${getTimestamp()}`,
        type: "outgoing-audio",
        text: "Audio",
        time: getMessageTime(),
        audioUrl: mobileAudioPreview.audioUrl,
        duration: mobileAudioPreview.duration,
      },
    ]);
    moveFromWaiting(activeConversationId);
    setMobileAudioPreview(null);
  };

  const handleFinishMobileAudioRecording = (action: "cancel" | "preview" | "send") => {
    clearMobileRecordingTimer();
    stopMobileRecordingStream();

    const recorder = mobileMediaRecorderRef.current;
    const audioChunks = mobileAudioChunksRef.current;
    const duration = Math.max(
      1,
      Math.round((getTimestamp() - mobileRecordingStartedAtRef.current) / 1000),
    );

    setIsMobileRecording(false);
    setMobileRecordingSeconds(0);
    mobileMediaRecorderRef.current = null;
    mobileAudioChunksRef.current = [];

    if (action === "cancel" || audioChunks.length === 0) return;

    const audioBlob = new Blob(audioChunks, { type: recorder?.mimeType || "audio/webm" });
    const audioUrl = URL.createObjectURL(audioBlob);
    recordedAudioUrlsRef.current.push(audioUrl);

    if (action === "send") {
      setMessages((current) => [
        ...current,
        {
          id: `audio-${getTimestamp()}`,
          type: "outgoing-audio",
          text: "Audio",
          time: getMessageTime(),
          audioUrl,
          duration,
        },
      ]);
      moveFromWaiting(activeConversationId);
      return;
    }

    setMobileAudioPreview({ audioUrl, duration });
  };

  const handleStartMobileAudioRecording = async () => {
    if (messageDraft.trim()) {
      handleSendMessage();
      return;
    }

    if (mobileAudioPreview) {
      handleSendMobileAudioPreview();
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setDesktopRecorderError("Tu navegador no soporta grabación de audio.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mobileRecordingStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mobileMediaRecorderRef.current = recorder;
      mobileAudioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) mobileAudioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        handleFinishMobileAudioRecording("preview");
      };

      recorder.start();
      setIsMobileRecording(true);
      mobileRecordingStartedAtRef.current = getTimestamp();

      mobileRecordingIntervalRef.current = window.setInterval(() => {
        setMobileRecordingSeconds(
          Math.round((getTimestamp() - mobileRecordingStartedAtRef.current) / 1000),
        );
      }, 1000);
    } catch {
      setDesktopRecorderError("No se pudo acceder al micrófono.");
    }
  };

  const handleStopMobileAudioRecording = (action: "cancel" | "preview" | "send") => {
    const recorder = mobileMediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        handleFinishMobileAudioRecording(action);
      };
      recorder.stop();
    } else {
      handleFinishMobileAudioRecording(action);
    }
  };

  const handleStartDesktopAudioRecording = async () => {
    if (isMobileViewport() || isDesktopRecording) {
      return;
    }

    if (messageDraft.trim()) {
      handleSendMessage();
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setDesktopRecorderError(
        "Tu navegador no permite grabar audio en este entorno.",
      );
      return;
    }

    try {
      setDesktopRecorderError("");
      setEmojiPickerOpen(false);
      handleDeleteDesktopAudioPreview();
      desktopInputRef.current?.blur();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      desktopAudioChunksRef.current = [];
      desktopRecordingStreamRef.current = stream;
      desktopMediaRecorderRef.current = mediaRecorder;
      desktopRecordingStartedAtRef.current = getTimestamp();
      desktopRecordingActionRef.current = "preview";

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          desktopAudioChunksRef.current.push(event.data);
        }
      });
      mediaRecorder.addEventListener("stop", handleFinishDesktopAudioRecording, {
        once: true,
      });

      mediaRecorder.start();
      setIsDesktopRecording(true);
      setDesktopRecordingSeconds(0);
      desktopRecordingIntervalRef.current = window.setInterval(() => {
        setDesktopRecordingSeconds(
          Math.max(
            1,
            Math.floor((getTimestamp() - desktopRecordingStartedAtRef.current) / 1000),
          ),
        );
      }, 250);
    } catch {
      clearDesktopRecordingTimer();
      stopDesktopRecordingStream();
      desktopMediaRecorderRef.current = null;
      desktopAudioChunksRef.current = [];
      setIsDesktopRecording(false);
      setDesktopRecorderError(
        "No se pudo acceder al microfono. Revisa los permisos del navegador.",
      );
    }
  };

  const handleStopDesktopAudioRecording = (
    action: "preview" | "send" | "cancel",
  ) => {
    desktopRecordingActionRef.current = action;
    const recorder = desktopMediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }

    handleFinishDesktopAudioRecording();
  };

  useEffect(() => {
    resizeMessageTextarea(mobileInputRef.current);
    resizeMessageTextarea(desktopInputRef.current);
  }, [messageDraft]);

  useEffect(() => {
    return () => {
      clearDesktopRecordingTimer();
      stopDesktopRecordingStream();
      recordedAudioUrlsRef.current.forEach((audioUrl) => {
        URL.revokeObjectURL(audioUrl);
      });
      recordedAudioUrlsRef.current = [];
      sentAttachmentUrlsRef.current.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
      sentAttachmentUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    pendingAttachmentsRef.current = pendingAttachments;
  }, [pendingAttachments]);

  useEffect(() => {
    return () => {
      pendingAttachmentsRef.current.forEach((attachment) => {
        URL.revokeObjectURL(attachment.objectUrl);
      });
    };
  }, []);

  useEffect(() => {
    const syncDraftFromDom = () => {
      const activeInput = window.matchMedia("(max-width: 767px)").matches
        ? mobileInputRef.current
        : desktopInputRef.current;
      const nextDraft = activeInput?.value ?? "";

      setMessageDraft((current) => (current === nextDraft ? current : nextDraft));
    };

    const inputs = [mobileInputRef.current, desktopInputRef.current].filter(
      (input): input is HTMLTextAreaElement => Boolean(input),
    );
    const events = ["input", "change", "keyup", "compositionend"];

    inputs.forEach((input) => {
      events.forEach((eventName) => {
        input.addEventListener(eventName, syncDraftFromDom);
      });
    });

    const interval = window.setInterval(() => {
      if (
        document.activeElement === mobileInputRef.current ||
        document.activeElement === desktopInputRef.current
      ) {
        syncDraftFromDom();
      }
    }, 150);

    return () => {
      window.clearInterval(interval);
      inputs.forEach((input) => {
        events.forEach((eventName) => {
          input.removeEventListener(eventName, syncDraftFromDom);
        });
      });
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("crm:chat-mobile-view", {
        detail: { conversationOpen: mobileView === "conversation" },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("crm:chat-mobile-view", {
          detail: { conversationOpen: false },
        }),
      );
    };
  }, [mobileView]);

  useEffect(() => {
    if (!emojiPickerOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        mobileEmojiPanelRef.current?.contains(target) ||
        desktopEmojiPanelRef.current?.contains(target) ||
        mobileEmojiButtonRef.current?.contains(target) ||
        desktopEmojiButtonRef.current?.contains(target)
      ) {
        return;
      }

      setEmojiPickerOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEmojiPickerOpen(false);
        const activeInput = window.matchMedia("(max-width: 767px)").matches
          ? mobileInputRef.current
          : desktopInputRef.current;
        activeInput?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [emojiPickerOpen]);

  const handleEmojiToggle = () => {
    if (isMobileViewport()) {
      mobileInputRef.current?.blur();
    }

    setEmojiPickerOpen((current) => !current);
  };

  const handleMobileEmojiTouchStart = (
    event: ReactTouchEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    handleEmojiToggle();
  };

  const handleMobileEmojiMouseDown = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    handleEmojiToggle();
  };

  const handleMobileEmojiClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) {
      handleEmojiToggle();
    }
  };

  const insertEmoji = (emoji: string, options?: { insertAtEnd?: boolean }) => {
    const input = getActiveMessageInput();
    const currentValue = input?.value ?? messageDraft;
    const shouldInsertAtEnd = options?.insertAtEnd ?? false;
    const selectionStart = shouldInsertAtEnd
      ? currentValue.length
      : input?.selectionStart ?? currentValue.length;
    const selectionEnd = shouldInsertAtEnd
      ? currentValue.length
      : input?.selectionEnd ?? currentValue.length;
    const nextMessage = `${currentValue.slice(0, selectionStart)}${emoji}${currentValue.slice(
      selectionEnd,
    )}`;
    const nextCursorPosition = selectionStart + emoji.length;

    pendingCursorPositionRef.current = nextCursorPosition;
    setMessageDraft(nextMessage);

    if (input) {
      input.value = nextMessage;
      input.setSelectionRange(nextCursorPosition, nextCursorPosition);
      resizeMessageTextarea(input);
    }

    if (isMobileViewport()) {
      mobileInputRef.current?.blur();
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const input = getActiveMessageInput();
        if (!input) {
          return;
        }

        input.focus();
        input.setSelectionRange(nextCursorPosition, nextCursorPosition);
        pendingCursorPositionRef.current = null;
      });
    });
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    insertEmoji(emojiData.emoji);
    setEmojiPickerOpen(true);
  };

  const handleMobileEmojiSelect = (emoji: string) => {
    insertEmoji(emoji, { insertAtEnd: true });
    setEmojiPickerOpen(true);
  };

  const handleMobileEmojiBackspace = () => {
    const input = getActiveMessageInput();
    const currentValue = input?.value ?? messageDraft;

    if (!currentValue) {
      return;
    }

    const nextMessage =
      "Segmenter" in Intl
        ? Array.from(
            new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
              currentValue,
            ),
            (segment) => segment.segment,
          )
            .slice(0, -1)
            .join("")
        : Array.from(currentValue).slice(0, -1).join("");

    setMessageDraft(nextMessage);

    if (input) {
      input.value = nextMessage;
      resizeMessageTextarea(input);
    }
  };

  const handleDraftChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessageDraft(event.currentTarget.value);
    resizeMessageTextarea(event.currentTarget);
  };

  const handleDraftInput = (event: FormEvent<HTMLTextAreaElement>) => {
    setMessageDraft(event.currentTarget.value);
    resizeMessageTextarea(event.currentTarget);
  };

  const handleMobileInputFocus = () => {
    if (isMobileViewport()) {
      setEmojiPickerOpen(false);
    }
  };

  const handleMessageKeyDown = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleComposerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isDesktopRecording) {
      handleStopDesktopAudioRecording("send");
      return;
    }

    if (desktopAudioPreview) {
      handleSendDesktopAudioPreview();
      return;
    }

    handleSendMessage();
  };

  const handleMobileComposerAction = () => {
    if (messageDraft.trim()) {
      handleSendMessage();
    } else if (mobileAudioPreview) {
      handleSendMobileAudioPreview();
    } else {
      void handleStartMobileAudioRecording();
    }
  };

  const handleMobileSendClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    handleMobileComposerAction();
  };

  const handleSendMessage = () => {
    const activeInput = getActiveMessageInput();
    const text = (activeInput?.value ?? messageDraft).trim();

    if (!text) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `draft-${getTimestamp()}`,
        type: "outgoing",
        text,
        time: getMessageTime(),
      },
    ]);
    moveFromWaiting(activeConversationId);
    setMessageDraft("");
    if (activeInput) {
      activeInput.value = "";
      resizeMessageTextarea(activeInput);
    }
    window.requestAnimationFrame(() => getActiveMessageInput()?.focus());
  };

  const handleAttachFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    addPendingAttachments(selectedFiles);
    event.target.value = "";
  };

  const addPendingAttachments = (selectedFiles: File[]) => {
    const nextAttachments = selectedFiles.map((file, index) => ({
      id: `attachment-${getTimestamp()}-${index}`,
      name: file.name,
      objectUrl: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
    }));

    setPendingAttachments((current) => {
      if (current.length === 0) {
        setActiveAttachmentId(nextAttachments[0]?.id ?? null);
      }

      return [...current, ...nextAttachments];
    });
  };

  const closeAttachmentPreview = () => {
    pendingAttachments.forEach((attachment) => {
      URL.revokeObjectURL(attachment.objectUrl);
    });
    setPendingAttachments([]);
    setActiveAttachmentId(null);
    setAttachmentCaption("");
    setPdfPageCounts({});
  };

  const removePendingAttachment = (attachmentId: string) => {
    setPendingAttachments((current) => {
      const removedAttachment = current.find(
        (attachment) => attachment.id === attachmentId,
      );
      const nextAttachments = current.filter(
        (attachment) => attachment.id !== attachmentId,
      );

      if (removedAttachment) {
        URL.revokeObjectURL(removedAttachment.objectUrl);
      }

      if (activeAttachmentId === attachmentId) {
        setActiveAttachmentId(nextAttachments[0]?.id ?? null);
      }

      if (nextAttachments.length === 0) {
        setAttachmentCaption("");
        setPdfPageCounts({});
      }

      return nextAttachments;
    });
  };

  const handleSendPendingAttachments = () => {
    if (pendingAttachments.length === 0) {
      return;
    }

    const sentAt = getMessageTime();
    const caption = attachmentCaption.trim();
    const sentAttachments = pendingAttachments;

    sentAttachmentUrlsRef.current.push(
      ...sentAttachments.map((attachment) => attachment.objectUrl),
    );

    setMessages((current) => [
      ...current,
      ...sentAttachments.map((attachment) => ({
        id: `file-${getTimestamp()}-${attachment.id}`,
        type: "outgoing-file" as const,
        text: attachment.name,
        time: sentAt,
        fileSize: attachment.size,
        fileType: attachment.type,
        fileUrl: attachment.objectUrl,
        pageCount: pdfPageCounts[attachment.id],
      })),
      ...(caption
        ? [
            {
              id: `caption-${getTimestamp()}`,
              type: "outgoing" as const,
              text: caption,
              time: sentAt,
            },
          ]
        : []),
    ]);
    moveFromWaiting(activeConversationId);

    setPendingAttachments([]);
    setActiveAttachmentId(null);
    setAttachmentCaption("");
    setPdfPageCounts({});
  };

  const hasDraggedFiles = (event: ReactDragEvent<HTMLElement>) =>
    Array.from(event.dataTransfer.types).includes("Files");

  const handleChatDragEnter = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDraggingFiles(true);
  };

  const handleChatDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleChatDragLeave = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);

    if (dragDepthRef.current === 0) {
      setIsDraggingFiles(false);
    }
  };

  const handleChatDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    if (!hasDraggedFiles(event)) {
      return;
    }

    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDraggingFiles(false);

    const droppedFiles = Array.from(event.dataTransfer.files);

    if (droppedFiles.length > 0) {
      addPendingAttachments(droppedFiles);
    }
  };

  const handleDesktopComposerAction = () => {
    if (desktopAudioPreview) {
      handleSendDesktopAudioPreview();
      return;
    }

    if (messageDraft.trim()) {
      handleSendMessage();
      return;
    }

    void handleStartDesktopAudioRecording();
  };

  const activeAttachment =
    pendingAttachments.find((attachment) => attachment.id === activeAttachmentId) ??
    pendingAttachments[0] ??
    null;

  return (
    <>
    <section className="flex h-full min-h-0 bg-background text-foreground">
      <aside
        className={`w-full shrink-0 flex-col border-r border-border bg-background md:flex md:w-[360px] xl:w-[380px] ${
          mobileView === "list" ? "flex" : "hidden"
        }`}
      >
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-10 flex-1 items-center">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar por numero de celular o nombre ..."
                className="h-10 w-full rounded-full border-0 bg-muted pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-muted-foreground/30"
              />
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <FunnelIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <UserPlusIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => changeFilter("all")}>
              <Badge variant="outline" className={`px-3 py-1 text-sm font-semibold ${activeFilter === "all" ? "border-transparent bg-muted text-foreground" : "text-muted-foreground"}`}>
                Todos los chats
                <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground/20 px-1 text-[10px] text-foreground">
                  {conversations.filter((c) => !waitingIds.has(c.id) && !resolvedIds.has(c.id)).length}
                </span>
              </Badge>
            </button>
            <button type="button" onClick={() => changeFilter("resolved")}>
              <Badge variant="outline" className={`px-3 py-1 text-sm ${activeFilter === "resolved" ? "border-transparent bg-muted text-foreground font-semibold" : "text-muted-foreground"}`}>
                Resueltos
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground/20 px-1 text-[10px] text-foreground">
                  {resolvedIds.size}
                </span>
              </Badge>
            </button>
            <button type="button" onClick={() => changeFilter("waiting")}>
              <Badge variant="outline" className={`px-3 py-1 text-sm ${activeFilter === "waiting" ? "border-transparent bg-muted text-foreground font-semibold" : "text-muted-foreground"}`}>
                Espera
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground/20 px-1 text-[10px] text-foreground">
                  {waitingIds.size}
                </span>
              </Badge>
            </button>
          </div>
        </div>

        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={{ ...conversation, active: conversation.id === activeConversationId }}
              onSelect={() => { switchConversation(conversation.id); setMobileView("conversation"); }}
              tags={conversationTags[conversation.id] ?? []}
            />
          ))}
        </div>
      </aside>

      <div
        className={`relative min-w-0 flex-1 flex-col bg-muted/60 md:flex ${
          mobileView === "conversation" ? "flex" : "hidden"
        }`}
        onDragEnter={handleChatDragEnter}
        onDragOver={handleChatDragOver}
        onDragLeave={handleChatDragLeave}
        onDrop={handleChatDrop}
      >
        {!activeConversationId ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <ChatBubbleLeftRightIcon className="h-16 w-16 text-muted-foreground/40" />
            <p className="text-lg font-semibold text-muted-foreground">Busca un nuevo chat</p>
            <p className="text-sm text-muted-foreground/70">Selecciona una conversacion para empezar</p>
          </div>
        ) : (
          <>
        <header className="shrink-0 border-b border-border bg-background">
          <div className="flex min-h-[84px] items-center justify-between gap-4 border-l-4 border-muted-foreground px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                aria-label="Volver a chats"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <ChatAvatar />
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-foreground">
                  {activeConversationId}
                </h2>
                <p className="mt-1 text-xs text-foreground">
                  Asignado: Cristofer Leonardo
                </p>
                <p className="mt-1 text-xs text-foreground">
                  Numero: {activeConversationId === "51987654321" ? "51987654321" : "51932889985"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!waitingIds.has(activeConversationId) && (
              <div className="flex overflow-hidden rounded-full bg-muted text-foreground shadow-sm">
                {resolvedIds.has(activeConversationId) ? (
                  <Button
                    onClick={() => handleReopenCurrent()}
                    className="h-10 rounded-none bg-muted px-9 text-xs font-bold text-foreground hover:bg-muted/80"
                  >
                    REHACER
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleResolveCurrent()}
                    className="h-10 rounded-none bg-muted px-9 text-xs font-bold text-foreground hover:bg-muted/80"
                  >
                    RESOLVER
                  </Button>
                )}
                <Button className="h-10 w-11 rounded-none border-l border-border bg-muted px-0 text-foreground hover:bg-muted/80">
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </div>
              )}
              <button
                type="button"
                onClick={toggleSidebar}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  isSidebarOpen
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                aria-label="Abrir panel de venta"
                title="Venta Rapida"
              >
                <ShoppingBagIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={openTagModal}
            className="flex h-10 w-full items-center justify-between px-4 text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              Etiquetas
              {activeConversationTags.length > 0 && (
                <span className="flex items-center gap-1">
                  {activeConversationTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </span>
              )}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/60">
          <ChatWallpaperLayer />
          <div className="sidebar-scroll relative z-10 h-full overflow-y-auto px-3 py-3 md:px-8">
            <div className="flex min-h-full flex-col justify-end gap-3">
              {messages.map((item) => (
                <MessageBubble
                  key={item.id}
                  item={item}
                  onOpenImagePreview={setImagePreview}
                />
              ))}
            </div>
          </div>
        </div>

        <footer className="relative z-20 shrink-0 bg-muted/60 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:px-3 md:pb-3">
          <ChatWallpaperLayer />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelection}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="relative z-10 md:hidden">
            {isMobileRecording ? (
              <div className="flex min-h-12 items-center gap-2 rounded-[24px] bg-background/95 px-3 py-2 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleStopMobileAudioRecording("cancel")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors active:bg-red-500/10"
                  aria-label="Cancelar grabación"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-muted/60 px-3 py-2">
                  <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-500" />
                  <span className="w-11 shrink-0 text-sm font-semibold tabular-nums text-red-500">
                    {formatAudioDuration(mobileRecordingSeconds)}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                    {AUDIO_WAVEFORM_BARS.map((height, index) => (
                      <span
                        key={`mobile-rec-${height}-${index}`}
                        className="mobile-recording-wave w-1 shrink-0 rounded-full bg-muted-foreground/60"
                        style={{ height: Math.max(6, height - 6) }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleStopMobileAudioRecording("preview")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-500 transition-colors active:bg-red-500/10"
                  aria-label="Detener grabacion"
                >
                  <PauseIcon className="h-5 w-5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStopMobileAudioRecording("send")}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors active:bg-emerald-600"
                  aria-label="Enviar audio"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            ) : mobileAudioPreview ? (
              <div className="flex min-h-12 items-center gap-2 rounded-[24px] bg-background/95 px-3 py-2 shadow-sm">
                <audio
                  ref={mobileAudioPreviewRef}
                  src={mobileAudioPreview.audioUrl}
                  onEnded={() => {
                    setIsMobileAudioPreviewPlaying(false);
                    setMobileAudioProgress(0);
                  }}
                  onPause={() => setIsMobileAudioPreviewPlaying(false)}
                  onPlay={() => setIsMobileAudioPreviewPlaying(true)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleDeleteMobileAudioPreview}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted"
                  aria-label="Eliminar audio"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleMobileAudioPreview}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors active:bg-emerald-600"
                  aria-label={
                    isMobileAudioPreviewPlaying ? "Pausar audio" : "Reproducir audio"
                  }
                >
                  {isMobileAudioPreviewPlaying ? (
                    <PauseIcon className="h-5 w-5 fill-current" />
                  ) : (
                    <PlayIcon className="h-5 w-5 fill-current" />
                  )}
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-muted/60 px-3 py-2">
                  <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                    {AUDIO_WAVEFORM_BARS.map((height, index) => {
                      const barPosition = (index / AUDIO_WAVEFORM_BARS.length) * 100;
                      const isPlayed = barPosition <= mobileAudioProgress;
                      return (
                        <span
                          key={`mobile-preview-${height}-${index}`}
                          className={`w-1 shrink-0 rounded-full transition-colors ${
                            isMobileAudioPreviewPlaying
                              ? "mobile-recording-wave"
                              : ""
                          }`}
                          style={{
                            height: Math.max(6, height - 6),
                            backgroundColor: isPlayed
                              ? "rgb(34, 197, 94)"
                              : "rgb(156, 163, 175)",
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                    {formatAudioDuration(mobileAudioPreview.duration)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSendMobileAudioPreview}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors active:bg-emerald-600"
                  aria-label="Enviar audio"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <form className="flex items-end gap-2" onSubmit={handleComposerSubmit}>
                <div className="flex min-h-12 flex-1 items-end gap-2 rounded-[24px] bg-background/95 px-3 py-1 shadow-sm transition-[border-radius,height]">
                  <div className="relative">
                    <button
                      ref={mobileEmojiButtonRef}
                      type="button"
                      onTouchStart={handleMobileEmojiTouchStart}
                      onMouseDown={handleMobileEmojiMouseDown}
                      onClick={handleMobileEmojiClick}
                      data-testid="mobile-emoji-button"
                       className="mb-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Abrir selector de emojis"
                      aria-expanded={emojiPickerOpen}
                    >
                      {emojiPickerOpen ? (
                        <Keyboard className="h-5 w-5" />
                      ) : (
                        <FaceSmileIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <textarea
                    ref={mobileInputRef}
                    inputMode="text"
                    autoComplete="off"
                    rows={1}
                    value={messageDraft}
                    onChange={handleDraftChange}
                    onInput={handleDraftInput}
                    onFocus={handleMobileInputFocus}
                    onKeyDown={handleMessageKeyDown}
                    placeholder="Mensaje"
                    data-testid="mobile-message-input"
                    className="sidebar-scroll max-h-[136px] min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent py-2 text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={handleAttachFileClick}
                    className="mb-1 flex h-8 w-8 items-center justify-center text-muted-foreground"
                    aria-label="Adjuntar archivo"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="mb-1 flex h-8 w-8 items-center justify-center text-muted-foreground"
                    aria-label="Agregar documento"
                  >
                    <CameraIcon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleMobileSendClick}
                  data-testid="mobile-send-button"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600"
                  aria-label={messageDraft.trim() ? "Enviar mensaje" : "Grabar audio"}
                >
                  {messageDraft.trim() ? (
                    <PaperAirplaneIcon className="h-5 w-5" />
                  ) : (
                    <MicrophoneIcon className="h-6 w-6" />
                  )}
                </button>
              </form>
            )}
            {emojiPickerOpen && !mobileAudioPreview && !isMobileRecording && (
              <MobileEmojiPanel
                activeCategory={activeMobileEmojiCategory}
                onBackspace={handleMobileEmojiBackspace}
                onCategoryChange={setActiveMobileEmojiCategory}
                onEmojiSelect={handleMobileEmojiSelect}
                panelRef={mobileEmojiPanelRef}
              />
            )}
          </div>

          {desktopRecorderError && (
            <div className="relative z-10 hidden pb-2 text-xs font-medium text-red-500 md:block">
              {desktopRecorderError}
            </div>
          )}

          <form
            className="relative z-10 hidden min-h-14 items-end gap-3 rounded-[28px] bg-background px-4 py-2 shadow-sm md:flex md:border md:border-border/70 md:bg-background/95 md:shadow-[0_1px_2px_rgba(11,20,26,0.12)] xl:gap-4 xl:px-5"
            onSubmit={handleComposerSubmit}
          >
            {isDesktopRecording ? (
              <>
                <button
                  type="button"
                  onClick={() => handleStopDesktopAudioRecording("cancel")}
                  className="mb-1 flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-500/10"
                  aria-label="Cancelar grabacion"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <div
                  data-testid="desktop-recording-composer"
                  className="desktop-recording-strip mb-1 flex min-h-10 flex-1 items-center gap-3 rounded-full bg-muted/70 px-4"
                >
                  <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-500" />
                  <span className="hidden text-sm font-semibold text-red-500 lg:inline">
                    Grabando
                  </span>
                  <span className="w-12 text-sm font-semibold tabular-nums text-red-500">
                    {formatAudioDuration(desktopRecordingSeconds)}
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                    {AUDIO_WAVEFORM_BARS.map((height, index) => (
                      <span
                        key={`recording-${height}-${index}`}
                        className="desktop-recording-wave w-1 shrink-0 rounded-full bg-muted-foreground/70"
                        style={{ height: Math.max(8, height - 4) }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleStopDesktopAudioRecording("preview")}
                  className="mb-1 flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-500/10"
                  aria-label="Detener grabacion"
                >
                  <PauseIcon className="h-5 w-5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStopDesktopAudioRecording("send")}
                  className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600"
                  aria-label="Enviar audio"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </>
            ) : desktopAudioPreview ? (
              <>
                <button
                  type="button"
                  onClick={handleDeleteDesktopAudioPreview}
                  className="mb-1 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
                  aria-label="Eliminar audio"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleToggleDesktopAudioPreview}
                  className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600"
                  aria-label={
                    isDesktopAudioPreviewPlaying
                      ? "Pausar audio"
                      : "Reproducir audio"
                  }
                >
                  {isDesktopAudioPreviewPlaying ? (
                    <PauseIcon className="h-5 w-5 fill-current" />
                  ) : (
                    <PlayIcon className="h-5 w-5 fill-current" />
                  )}
                </button>
                <div
                  data-testid="desktop-audio-preview-composer"
                  className="desktop-preview-strip mb-1 flex min-h-10 flex-1 items-center gap-3 rounded-full bg-muted/70 px-4"
                >
                  <audio
                    ref={desktopAudioPreviewRef}
                    src={desktopAudioPreview.audioUrl}
                    onEnded={() => setIsDesktopAudioPreviewPlaying(false)}
                    onPause={() => setIsDesktopAudioPreviewPlaying(false)}
                    onPlay={() => setIsDesktopAudioPreviewPlaying(true)}
                    className="hidden"
                  />
                  <span className="hidden text-sm font-semibold text-foreground lg:inline">
                    Vista previa
                  </span>
                  <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                    {AUDIO_WAVEFORM_BARS.map((height, index) => {
                      const barPosition =
                        (index / (AUDIO_WAVEFORM_BARS.length - 1)) * 100;
                      const isPlayed = barPosition <= desktopAudioProgress;

                      return (
                        <span
                          key={`preview-${height}-${index}`}
                          className={`desktop-preview-wave w-1 shrink-0 rounded-full ${
                            isDesktopAudioPreviewPlaying
                              ? "desktop-preview-wave-playing"
                              : ""
                          }`}
                          style={{
                            height: Math.max(6, height - 8),
                            backgroundColor: isPlayed
                              ? "var(--desktop-preview-wave-played)"
                              : "var(--desktop-preview-wave-idle)",
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {formatAudioDuration(desktopAudioPreview.duration)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleStartDesktopAudioRecording()}
                  className="mb-1 flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-500/10"
                  aria-label="Grabar de nuevo"
                >
                  <MicrophoneIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleSendDesktopAudioPreview}
                  className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600"
                  aria-label="Enviar audio"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAttachFileClick}
                  className="mb-1 flex h-9 w-7 items-center justify-center text-foreground"
                  aria-label="Adjuntar archivo"
                >
                  <PaperClipIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={handleAttachFileClick}
                  className="mb-1 flex h-9 w-7 items-center justify-center text-foreground"
                  aria-label="Agregar documento"
                >
                  <DocumentPlusIcon className="h-5 w-5" />
                </button>
                <div className="relative">
                  <button
                    ref={desktopEmojiButtonRef}
                    type="button"
                    onClick={handleEmojiToggle}
                    className="mb-1 flex h-9 w-7 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Abrir selector de emojis"
                    aria-expanded={emojiPickerOpen}
                  >
                    <FaceSmileIcon className="h-5 w-5" />
                  </button>
                  {emojiPickerOpen && (
                    <div
                      ref={desktopEmojiPanelRef}
                      className="absolute bottom-full left-0 z-50 mb-4 w-[352px] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
                    >
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width="100%"
                        height={390}
                        theme={emojiPickerTheme}
                        emojiStyle={EmojiStyle.NATIVE}
                        lazyLoadEmojis
                        searchPlaceholder="Buscar emoji"
                        previewConfig={{ showPreview: false }}
                        suggestedEmojisMode={SuggestionMode.RECENT}
                        className="!border-0"
                      />
                    </div>
                  )}
                </div>
                <textarea
                  ref={desktopInputRef}
                  autoComplete="off"
                  rows={1}
                  value={messageDraft}
                  onChange={handleDraftChange}
                  onInput={handleDraftInput}
                  onKeyDown={handleMessageKeyDown}
                  placeholder="Escribe un mensaje"
                  className="sidebar-scroll max-h-[136px] min-h-10 min-w-0 flex-1 resize-none border-0 bg-transparent py-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={handleDesktopComposerAction}
                  data-testid="desktop-composer-action"
                  className="mb-1 flex h-9 w-7 items-center justify-center text-foreground"
                  aria-label={messageDraft.trim() ? "Enviar mensaje" : "Grabar audio"}
                >
                  {messageDraft.trim() ? (
                    <PaperAirplaneIcon className="h-5 w-5 text-foreground" />
                  ) : (
                    <MicrophoneIcon className="h-5 w-5" />
                  )}
                </button>
              </>
            )}
          </form>
        </footer>
        {activeAttachment && (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#f7f5f2] text-slate-900 dark:bg-[#111b21] dark:text-white">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/80 px-4 dark:border-white/10">
            <button
              type="button"
              onClick={closeAttachmentPreview}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-black/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Cerrar vista previa"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-semibold">{activeAttachment.name}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {pendingAttachments.length} archivo
                {pendingAttachments.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="h-10 w-10" />
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-4">
            {activeAttachment.type.startsWith("image/") ? (
              <div
                role="img"
                aria-label={activeAttachment.name}
                className="h-full max-h-[72vh] w-full max-w-4xl rounded-lg bg-contain bg-center bg-no-repeat shadow-2xl"
                style={{ backgroundImage: `url("${activeAttachment.objectUrl}")` }}
              />
            ) : isVideoFile(activeAttachment.type, activeAttachment.name) ? (
              <video
                src={activeAttachment.objectUrl}
                controls
                playsInline
                preload="metadata"
                className="max-h-[72vh] w-full max-w-4xl rounded-lg bg-black shadow-2xl"
              />
            ) : isPdfAttachment(activeAttachment) ? (
              <PdfFirstPagePreview
                attachment={activeAttachment}
                className="flex h-full w-full items-center justify-center"
                maxHeight={620}
                maxWidth={480}
                onPageCount={(pageCount) =>
                  setPdfPageCounts((current) => ({
                    ...current,
                    [activeAttachment.id]: pageCount,
                  }))
                }
              />
            ) : (
              <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-lg bg-white p-8 text-center text-slate-900 shadow-2xl">
                <DocumentIcon className="mb-4 h-16 w-16 text-emerald-600" />
                <p className="break-words text-sm font-semibold">
                  {activeAttachment.name}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {formatFileSize(activeAttachment.size)}
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200/80 bg-[#f7f5f2] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 dark:border-white/10 dark:bg-[#111b21]">
            <div className="mx-auto mb-4 flex max-w-2xl items-center gap-2 rounded-lg bg-white px-4 py-2 text-slate-900 shadow-sm dark:bg-[#2a3942] dark:text-slate-100 dark:shadow-none">
              <input
                value={attachmentCaption}
                onChange={(event) => setAttachmentCaption(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSendPendingAttachments();
                  }
                }}
                placeholder="Escribe un mensaje"
                className="h-9 min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400"
              />
              <FaceSmileIcon className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-300" />
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="sidebar-scroll flex max-w-[70vw] items-center gap-2 overflow-x-auto px-1 pb-1">
                {pendingAttachments.map((attachment) => {
                  const selected = attachment.id === activeAttachment.id;

                  return (
                    <button
                      key={attachment.id}
                      type="button"
                      onClick={() => setActiveAttachmentId(attachment.id)}
                      className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 bg-white text-slate-900 ${
                        selected ? "border-emerald-500" : "border-transparent"
                      }`}
                      aria-label={`Ver ${attachment.name}`}
                    >
                      {attachment.type.startsWith("image/") ? (
                        <span
                          className="h-full w-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${attachment.objectUrl}")`,
                          }}
                        />
                      ) : isVideoFile(attachment.type, attachment.name) ? (
                        <video
                          src={attachment.objectUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : isPdfAttachment(attachment) ? (
                        <PdfFirstPagePreview
                          attachment={attachment}
                          className="flex h-full w-full items-center justify-center overflow-hidden"
                          maxHeight={60}
                          maxWidth={48}
                          onPageCount={(pageCount) =>
                            setPdfPageCounts((current) => ({
                              ...current,
                              [attachment.id]: pageCount,
                            }))
                          }
                        />
                      ) : (
                        <DocumentIcon className="h-7 w-7 text-emerald-600" />
                      )}
                      <span className="absolute bottom-0 left-0 right-0 truncate bg-black/55 px-1 py-0.5 text-[9px] text-white">
                        {attachment.name}
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          removePendingAttachment(attachment.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            removePendingAttachment(attachment.id);
                          }
                        }}
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                        aria-label={`Quitar ${attachment.name}`}
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleAttachFileClick}
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition-colors hover:bg-black/5 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
                  aria-label="Agregar otro archivo"
                >
                  <PlusIcon className="h-7 w-7" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleSendPendingAttachments}
                className="ml-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-colors hover:bg-emerald-600 dark:text-[#111b21] dark:hover:bg-emerald-400"
                aria-label="Enviar archivos"
              >
                <PaperAirplaneIcon className="h-7 w-7 fill-current" />
              </button>
            </div>
          </div>
        </div>
        )}
        {imagePreview && (
          <div className="fixed inset-0 z-[80] flex flex-col bg-[#f7f5f2] text-slate-900 dark:bg-black dark:text-white">
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/80 px-4 dark:border-white/10">
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-black/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Cerrar imagen"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold">
                {imagePreview.alt}
              </p>
              <a
                href={imagePreview.url}
                download={imagePreview.alt}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-black/5 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={`Descargar ${imagePreview.alt}`}
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </a>
            </header>
            <div
              role="img"
              aria-label={imagePreview.alt}
              className="min-h-0 flex-1 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url("${imagePreview.url}")` }}
            />
          </div>
        )}
        {isDraggingFiles && !activeAttachment && !imagePreview && (
          <div className="pointer-events-none absolute inset-0 z-[45] flex items-center justify-center bg-emerald-500/10 p-6 backdrop-blur-[2px]">
            <div className="rounded-2xl border-2 border-dashed border-emerald-500 bg-white/95 px-8 py-6 text-center text-slate-900 shadow-2xl dark:bg-slate-950/95 dark:text-white">
              <DocumentPlusIcon className="mx-auto h-12 w-12 text-emerald-500" />
              <p className="mt-3 text-base font-semibold">Suelta tus archivos aqui</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Se abriran en la vista previa antes de enviar
              </p>
            </div>
          </div>
        )}
          </>
        )}
      </div>
      {isSidebarOpen && activeConversationId && (
        <div className="hidden w-[340px] shrink-0 md:block">
          <ChatSidebar
            clientPhone={activeConversationId}
            onClose={() => setIsSidebarOpen(false)}
            onSendToChat={(text) => {
              allMessagesRef.current = { ...allMessagesRef.current, [activeConversationId]: messages };
              const newMsg: ChatMessage = {
                id: `system-${getTimestamp()}`,
                type: "outgoing",
                text,
                time: new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
              };
              setMessages((current) => [...current, newMsg]);
              moveFromWaiting(activeConversationId);
            }}
          />
        </div>
      )}

    {/* Mobile sidebar overlay - fullscreen */}
    {isSidebarOpen && activeConversationId && (
      <div className="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2.5">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver al chat
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <ChatSidebar
            clientPhone={activeConversationId}
            onClose={() => setIsSidebarOpen(false)}
            onSendToChat={(text) => {
              allMessagesRef.current = { ...allMessagesRef.current, [activeConversationId]: messages };
              const newMsg: ChatMessage = {
                id: `system-${getTimestamp()}`,
                type: "outgoing",
                text,
                time: new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
              };
              setMessages((current) => [...current, newMsg]);
              moveFromWaiting(activeConversationId);
            }}
          />
        </div>
      </div>
    )}
    </section>

    <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar etiqueta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Nombre de la etiqueta
            </label>
            <input
              type="text"
              value={newTagLabel}
              onChange={(e) => setNewTagLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTag(); }}
              placeholder="Ej: Pendiente, Urgente, VIP..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-muted-foreground/30"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNewTagColor(color.value)}
                  className={`h-8 w-8 rounded-full ${color.bg} transition-all ${
                    newTagColor === color.value
                      ? "ring-2 ring-foreground ring-offset-2 scale-110"
                      : "hover:scale-105"
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          {activeConversationTags.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Etiquetas actuales
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeConversationTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.label}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/30 hover:bg-white/50 transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsTagModalOpen(false)}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={addTag}
              size="sm"
              disabled={!newTagLabel.trim()}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
