"use client";

import React, { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Edit, Monitor, Save, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { saveCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";

const CoverLetterPreview = ({ content, coverLetterId }) => {
  const [editedContent, setEditedContent] = useState(content);
  const [editMode, setEditMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    loading: isSaving,
    fn: saveCoverLetterFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveCoverLetter);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Cover letter saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save cover letter");
    }
  }, [saveResult, saveError, isSaving]);

  const handleSave = async () => {
    if (!coverLetterId) {
      toast.error("Cannot save: Cover letter ID is missing");
      return;
    }
    await saveCoverLetterFn(coverLetterId, editedContent);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("cover-letter-pdf");
      const opt = {
        margin: [15, 15],
        filename: "cover-letter.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div data-color-mode="light" className="py-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="link"
          type="button"
          onClick={() => setEditMode(editMode === "preview" ? "edit" : "preview")}
        >
          {editMode === "preview" ? (
            <>
              <Edit className="h-4 w-4 mr-1" />
              Edit Cover Letter
            </>
          ) : (
            <>
              <Monitor className="h-4 w-4 mr-1" />
              Show Preview
            </>
          )}
        </Button>

        <Button
          variant="destructive"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save
            </>
          )}
        </Button>

        <Button onClick={generatePDF} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      <div className="border rounded-lg">
        <MDEditor
          value={editedContent}
          onChange={setEditedContent}
          height={700}
          preview={editMode}
        />
      </div>

      <div className="hidden">
        <div id="cover-letter-pdf">
          <MDEditor.Markdown
            source={editedContent}
            style={{
              background: "white",
              color: "black",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;
