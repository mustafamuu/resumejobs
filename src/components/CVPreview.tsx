import type { CV, CVTemplateId } from "@/lib/store";
import { ClassicTemplate } from "./cv-templates/ClassicTemplate";
import { ModernTemplate } from "./cv-templates/ModernTemplate";
import { CompactTemplate } from "./cv-templates/CompactTemplate";

export const CV_TEMPLATES: { id: CVTemplateId; label: string; description: string }[] = [
  { id: "classic", label: "Classic", description: "Clean single column — best for ATS" },
  { id: "modern", label: "Modern", description: "Sidebar layout with accent color" },
  { id: "compact", label: "Compact", description: "Dense serif layout, one page friendly" },
];

export function CVPreview({ cv, templateId = "classic" }: { cv: CV; templateId?: CVTemplateId }) {
  switch (templateId) {
    case "modern":
      return <ModernTemplate cv={cv} />;
    case "compact":
      return <CompactTemplate cv={cv} />;
    default:
      return <ClassicTemplate cv={cv} />;
  }
}
