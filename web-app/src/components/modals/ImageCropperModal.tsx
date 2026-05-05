"use client";

import Cropper from "react-easy-crop";
import { useCallback, useState } from "react";
import type { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Crop, RectangleHorizontal, Square, ZoomIn } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { getCroppedImg } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  fileName: string;
  onCropDone: (croppedFile: File) => void;
  onCancel: () => void;
}

function ImageCropperModal({
  isOpen,
  imageSrc,
  fileName,
  onCropDone,
  onCancel,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<string>("1");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);

    try {
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        fileName,
      );
      onCropDone(croppedFile);
    } catch (error) {
      console.error("Crop failed:", error);
      toast.error("Failed to crop image. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) onCancel();
  };

  // Convert the string state to a number for react-easy-crop
  const aspectNumber = parseFloat(aspectRatio);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="size-4" />
            Crop Avatar Photo
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-xs leading-relaxed">
          Choose an aspect ratio and focus closely on the face for best
          lip-sync.
        </p>

        {/* Cropper container */}
        <div className="relative mt-1 h-72 w-full overflow-hidden rounded-lg border bg-black/5">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectNumber}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
            cropShape="rect"
          />
        </div>

        {/* ── Toolbar (Aspects + Zoom) ── */}
        <div className="bg-card mt-2 flex items-center justify-between gap-4 rounded-xl border p-2">
          <ToggleGroup
            type="single"
            value={aspectRatio}
            onValueChange={(value) => {
              if (value) setAspectRatio(value); // prevent deselecting
            }}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  type="button"
                  value="1"
                  aria-label="Square 1:1 aspect"
                  className="gap-1.5 px-3"
                >
                  <Square className="size-3.5" />

                  <span className="text-[11px]">1:1</span>
                </ToggleGroupItem>
              </TooltipTrigger>

              <TooltipContent>Square 1:1 aspect</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  type="button"
                  value="1.5"
                  aria-label="Portrait 3:2 aspect"
                  className="gap-1.5 px-3"
                >
                  <RectangleHorizontal className="size-3.5" />

                  <span className="text-[11px]">3:2</span>
                </ToggleGroupItem>
              </TooltipTrigger>

              <TooltipContent>Portrait 3:2 aspect</TooltipContent>
            </Tooltip>
          </ToggleGroup>

          {/* Zoom Slider */}
          <div className="flex grow items-center gap-2.5">
            <Label htmlFor="zoom-slider" className="shrink-0">
              <ZoomIn className="text-muted-foreground size-4" />
            </Label>

            <Slider
              id="zoom-slider"
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v!)}
              className="grow"
            />

            <span className="text-muted-foreground w-8 shrink-0 text-right font-mono text-xs tabular-nums">
              {zoom.toFixed(2)}x
            </span>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>

          <Button type="button" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? "Cropping..." : "Crop & Use"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImageCropperModal;
