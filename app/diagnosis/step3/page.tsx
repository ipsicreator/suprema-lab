"use client";

import FlowShell from "@/app/components/FlowShell";
import { diagnosisScreenText } from "@/app/diagnosis/content";
import { diagnosisSteps } from "../steps";
import Step3 from "./Step3";

export default function DiagnosisStep3Page() {
  return (
    <FlowShell
      badge="PREMIUM DIAGNOSIS"
      title={diagnosisScreenText.step3.title}
      subtitle={diagnosisScreenText.step3.subtitle}
      currentStep={3}
      steps={diagnosisSteps}
    >
      <Step3 />
    </FlowShell>
  );
}
