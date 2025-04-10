import { cn } from "@/lib/utils";

interface ProposalStepsProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

const ProposalSteps = ({ currentStep, onStepChange }: ProposalStepsProps) => {
  const steps = [
    { number: 1, label: "Client Information" },
    { number: 2, label: "Proposal Details" },
    { number: 3, label: "Pricing & Terms" },
    { number: 4, label: "Review & Export" }
  ];

  const handleStepClick = (stepNumber: number) => {
    // We could add validation here before allowing to move to certain steps
    onStepChange(stepNumber);
  };

  return (
    <div className="border-b border-neutral-200">
      <nav className="-mb-px flex overflow-x-auto">
        {steps.map((step) => (
          <a
            key={step.number}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleStepClick(step.number);
            }}
            className={cn(
              "whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm",
              currentStep === step.number
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
            )}
          >
            {step.number}. {step.label}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default ProposalSteps;
