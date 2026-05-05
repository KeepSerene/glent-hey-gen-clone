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
import { Crop, ZoomIn } from "lucide-react";
import { getCroppedImg } from "~/lib/utils";

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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="size-4" />
            Crop Avatar Photo
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-xs">
          Focus and crop the face closely for the best lip-sync results.
        </p>

        {/* Cropper container — must have position: relative and a fixed height */}
        <div className="relative h-72 w-full overflow-hidden rounded-lg border">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            showGrid={true}
            cropShape="rect"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs">
            <ZoomIn className="size-3" />
            Zoom — {zoom.toFixed(2)}x
          </Label>

          <Slider
            min={1}
            max={3}
            step={0.01}
            value={[zoom]}
            onValueChange={([v]) => setZoom(v!)}
          />
        </div>

        <DialogFooter className="gap-2">
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
