import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Highlighter, X } from "lucide-react";
import { HIGHLIGHT_COLORS } from "@/hooks/useHighlights";
import { cn } from "@/lib/utils";

interface HighlightMenuProps {
  onHighlight: (color: string, note?: string) => void;
  onRemoveHighlight?: () => void;
  currentColor?: string;
  currentNote?: string;
  disabled?: boolean;
}

export default function HighlightMenu({
  onHighlight,
  onRemoveHighlight,
  currentColor,
  currentNote,
  disabled = false,
}: HighlightMenuProps) {
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(currentColor || "yellow");
  const [note, setNote] = useState(currentNote || "");

  useEffect(() => {
    if (open) {
      setSelectedColor(currentColor || "yellow");
      setNote(currentNote || "");
    }
  }, [open, currentColor, currentNote]);

  const handleHighlight = () => {
    onHighlight(selectedColor, note.trim() || undefined);
    setOpen(false);
  };

  const handleRemove = () => {
    if (onRemoveHighlight) {
      onRemoveHighlight();
      setOpen(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Quick highlight without opening the full menu
    if (!currentColor) {
      onHighlight(color);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={currentColor ? "default" : "ghost"}
          size="icon"
          className={cn(
            "h-8 w-8",
            currentColor && "bg-primary/10 hover:bg-primary/20"
          )}
          disabled={disabled}
          title="Highlight verse"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Highlighter className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Highlight Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className={cn(
                    "h-10 w-10 rounded-md border-2 transition-all hover:scale-110",
                    color.class,
                    selectedColor === color.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border"
                  )}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-semibold">
              Note (Optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Add a note about this verse..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleHighlight}
              className="flex-1"
              size="sm"
            >
              <Highlighter className="h-4 w-4 mr-2" />
              {currentColor ? "Update" : "Highlight"}
            </Button>
            {currentColor && onRemoveHighlight && (
              <Button
                onClick={handleRemove}
                variant="destructive"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
