"use client";

import { useEffect, useRef, useState } from "react";
import { FaFacebookF } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import ImageEditor from "@/components/ImageEditor";
import { private_api_call } from "@/actions/parivate_api_calll";
import { uploadMultipleFiles } from "@/actions/upload_files";
import Image from "next/image";
import { DateTimePicker } from "@/components/app_inputs/DateTimePicker";
import { Switch } from "@/components/ui/switch";
import { DefaultSelect } from "@/components/app_inputs/DefaultSelect";
import { Asset } from "../../platform/facebook_pages/action";
import { toast } from "sonner";
import { CalendarClock, FileText, Loader2, Send } from "lucide-react";
import { ai_api_call } from "@/actions/ai_api_call";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import TextInput from "@/components/app_inputs/text_input";
import AstroidIcon from "@/components/icons/ai";
import { useRouter } from "next/navigation";



interface FacebookPageProps {
  pages: Asset[] | null;
  initialPost?: ExistingPost ;
}

interface ImageType {
  id: string;
  file: File;
  preview: string;
  isExisting?: boolean;
  isEdited?: boolean;
  public_id?: string;
}

interface ComposerCardProps {
  page?: Asset | null;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
}

interface MediaSectionProps {
  images: ImageType[];
  fileRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (id: string) => void;
  setEditingImage: (img: ImageType) => void;
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
interface ExistingPost {
  id: string;
  message: string;
  tags: string[];
  images: { url: string; public_id: string }[]; 
  status: "draft" | "publishable" | "scheduled";
  scheduledAt?: string;
}
const   urlToFile= async(url: string)=>{
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }

  const blob = await response.blob();

  return new File(
    [blob],
    `image.${blob.type.split("/")[1] || "jpg"}`,
    {
      type: blob.type,
    }
  );
}

