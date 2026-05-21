import InteractionForm from "@/components/InteractionForm";
import { INTERACTIONS_FORM_ENABLED } from "@/lib/feature-flags";

export default function InteractionPage() {
  if (!INTERACTIONS_FORM_ENABLED) {
    return (
      <div className="p-6 md:pt-24 pb-24 md:pb-6">
        <p className="text-center text-muted-foreground">
          The interaction form is temporarily unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:pt-24 pb-24 md:pb-6">
      <InteractionForm />
    </div>
  );
}
