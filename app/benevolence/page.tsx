import type { Metadata } from "next";
import BenevolenceForm from "./BenevolenceForm";

export const metadata: Metadata = {
  title: "Benevolence Request",
  description: "Internal benevolence assistance request form.",
};

export default function BenevolencePage() {
  return <BenevolenceForm />;
}