export default function FBPostComposer({ pages, initialPost }: FacebookPageProps) {
  const [message, setMessage] = useState(initialPost?.message || "");
  const [images, setImages] = useState<ImageType[]>([]);
  const [editingImage, setEditingImage] = useState<ImageType | null>(null);
  const [openEditor, setOpenEditor] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [assets, setAssets] = useState<Asset[] | null>(pages);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialPost?.tags || []);

  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [savingPost, setSavingPost] = useState<
    "scheduling" | "publishing" | "drafting" | null
    >(null);
  
    const handleImageEdit = async (img: ImageType) => {
      let image = img;
      if (image.isExisting) {
        const file = await urlToFile(image.preview);
        image = { ...image, file, isExisting: false };
      }
      setEditingImage(image);
      setOpenEditor(true);
    };


    

  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const uploaded = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
      isEdited: false,
    }));

    setImages((prev) => [...prev, ...uploaded]);
  };
  useEffect(() => {
    setAssets(pages);
  }, [pages]);

  //const
  useEffect(() => {
    if (!initialPost) return;

    setMessage(initialPost.message);
    setSelectedTags(initialPost.tags || []);
    if(initialPost.scheduledAt) {
      setScheduledAt(new Date(initialPost.scheduledAt));
      setIsScheduled(true);
    }

    setImages(
      initialPost.images.map((img) => ({
        id: crypto.randomUUID(),
        file: new File([], img.url),
        preview: img.url,
        isExisting: true,
        isEdited: false,
        public_id: img.public_id,
      })),
    );
  }, [initialPost]);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const fetchAITags = async () => {
    if (!message.trim()) return;

    setAiLoading(true);
    console.log("Fetching AI tags for message:", message);

    try {
      const res = await ai_api_call({
        path: "generate/hashtags",
        method: "POST",
        body: {
          description: message,
          platform: "facebook",
          count: 10,
          tone: "trendy",
        },
      });
      console.log(res);

      if (res.success) {
        setAiTags(res.data.hashtags);
        toast.success(res.message);
      } else {
        toast.error(res.message);
        setAiTags(DEFAULT_TAGS.slice(0, 8));
      }
    } catch {
      setAiTags(DEFAULT_TAGS.slice(0, 8));
    }

    setAiLoading(false);
  };
  const router= useRouter();
  const handlePost = async (
    status: "publishable" | "scheduled" | "draft" = "publishable",
  ) => {
    if (status == "scheduled") {
      setSavingPost("scheduling");
    } else if (status == "publishable") {
      setSavingPost("publishing");
    } else {
      setSavingPost("drafting");
    }
    try {
      const existingImages = images
        .filter((img) => img.isExisting)
        .map((img) => ({ url: img.preview, public_id: img.public_id }));

      const newFiles = images.filter((img) => !img.isExisting).map((img) => img.file);

      let uploadedImages: { url: string; public_id: string }[] = [];

      if (newFiles.length) {
        const res = await uploadMultipleFiles(newFiles);
        uploadedImages = res.data;
        console.log("Uploaded new images:", uploadedImages);
      }
     

      const imagesUrl = [...existingImages, ...uploadedImages];
      console.log("Final image URLs for the post:", imagesUrl);
      //req with message, images,tags to backend
      const payload = {
        pageId: selectedAsset?.id || assets?.[0]?.id || null,
        message: message,
        tags: selectedTags,
        images: imagesUrl,
        status: status,
        scheduled_at:
          status === "scheduled" && scheduledAt
            ? scheduledAt.toISOString()
            : null,
      };
  
      const resPost = await private_api_call({
        path: initialPost
          ? `facebook/edit_post/${initialPost.id}`
          : "facebook/create_post",
        method: initialPost ? "PUT" : "POST",
        body: payload,
      });
      if (resPost.success) {
        toast.success("Post saved successfully!");
        setMessage("");
        setSelectedTags([]);
        setImages([]);
        setScheduledAt(null);
        setIsScheduled(false);
        if (initialPost) {
          router.back();
        }
      } else {
        toast.error(resPost.message);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An error occurred while creating the post.");
    } finally {
      setSavingPost(null);
    }
  };

  const displayTags = aiTags.length ? aiTags : DEFAULT_TAGS;

  const fullPost =
    message + (selectedTags.length ? "\n\n" + selectedTags.join(" ") : "");
  console.log(scheduledAt, isScheduled);


  return (
    <>
      <div className="bg-background h-full  ">
        <div className="grid grid-cols-12 p-4 gap-6  h-full">
          {/* LEFT */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <ComposerHeader
              assets={assets}
              selectedAsset={selectedAsset}
              onSelectAsset={setSelectedAsset}
            />

            <ComposerCard
              page={selectedAsset || assets?.[0] || null}
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
              setEditingImage={handleImageEdit}
            />
            <SchedulingSection
              isScheduled={isScheduled}
              setIsScheduled={setIsScheduled}
              scheduledAt={scheduledAt}
              setScheduledAt={setScheduledAt}
            />

            <section className="flex gap-4">
              <Button
                disabled={!message.trim() || savingPost === "drafting"}
                onClick={() => handlePost("draft")}
                variant="outline"
                className="flex-1 h-11 rounded-xl"
              >
                {savingPost === "drafting" ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-1" />
                )}

                {savingPost === "drafting" ? "Saving..." : "Save Draft"}
              </Button>

              {isScheduled ? (
                <Button
                  disabled={
                    !message.trim() ||
                    !scheduledAt ||
                    savingPost === "scheduling"
                  }
                  onClick={() => handlePost("scheduled")}
                  className="flex-2 h-11 rounded-xl"
                >
                  {savingPost === "scheduling" ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CalendarClock className="h-4 w-4 mr-1" />
                  )}

                  {savingPost === "scheduling"
                    ? "Scheduling..."
                    : "Schedule Post"}
                </Button>
              ) : (
                <Button
                  disabled={!message.trim() || savingPost === "publishing"}
                  onClick={() => handlePost("publishable")}
                  className="flex-2 h-11 rounded-xl"
                >
                  {savingPost === "publishing" ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-1" />
                  )}

                  {savingPost === "publishing" ? "Publishing..." : "Publish"}
                </Button>
              )}
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
                <h3 className="text-foreground font-semibold">Live Preview</h3>

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
                    isEdited: true,
                    preview,
                    isExisting: false,
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

function ComposerHeader({
  assets,
  selectedAsset,
  onSelectAsset,
}: {
  assets: Asset[] | null;
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
}) {
  return (
    <header className="flex justify-between items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="bg-card border border-border h-11 w-11 rounded-xl flex items-center justify-center">
          <FaFacebookF className="size-5 text-blue-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Post Composer</h1>

          <p className="text-sm text-muted-foreground">
            Create · Schedule · Publish
          </p>
        </div>
      </div>
      <div>
        <DefaultSelect
          options={
            assets?.map((asset) => ({
              label: asset.name,
              value: asset.asset_id,
            })) || []
          }
          value={selectedAsset?.asset_id || assets?.[0]?.asset_id || ""}
          onValueChange={(v) => {
            const selected = assets?.find((a) => a.asset_id === v);
            if (selected) {
              onSelectAsset(selected);
            }
          }}
        />
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
  const [open, setOpen] = useState(false);
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
            {page?.name || "facebook.com/yourpage"}
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          Generate Post
        </Button>
      </div>

      <Textarea
        placeholder="What's on your mind?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="min-h-35 resize-none rounded-xl"
      />

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Add tags to boost reach</span>

        <span className="text-muted-foreground">{message.length} chars</span>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant="secondary"
              className="rounded-full"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}
      <FacebookPostPromptDialog open={open} setOpen={setOpen} setMessage={setMessage} />
    </section>
  );
}

