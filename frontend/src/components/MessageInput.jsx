import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, FileText, Video, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const isAllowedMime = (mime) => {
  const allowed = [
    // images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    // videos
    "video/mp4",
    "video/quicktime", // mov
    "video/webm",
    // docs
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  return allowed.includes(mime);
};

const MessageInput = ({ receiverId }) => {
  const [text, setText] = useState("");
  // file is the actual File object to upload
  const [file, setFile] = useState(null);
  // preview: for images/videos use URL.createObjectURL(file), for docs store name
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!isAllowedMime(f.type)) {
      toast.error("Unsupported file type.");
      e.target.value = "";
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      toast.error("File too large. Max 50 MB allowed.");
      e.target.value = "";
      return;
    }

    setFile(f);

    if (f.type.startsWith("image/") || f.type.startsWith("video/")) {
      // URL.createObjectURL is efficient for preview
      const url = URL.createObjectURL(f);
      setPreview({ type: f.type.startsWith("image/") ? "image" : "video", url, name: f.name });
    } else {
      // document preview: show filename & icon
      setPreview({ type: "doc", name: f.name });
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;

    try {
      // Build FormData
      const fd = new FormData();
      if (text.trim()) fd.append("text", text.trim());
      if (file) fd.append("file", file); // backend expects 'file'
      // call sendMessage from store which should POST FormData
      await sendMessage({ formData: fd, receiverId });

      // Clear form UI
      setText("");
      removeFile();
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error(err?.response?.data?.error || "Failed to send message");
    }
  };

  return (
    <div className="p-4 w-full">
      {preview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {preview.type === "image" && (
              <img
                src={preview.url}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-zinc-700"
              />
            )}
            {preview.type === "video" && (
              <video
                src={preview.url}
                controls
                className="w-32 h-32 object-cover rounded-lg border border-zinc-700"
              />
            )}
            {preview.type === "doc" && (
              <div className="w-32 h-16 flex items-center justify-center rounded-lg border border-zinc-700 bg-base-200 p-2">
                <FileText className="mr-2" />
                <span className="text-sm truncate">{preview.name}</span>
              </div>
            )}
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 items-center">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${file ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button type="submit" className="btn btn-sm btn-circle" disabled={!text.trim() && !file}>
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
