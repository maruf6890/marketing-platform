"use client";

import { useRef, useState } from "react";
import { Canvas, IText, FabricImage } from "fabric";

export default function BasicEditor() {
  const canvasRef = useRef<Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);

  const baseLoaded = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);



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

  }

  // ─────────────────────────────
  // LOAD BASE IMAGE (BACKGROUND)
  // ─────────────────────────────
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

      baseLoaded.current = true;
      canvasRef.current?.requestRenderAll();
    };
  }

  // ─────────────────────────────
  // ADD IMAGE LAYER (LOGO / STICKER)
  // ─────────────────────────────
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
    });

    // optional size limit
    if (img.width && img.width > 200) {
      img.scaleToWidth(200);
    }

    canvasRef.current.add(img);
    canvasRef.current.setActiveObject(img);
    canvasRef.current.requestRenderAll();
  }

  // ─────────────────────────────
  // ADD TEXT
  // ─────────────────────────────
  function addText() {
    if (!canvasRef.current) return;

    const text = new IText("Hello Fabric.js", {
      left: 100,
      top: 100,
      fontSize: 40,
      fill: "#fff",
    });

    canvasRef.current.add(text);
    canvasRef.current.setActiveObject(text);
    canvasRef.current.requestRenderAll();
  }

  // ─────────────────────────────
  // DELETE SELECTED
  // ─────────────────────────────
  function deleteSelected() {
    const obj = canvasRef.current?.getActiveObject();
    if (!obj) return;

    canvasRef.current?.remove(obj);
    canvasRef.current?.requestRenderAll();
  }

  // ─────────────────────────────
  // FILE READER HELPER
  // ─────────────────────────────
  function readFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="p-4 space-y-3 bg-black min-h-screen text-white">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 bg-blue-600 rounded"
        >
          Load Base Image
        </button>

        <button
          onClick={() => logoInputRef.current?.click()}
          className="px-3 py-1 bg-purple-600 rounded"
        >
          Add Image Layer
        </button>

        <button onClick={addText} className="px-3 py-1 bg-green-600 rounded">
          Add Text
        </button>

        <button
          onClick={deleteSelected}
          className="px-3 py-1 bg-red-600 rounded"
        >
          Delete Selected
        </button>
      </div>

      {/* Canvas */}
      <div className="border border-gray-700 inline-block">
        <canvas ref={canvasElRef} />
      </div>

      {/* Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadBaseImage(file);
        }}
      />

      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) addImageLayer(file);
        }}
      />
    </div>
  );
}
