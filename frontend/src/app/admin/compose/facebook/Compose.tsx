
"use client";

import { useRef, useState } from "react";
import { FaFacebookF } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";


import ImageEditor from "@/components/ImageEditor";
import { private_api_call } from "@/actions/parivate_api_calll";
import { uploadMultipleFiles } from "@/actions/upload_files";
import Image from "next/image";

interface FacebookPageProps {
  name: string;
  url: string;
}

interface ImageType {
  id: string;
  file: File;
  preview: string;
}

interface ComposerCardProps {
  page?: FacebookPageProps;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
}

interface MediaSectionProps {
  images: ImageType[];
  fileRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  removeImage: (id: string) => void;
  setEditingImage: React.Dispatch<
    React.SetStateAction<ImageType | null>
  >;
  
}

const DEFAULT_TAGS = [
  "#Marketing",
  "#SocialMedia",
  "#Business",
  "#Trending",
  "#NewPost",
  "#DigitalMarketing",
  "#Content",
  "#Growth",
  "#Brand",
  "#Community",
  "#Viral",
  "#Engagement",
];

export default function FBPostComposer({
  page,
}: {
  page?: FacebookPageProps;
}) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<ImageType[]>([]);
  const [editingImage, setEditingImage] =
    useState<ImageType | null>(null);
  const [openEditor, setOpenEditor] = useState(false);

  const [selectedTags, setSelectedTags] = useState<
    string[]
  >([]);

  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [postStatus, setPostStatus] = useState<
    "publishing" | "success" | null
  >(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);

    const uploaded = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      edits: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
      },
    }));

    setImages((prev) => [...prev, ...uploaded]);
  };

  const removeImage = (id: string) => {
    setImages((prev) =>
      prev.filter((img) => img.id !== id),
    );
  };

  

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  };

  const fetchAITags = async () => {
    if (!message.trim()) return;

    setAiLoading(true);

    try {
      const res = await fetch("/api/generate-tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: message,
        }),
      });

      const data = await res.json();

      setAiTags(
        Array.isArray(data)
          ? data
          : DEFAULT_TAGS.slice(0, 8),
      );
    } catch {
      setAiTags(DEFAULT_TAGS.slice(0, 8));
    }

    setAiLoading(false);
  };

  const handlePost = async() => {
    let imagesUrl = null;
    if(images.length > 0) {
      const res = await uploadMultipleFiles(
        images.map((img) => img.file),
      );
      console.log(res);
      imagesUrl = res.data;
    }
    //req with message, images,tags to backend
    const payload = {
      pageId: 19,
      message: message,
      tags: selectedTags,
      images: imagesUrl,
      status: "publishable",
    };
    const resPost = await private_api_call({
      path: "facebook/create_post",
      method: "POST",
      body: payload,
    });
    console.log(resPost);

    
    

    setTimeout(() => {
      setPostStatus("success");

      setTimeout(() => {
        setPostStatus(null);
      }, 2000);
    }, 1200);
  };



  const displayTags = aiTags.length
    ? aiTags
    : DEFAULT_TAGS;

  const fullPost =
    message +
    (selectedTags.length
      ? "\n\n" + selectedTags.join(" ")
      : "");

  return (
    <>
      <div className="bg-background min-h-screen">
        <div className="bg-muted p-4 lg:p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <ComposerHeader />

              <ComposerCard
                page={page}
                message={message}
                setMessage={setMessage}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
              />

              <MediaSection
                images={images}
                fileRef={fileRef}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                setEditingImage={(img) => {
                  setEditingImage(img);
                  setOpenEditor(true);
                }}
              />

              <section className="flex gap-4">
                <Button variant="outline" className="flex-1 h-11 rounded-xl">
                  Save Draft
                </Button>

                <Button
                  disabled={!message.trim()}
                  onClick={handlePost}
                  className="flex-[2] h-11 rounded-xl"
                >
                  {postStatus === "publishing"
                    ? "Publishing..."
                    : postStatus === "success"
                      ? "✓ Published"
                      : "Publish"}
                </Button>
              </section>
            </div>

            {/* RIGHT */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-foreground font-semibold">
                      AI Tag Suggestions
                    </h3>

                    <p className="text-muted-foreground text-sm">
                      Generated from your content
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={fetchAITags}
                    disabled={!message.trim() || aiLoading}
                  >
                    {aiLoading ? "..." : "Generate"}
                  </Button>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-2">
                  {displayTags.map((tag) => {
                    const active = selectedTags.includes(tag);

                    return (
                      <Button
                        key={tag}
                        size="sm"
                        variant={active ? "default" : "outline"}
                        className="rounded-full"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Button>
                    );
                  })}
                </div>
              </section>

              <section className="bg-card border border-border rounded-2xl p-5">
                <div className="mb-4">
                  <h3 className="text-foreground font-semibold">
                    Live Preview
                  </h3>

                  <p className="text-muted-foreground text-sm">Just now</p>
                </div>

                <div className="text-foreground whitespace-pre-wrap">
                  {fullPost || (
                    <span className="text-muted-foreground">
                      Your preview will appear here...
                    </span>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {images.slice(0, 4).map((img) => (
                      <Image
                        key={img.id}
                        src={img.preview}
                        alt=""
                        height={128}
                        width={128}
                        className="rounded-xl h-32 w-full object-cover border border-border"
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-muted-foreground text-sm mb-4">
                  Post Summary
                </h3>

                <div className="space-y-4">
                  <SummaryRow label="Characters" value={message.length} />

                  <SummaryRow label="Images" value={images.length} />

                  <SummaryRow label="Tags" value={selectedTags.length} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <ImageEditor
        open={openEditor}
        onOpenChange={setOpenEditor}
        image={editingImage?.file ?? null}
        onSave={(editedFile) => {
          if (!editingImage) return;

          const preview = URL.createObjectURL(editedFile);

          setImages((prev) =>
            prev.map((img) =>
              img.id === editingImage.id
                ? {
                    ...img,
                    file: editedFile,
                    preview,
                  }
                : img,
            ),
          );

          setOpenEditor(false);
          setEditingImage(null);
        }}
      />
    </>
  );
}

function ComposerHeader() {
  return (
    <header className="flex items-center gap-3">
      <div className="bg-card border border-border h-11 w-11 rounded-xl flex items-center justify-center">
        <FaFacebookF className="size-5 text-blue-600" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Post Composer
        </h1>

        <p className="text-sm text-muted-foreground">
          Create · Schedule · Publish
        </p>
      </div>
    </header>
  );
}

function ComposerCard({
  page,
  message,
  setMessage,
  selectedTags,
  toggleTag,
}: ComposerCardProps) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-primary-foreground h-12 w-12 rounded-xl flex items-center justify-center font-bold">
          F
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">
            {page?.name || "Your Facebook Page"}
          </h2>

          <p className="text-sm text-muted-foreground">
            {page?.url ||
              "facebook.com/yourpage"}
          </p>
        </div>

        <Badge variant="secondary">
          Public
        </Badge>
      </div>

      <Textarea
        placeholder="What's on your mind?"
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        className="min-h-[140px] resize-none rounded-xl"
      />

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Add tags to boost reach
        </span>

        <span className="text-muted-foreground">
          {message.length} chars
        </span>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant="secondary"
              className="rounded-full"
              onClick={() =>
                toggleTag(tag)
              }
            >
              {tag}
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}

function MediaSection({
  images,
  fileRef,
  handleImageUpload,
  removeImage,
  setEditingImage,
  getFilter,
}: MediaSectionProps) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">
          Media
        </h3>

        <span className="text-sm text-muted-foreground">
          {images.length}/10
        </span>
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="
          w-full
          border-2
          border-dashed
          border-border
          rounded-2xl
          py-10
          bg-background
          hover:bg-accent
          transition
        "
      >
        <p className="text-muted-foreground">
          ⊕ Add photos & videos
        </p>
      </button>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-2xl border border-border"
            >
              <Image
                key={img.id}
                src={img.preview}
                alt=""
                height={100}
                width={100}
                className="h-full w-full object-cover"
                
              />

              <div className="absolute bottom-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    setEditingImage(img)
                  }
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    removeImage(img.id)
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}



