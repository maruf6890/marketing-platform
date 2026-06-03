"use client";

import { FONT_FAMILIES } from "@/lib/const";
import { Canvas, FabricImage, IText } from "fabric";
import { useEffect, useRef, useState } from "react";
import { DefaultSelect } from "./app_inputs/DefaultSelect";
import { Button } from "./ui/button";
import {
  Image as ImageIcon,
  Text as TextIcon,
  Plus,
  Trash2,
  ArrowDown,
  ArrowUp,
  FolderOpen,
  Download,
  Save,
} from "lucide-react";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Slider } from "./ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export default function ImageEditor({
  open,
  image,
  onSave,
  onOpenChange,
}: {
  open: boolean;
  image: File | null;
  onSave: (editedFile: File) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [canvasKey, setCanvasKey] = useState(0);
  const canvasRef = useRef<Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const baseLoaded = useRef(false);

  const [canvasSize, setCanvasSize] = useState({ height: 0, width: 0 });
  const [ready, setReady] = useState(false);
  const [layers, setLayers] = useState<
    {
      id: string;
      type: string;
      name: string;
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj: any;
    }[]
  >([]);
  const [selectedObj, setSelectedObj] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"layers" | "text" | "images">(
    "layers",
  );
  
  // text state
  const [txtContent, setTxtContent] = useState("আমার বাংলা");
  const [txtFont, setTxtFont] = useState(FONT_FAMILIES[3].value as string);
  const [txtSize, setTxtSize] = useState("48");
  const [txtColor, setTxtColor] = useState("#ffffff");
  const [txtBold, setTxtBold] = useState(false);
  const [txtItalic, setTxtItalic] = useState(false);

  // // crop state
  // const [cropX, setCropX] = useState(0);
  // const [cropY, setCropY] = useState(0);
  // const [cropW, setCropW] = useState(0);
  // const [cropH, setCropH] = useState(0);

  // // resize state
  // const [resizeW, setResizeW] = useState(0);
  // const [resizeH, setResizeH] = useState(0);
  // const [lockAspect, setLockAspect] = useState(true);

  // const originalDataURL = useRef<string>("");
  // const originalW = useRef(0);
  // const originalH = useRef(0);
  // Keep a ref to the base FabricImage so filters can be applied to it
  const baseImgRef = useRef<FabricImage | null>(null);

  // // ── Crop ─────────────────────────────────────────────────────────────────
  // function applyCrop() {
  //   if (!originalDataURL.current || !canvasRef.current) return;
  //   const tmp = document.createElement("canvas");
  //   tmp.width = cropW;
  //   tmp.height = cropH;
  //   const ctx = tmp.getContext("2d")!;
  //   const img = new Image();
  //   img.crossOrigin = "anonymous";
  //   img.onload = () => {
  //     ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  //     const cropped = tmp.toDataURL("image/png");
  //     // pendingPlacement.current = { url: cropped, w: cropW, h: cropH };
  //     initCanvas(cropW, cropH);
  //   };
  //   img.src = originalDataURL.current;
  // }

  // // ── Resize ───────────────────────────────────────────────────────────────
  // function applyResize() {
  //   if (!canvasRef.current) return;
  //   const scaleX = resizeW / (canvasRef.current.width ?? resizeW);
  //   const scaleY = resizeH / (canvasRef.current.height ?? resizeH);
  //   canvasRef.current.getObjects().forEach((obj: any) => {
  //     obj.set({
  //       left: (obj.left ?? 0) * scaleX,
  //       top: (obj.top ?? 0) * scaleY,
  //       scaleX: (obj.scaleX ?? 1) * scaleX,
  //       scaleY: (obj.scaleY ?? 1) * scaleY,
  //     });
  //     obj.setCoords();
  //   });
  //   canvasRef.current.setDimensions({ width: resizeW, height: resizeH });
  //   baseImgRef.current?.scaleToWidth(resizeW);
  //   baseImgRef.current?.scaleToHeight(resizeH);
  //   canvasRef.current.requestRenderAll();
  //   setCanvasSize({ width: resizeW, height: resizeH });
  // }

  // ── Export ────────────────────────────────────────────────────────────────
  function exportImage() {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });
    if (onSave) {
      fetch(dataURL)
        .then((r) => r.blob())
        .then((blob) => {
          onSave(new File([blob], "edited.png", { type: "image/png" }));
        });
    } else {
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = "edited.png";
      a.click();
    }
  }

  // ── Constants ─────────────────────────────────────────────────────────────

  const PRESETS = [
    { label: "Instagram Square", w: 1080, h: 1080 },
    { label: "Facebook Cover", w: 851, h: 315 },
    { label: "Twitter/X", w: 1200, h: 675 },
    { label: "Full HD", w: 1920, h: 1080 },
  ];

  function syncLayers() {
    if (!canvasRef.current) return;

    const objs = canvasRef.current.getObjects();

    const mapped = objs.map((obj: any) => ({
      id: obj.id,
      type: obj.type,
      name: obj.type === "i-text" ? obj.text : obj.type,
      obj,
    }));

    setLayers(mapped);
  }

  // ─────────────────────────────
  // INIT CANVAS
  // ─────────────────────────────
  function initCanvas(width: number, height: number) {
    if (!canvasElRef.current) return;

    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    const canvas = new Canvas(canvasElRef.current, {
      width,
      height,
      backgroundColor: "#111",
    });

    canvasRef.current = canvas;


    canvas.on("object:added", syncLayers);
    canvas.on("object:removed", syncLayers);
    canvas.on("object:modified", syncLayers);
    canvas.on("selection:cleared", () => {
      setSelectedObj(null);
    });
    canvas.on("selection:created", syncSelected);
    canvas.on("selection:updated", syncSelected);
    canvas.on("object:modified", syncLayers);
  }
  function syncSelected() {
    const obj = canvasRef.current?.getActiveObject();
    if (!obj) {
      setSelectedObj(null);
      return;
    }
    // Destructuring properties into a flat state object forces React to see the updates
    setSelectedObj({
      instance: obj,
      opacity: obj.opacity ?? 1,
      left: obj.left ?? 0,
      top: obj.top ?? 0,
      angle: obj.angle ?? 0,
    });
  }
  async function loadBaseImage(file: File) {
    const url = await readFile(file);

    const img = new Image();
    img.src = url;

    img.onload = async () => {
      initCanvas(img.width, img.height);

      const fabricImg = await FabricImage.fromURL(url);

      fabricImg.set({
        originX: "left",
        originY: "top",
      });

      fabricImg.scaleToWidth(img.width);
      fabricImg.scaleToHeight(img.height);

      canvasRef.current?.set({
        backgroundImage: fabricImg,
      });
      setCanvasSize({ width: img.width, height: img.height });
      baseLoaded.current = true;
      canvasRef.current?.requestRenderAll();
    };
  }

  async function addImageLayer(file: File) {
    if (!canvasRef.current) return;

    const url = await readFile(file);

    const img = await FabricImage.fromURL(url);

    img.set({
      left: 100,
      top: 100,
      selectable: true,
      hasControls: true,
      originX: "left",
      originY: "top",
      id: crypto.randomUUID(),
    });

    // optional size limit
    if (img.width && img.width > 200) {
      img.scaleToWidth(200);
    }

    canvasRef.current.add(img);
    canvasRef.current.setActiveObject(img);
    canvasRef.current.requestRenderAll();
    syncLayers();
  }

  function addText() {
    if (!canvasRef.current) return;

    const text = new IText(txtContent, {
      left: 100,
      top: 100,
      fontSize: Number(txtSize),
      fill: txtColor,
      fontFamily: txtFont,
      fontWeight: txtBold ? "bold" : "normal",
      fontStyle: txtItalic ? "italic" : "normal",
    });

    canvasRef.current.add(text);
    canvasRef.current.setActiveObject(text);
    canvasRef.current.requestRenderAll();
    syncLayers();
  }

  function deleteSelected() {
    const obj = canvasRef.current?.getActiveObject();
    if (!obj) return;

    canvasRef.current?.remove(obj);
    canvasRef.current?.requestRenderAll();
    syncLayers();
  }

  function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }
  useEffect(() => {
    if (!open || !image) return;

    loadBaseImage(image);
  }, [open, image]);

  // ── Scale factor for display ──────────────────────────────────────────────
  const scale =
    canvasSize.width > 0
      ? Math.min(1, 600 / Math.max(canvasSize.width, canvasSize.height))
      : 1;

  const opacity = selectedObj?.opacity ?? 1;
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 w-full border border-border overflow-hidden"
        style={{ maxWidth: 1200, maxHeight: "90vh" }}
      >
        <div className="flex flex-col h-screen bg-background text-foreground font-sans">
          {/* Top bar */}
          <DialogHeader className="flex flex-row items-center justify-between gap-3 border-b border-border bg-muted px-4 py-2">
            <DialogTitle className="font-bold text-foreground tracking-tight">
              Edit Image
            </DialogTitle>

            <div className="flex items-center gap-1">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 "
              >
                <FolderOpen className="size-4 " />
                Open
              </Button>
              <Button
                onClick={exportImage}
                className="flex items-center gap-1   "
              >
                <Save className="size-4" />
                Save Changes
              </Button>
            </div>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left panel */}
            <div className="flex w-64 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
              {/* Tabs */}
              <div className="flex border-b border-sidebar-border">
                {(["layers", "text", "images"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t as typeof activeTab)}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors
                  ${activeTab === t ? "border-b-2 border-primary bg-card text-foreground" : "text-muted-foreground/90 hover:bg-muted hover:text-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* ── LAYERS TAB ── */}
                {activeTab === "layers" && (
                  <>
                    <div className="bg-card border border-border shadow-sm rounded-xl p-3 space-y-1 text-card-foreground">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-foreground mb-2">
                        Layers ({layers.length})
                      </p>
                      {layers.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No layers yet.
                        </p>
                      )}
                      {[...layers].reverse().map((obj, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            canvasRef.current?.setActiveObject(obj.obj);
                            canvasRef.current?.requestRenderAll();
                            //syncSelected();
                          }}
                          className={`flex bg-card/90 border border-border items-center gap-2 p-2 rounded-lg cursor-pointer ${
                            selectedObj === obj ? "bg-muted" : "hover:bg-muted"
                          }`}
                        >
                          <div className="w-7 h-7 rounded bg-popover border border-border flex items-center justify-center text-xs shrink-0">
                            {obj.type === "i-text" ? (
                              <TextIcon className="size-4 text-foreground" />
                            ) : (
                              <ImageIcon className="size-4 text-foreground" />
                            )}
                          </div>
                          <span className="flex-1 text-xs uppercase text-foreground truncate">
                            {obj.type === "i-text"
                              ? `"${(obj.name ?? "").slice(0, 12)}"`
                              : obj.type}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0 text-muted-foreground hover:text-foreground text-xs px-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              canvasRef.current?.bringObjectForward(obj.obj);
                              canvasRef.current?.requestRenderAll();
                              syncLayers();
                            }}
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              canvasRef.current?.sendObjectBackwards(obj.obj);
                              canvasRef.current?.requestRenderAll();
                              syncLayers();
                            }}
                            className="shrink-0 text-muted-foreground hover:text-foreground text-xs px-1"
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              canvasRef.current?.remove(obj.obj);
                              syncLayers();
                            }}
                            className="text-xs px-1"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {selectedObj && (
                      <div className="bg-card border border-border rounded-xl p-3 space-y-2 text-card-foreground">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Properties
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {(
                            [
                              ["X", "left"],
                              ["Y", "top"],
                            ] as [string, "left" | "top"][]
                          ).map(([l, k]) => (
                            <div key={k}>
                              <label className="text-[10px] text-muted-foreground">
                                {l}
                              </label>
                              <Input
                                type="number"
                                value={Math.round(selectedObj[k] ?? 0)}
                                onChange={(e) => {
                                  const val = +e.target.value;

                                  selectedObj.instance.set(k, val);
                                  selectedObj.instance.setCoords();
                                  canvasRef.current?.requestRenderAll();
                                  setSelectedObj({
                                    ...selectedObj,
                                    [k]: val,
                                  });
                                }}
                                className="w-full mt-0.5 bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground"
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground">
                            Opacity:{" "}
                            {Math.round((selectedObj.opacity ?? 1) * 100)}%
                          </label>
                          <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={[opacity]}
                            onValueChange={(value) => {
                              const val = value[0];
                              selectedObj.instance.set("opacity", val);
                              canvasRef.current?.requestRenderAll();
                              //  Spreading forces a fresh object reference allocation, triggering a re-render
                              setSelectedObj({ ...selectedObj, opacity: val });
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">
                            Rotation
                          </Label>
                          <Slider
                            min={-180}
                            max={180}
                            step={1}
                            value={[selectedObj.angle ?? 0]}
                            onValueChange={(value) => {
                              const val = value[0];
                              selectedObj.instance.set("angle", val);
                              selectedObj.instance.setCoords();

                              canvasRef.current?.requestRenderAll();

                              // 3. Keep the spread state assignment intact to update the UI
                              setSelectedObj({ ...selectedObj, angle: val });
                            }}
                            className="w-full accent-primary"
                          />
                        </div>
                        <Button
                          onClick={deleteSelected}
                          className="w-full py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/20"
                        >
                          <Trash2 className="size-3" /> Delete
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* ── TEXT TAB ── */}
                {activeTab === "text" && (
                  <div className="bg-card border border-border rounded-xl p-3 space-y-2 text-card-foreground">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Add Text Layer
                    </p>
                    <Textarea
                      value={txtContent}
                      onChange={(e) => setTxtContent(e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus-visible:ring-0! focus-visible:shadow-none"
                    />

                    <DefaultSelect
                      options={FONT_FAMILIES}
                      value={txtFont}
                      onValueChange={(v) => setTxtFont(v)}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">
                          Size
                        </Label>
                        <Input
                          type="number"
                          value={txtSize}
                          onChange={(e) => setTxtSize(e.target.value)}
                          min={8}
                          max={300}
                          className="w-full mt-0.5 bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">
                          Color
                        </Label>
                        <Input
                          type="color"
                          value={txtColor}
                          onChange={(e) => setTxtColor(e.target.value)}
                          className="w-full mt-0.5 h-9 p-0 bg-background border border-border rounded-md"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {(
                        [
                          ["Bold", txtBold, setTxtBold],
                          ["Italic", txtItalic, setTxtItalic],
                        ] as [string, boolean, (v: boolean) => void][]
                      ).map(([l, v, s]) => (
                        <label
                          key={l}
                          className="flex items-center gap-1.5 text-xs cursor-pointer"
                        >
                          <Switch checked={v} onCheckedChange={(e) => s(e)} />{" "}
                          {l}
                        </label>
                      ))}
                    </div>
                    <Button
                      onClick={addText}
                      className="w-full flex items-center gap-1 py-2 bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="size-4" /> Add Text
                    </Button>
                  </div>
                )}
                {activeTab === "images" && (
                  <div className="bg-card border border-border rounded-xl p-3 space-y-2 text-card-foreground">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Add Layers
                    </p>
                    <Button
                      onClick={() => logoInputRef.current?.click()}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-1"
                    >
                      <ImageIcon className="size-4 text-foreground" />
                      Add Image
                    </Button>
                  </div>
                )}

                {/* ── CROP TAB ── */}
                {/* {activeTab === "crop" && (
              <div className="bg-gray-800 rounded-xl p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Crop
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["X", cropX, setCropX],
                      ["Y", cropY, setCropY],
                      ["W", cropW, setCropW],
                      ["H", cropH, setCropH],
                    ] as [string, number, (v: number) => void][]
                  ).map(([l, v, s]) => (
                    <div key={l}>
                      <label className="text-[10px] text-gray-400">{l}</label>
                      <input
                        type="number"
                        value={v}
                        min={0}
                        onChange={(e) => s(+e.target.value)}
                        className="w-full mt-0.5 bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={applyCrop}
                  disabled={!ready}
                  className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✂ Apply Crop
                </button>
                <button
                  onClick={() => {
                    pendingPlacement.current = {
                      url: originalDataURL.current,
                      w: originalW.current,
                      h: originalH.current,
                    };
                    initCanvas(originalW.current, originalH.current);
                  }}
                  disabled={!ready}
                  className="w-full py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ↺ Reset
                </button>
              </div>
            )} */}

                {/* ── RESIZE TAB ── */}
                {/* {activeTab === "resize" && (
              <div className="bg-gray-800 rounded-xl p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Resize
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400">Width</label>
                    <input
                      type="number"
                      value={resizeW}
                      min={1}
                      onChange={(e) => {
                        setResizeW(+e.target.value);
                        if (lockAspect && canvasRef.current)
                          setResizeH(
                            Math.round(
                              (+e.target.value *
                                (canvasRef.current.height ?? 1)) /
                                (canvasRef.current.width ?? 1),
                            ),
                          );
                      }}
                      className="w-full mt-0.5 bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Height</label>
                    <input
                      type="number"
                      value={resizeH}
                      min={1}
                      onChange={(e) => {
                        setResizeH(+e.target.value);
                        if (lockAspect && canvasRef.current)
                          setResizeW(
                            Math.round(
                              (+e.target.value *
                                (canvasRef.current.width ?? 1)) /
                                (canvasRef.current.height ?? 1),
                            ),
                          );
                      }}
                      className="w-full mt-0.5 bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lockAspect}
                    onChange={(e) => setLockAspect(e.target.checked)}
                    className="accent-indigo-500"
                  />{" "}
                  Lock aspect ratio
                </label>
                <button
                  onClick={applyResize}
                  disabled={!ready}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply Resize
                </button>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 pt-1">
                  Presets
                </p>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setResizeW(p.w);
                      setResizeH(p.h);
                      setLockAspect(false);
                    }}
                    className="w-full py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs font-semibold text-left px-3"
                  >
                    {p.label} ({p.w}×{p.h})
                  </button>
                ))}
              </div>
            )} */}
              </div>
            </div>

            {/* Canvas area */}
            <div className="flex-1  flex items-center justify-center overflow-auto relative">
              {canvasSize.width === 0 && (
                <div className="flex items-center justify-center  w-full h-[100vh-200px]">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed flex flex-col items-center border-border rounded-2xl bg-card p-16 text-center cursor-pointer text-card-foreground hover:border-primary hover:bg-accent transition-all max-w-sm"
                  >
                    <ImageIcon className="size-24 mb-4 text-muted-foreground"></ImageIcon>
                    <h2 className="text-lg font-bold mb-2">Open an Image</h2>
                    <p className="text-sm text-muted-foreground">
                      JPG · PNG · WebP
                    </p>
                  </div>
                </div>
              )}
              <div className="flex-1 h-full  w-100  flex items-center justify-center overflow-auto">
                <div
                  className=" border-amber-200 border-4"
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "center",
                  }}
                >
                  <canvas ref={canvasElRef} />
                </div>
              </div>

              {canvasSize.width > 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-popover/90 backdrop-blur border border-border rounded-full px-4 py-1.5 text-xs text-muted-foreground flex gap-4 pointer-events-none shadow-sm">
                  <span>
                    Canvas:{" "}
                    <b className="text-foreground">
                      {canvasSize.width}×{canvasSize.height}
                    </b>
                  </span>
                  <span>
                    Layers: <b className="text-foreground">{layers.length}</b>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) loadBaseImage(file);
              // Reset so the same file can be re-opened
              e.target.value = "";
            }}
          />
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addImageLayer(file);
              e.target.value = "";
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
