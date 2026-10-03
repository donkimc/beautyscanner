import type { Grade } from "../../lib/products";

// Static class names so Tailwind can see them. Colors come from the grade-* design tokens.
export const GRADE_TEXT: Record<Grade, string> = {
  clinical: "text-grade-clinical border-grade-clinical",
  multiple: "text-grade-multiple border-grade-multiple",
  brand: "text-grade-brand border-grade-brand",
  emerging: "text-grade-emerging border-grade-emerging",
  unrated: "text-grade-unrated border-grade-unrated",
};

export const GRADE_DOT: Record<Grade, string> = {
  clinical: "bg-grade-clinical",
  multiple: "bg-grade-multiple",
  brand: "bg-grade-brand",
  emerging: "bg-grade-emerging",
  unrated: "bg-grade-unrated",
};