function MediaSection({
  images,
  fileRef,
  handleImageUpload,
  removeImage,
  setEditingImage,
}: MediaSectionProps) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Media</h3>

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
        <p className="text-muted-foreground">⊕ Add photos & videos</p>
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
                <Button size="sm" onClick={() => setEditingImage(img)}>
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(img.id)}
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

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>

      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

interface SchedulingSectionProps {
  isScheduled: boolean;
  setIsScheduled: (v: boolean) => void;
  scheduledAt: Date | null;
  setScheduledAt: (v: Date | null) => void;
}

export function SchedulingSection({
  isScheduled,
  setIsScheduled,
  scheduledAt,
  setScheduledAt,
}: SchedulingSectionProps) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Scheduling</h2>
          <p className="text-sm text-muted-foreground">
            Control when your post goes live
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isScheduled ? "default" : "secondary"}>
            {isScheduled ? "Enabled" : "Disabled"}
          </Badge>

          <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
        </div>
      </div>

      {/* Date Time Picker */}
      {isScheduled && (
        <div className="space-y-3">
          <DateTimePicker
            value={scheduledAt ? new Date(scheduledAt) : null}
            onChange={setScheduledAt}
          />

          {scheduledAt && (
            <div className="text-xs text-muted-foreground">
              Scheduled for:{" "}
              <span className="font-medium text-foreground">
                {scheduledAt.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer hint */}
      <div className="text-xs text-muted-foreground">
        Posts will be published automatically at the selected time.
      </div>
    </section>
  );
}



export  function FacebookPostPromptDialog({ open, setOpen ,setMessage}: { open: boolean; setOpen: (v: boolean) => void; setMessage: (v: string) => void }) {
  

  const [form, setForm] = useState({
    topic: "",
    description: "",
    brand_name: "",
    tone: "engaging",
    include_cta: true,
    target_audience: "",
  });
  const [loading, setLoading] = useState(false);



  const handleToggle = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      include_cta: checked,
    }));
  };

  const handleSubmit = async() => {
    console.log("Payload:", form);
    setLoading(true);
    const res = await ai_api_call(
      {
        path: "generate/post",
        method: "POST",
        body:form
      }
    )
    if (res.success) {
      setMessage(res.data.post_text);
      setForm({
        topic: "",
        description: "",
        brand_name: "",
        tone: "engaging",
        include_cta: true,
        target_audience: "",
      });
      toast.success(res.message);
      setOpen(false);
    } else {
      toast.error("Failed to generate Facebook post.");
    }
    setLoading(false);
  
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>


      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Facebook Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <TextInput
            type="text"
            id="topic"
            label="Topic"
            value={form.topic}
            onChange={(value) => setForm((prev) => ({ ...prev, topic: value }))}
            placeholder="Describe your topic..."
          />

          <TextInput
            type="text"
            id="description"
            label="Description"
            textArea={true}
            value={form.description}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, description: value }))
            }
            placeholder="Describe your idea..."
          />

          <TextInput
            type="text"
            id="brand-name"
            label="Brand Name"
            value={form.brand_name}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, brand_name: value }))
            }
            placeholder="Your brand name"
          />

          <TextInput
            type="text"
            id="target-audience"
            label="Target Audience"
            textArea={true}
            value={form.target_audience}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, target_audience: value }))
            }
            placeholder="e.g. students, entrepreneurs"
          />

          {/* Tone */}
          <TextInput
            type="text"
            id="tone"
            label="Tone"
            textArea={true}
            value={form.tone}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, tone: value }))
            }
            placeholder="Describe your tone..."
          />

          {/* CTA Toggle */}
          <div className="flex items-center justify-between">
            <Label>Include CTA</Label>
            <Switch checked={form.include_cta} onCheckedChange={handleToggle} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={handleSubmit} >
              {loading ? <Loader2 className="animate-spin size-4" /> : <AstroidIcon />} Generate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}