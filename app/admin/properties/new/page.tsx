import { PropertyForm } from "@/src/components/PropertyForm";

export const metadata = {
  title: "New listing",
};

export default function NewPropertyPage() {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Create</p>
      <h1 className="font-heading mt-1 mb-8 text-4xl">New listing</h1>
      <PropertyForm />
    </div>
  );
}
