import { FiCircle, FiCheckCircle } from "react-icons/fi"

interface Step {
  id: number;
  name: string;
}

interface RegistrationTrackerProps {
  currentStep: number;
  steps: Step[];
}

const RegistrationTracker: React.FC<RegistrationTrackerProps> = ({
  currentStep,
  steps,
}) => {
  return (
  <div className="w-full md:w-1/4 mb-8 md:mb-0 md:pr-8">
    <ul className="space-y-0">
      {steps.map((step, index) => (
        <li key={step.id} className="flex items-start">
          <div className="flex flex-col items-center mr-4">
            {currentStep > step.id ? (
              <FiCheckCircle className="w-7 h-7 text-brand-green" />
            ) : currentStep === step.id ? (
              <FiCircle className="w-7 h-7 text-blue-500 animate-pulse" />
            ) : (
              <FiCircle className="w-7 h-7 text-gray-400" />
            )}
            {index < steps.length - 1 && (
              <div
                className={`w-0.5 h-12 mt-1 ${
                  currentStep > step.id ? "bg-brand-green" : "bg-gray-300"
                }`}
              ></div>
            )}
          </div>
          <div
            className={`pt-1 ${
              currentStep > step.id
                ? "text-brand-green font-medium"
                : currentStep === step.id
                ? "text-blue-500 font-medium"
                : "text-dark-text/70"
            }`}
          >
            {step.name}
          </div>
        </li>
      ))}
    </ul>
  </div>
  )
};


export default RegistrationTracker;
export type { Step };