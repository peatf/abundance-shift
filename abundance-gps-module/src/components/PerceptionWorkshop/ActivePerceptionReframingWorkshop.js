import React, { useState, useEffect, useRef } from 'react';
import { useAbundanceStore } from '../../store/abundanceStore.js';
import IdentifyInterpretation from './IdentifyInterpretation';
import EvidenceInventory from './EvidenceInventory';
import AlternativeFrameGeneration from './AlternativeFrameGeneration';
import CommitAnchor from './CommitAnchor'; // Includes Resonance Rating and Anchor button logic
import Button from '../common/Button';

const workshopSteps = {
  IDENTIFY: 'IDENTIFY',
  EVIDENCE: 'EVIDENCE',
  GENERATE_FRAMES: 'GENERATE_FRAMES',
  COMMIT_ANCHOR: 'COMMIT_ANCHOR', // This step internally handles rating and anchoring.
};

function ActivePerceptionReframingWorkshop() {
  const [currentStep, setCurrentStep] = useState(workshopSteps.IDENTIFY);
  const proceedFromWorkshop = useAbundanceStore(state => state.proceedFromWorkshop);
  const headingRef = useRef(null);

  useEffect(() => {
    if (headingRef.current) headingRef.current.focus();
  }, [currentStep]);

  const nextStep = () => {
    switch (currentStep) {
      case workshopSteps.IDENTIFY:
        setCurrentStep(workshopSteps.EVIDENCE);
        break;
      case workshopSteps.EVIDENCE:
        setCurrentStep(workshopSteps.GENERATE_FRAMES);
        break;
      case workshopSteps.GENERATE_FRAMES:
        setCurrentStep(workshopSteps.COMMIT_ANCHOR);
        break;
      case workshopSteps.COMMIT_ANCHOR: // From CommitAnchor, proceed to next main stage
        proceedFromWorkshop();
        break;
      default:
        break;
    }
  };

  const prevStep = () => {
     switch (currentStep) {
      case workshopSteps.EVIDENCE:
        setCurrentStep(workshopSteps.IDENTIFY);
        break;
      case workshopSteps.GENERATE_FRAMES:
        setCurrentStep(workshopSteps.EVIDENCE);
        break;
      case workshopSteps.COMMIT_ANCHOR:
        setCurrentStep(workshopSteps.GENERATE_FRAMES);
        break;
      default:
        break;
    }
  }

  return (
    <div className="animate-fadeIn p-2 md:p-4 space-y-6">
      <h1 ref={headingRef} tabIndex="-1" className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
        Active Perception Reframing
      </h1>
      
      {/* Progress Indicator (Optional) */}
      <div className="flex justify-center space-x-2 mb-6">
        {Object.values(workshopSteps).map((step, index) => (
          <div key={step} className={`w-1/4 h-2 rounded-full ${Object.values(workshopSteps).indexOf(currentStep) >= index ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-700'}`}></div>
        ))}
      </div>

      {currentStep === workshopSteps.IDENTIFY && <IdentifyInterpretation onComplete={nextStep} />}
      {currentStep === workshopSteps.EVIDENCE && <EvidenceInventory onComplete={nextStep} onBack={prevStep} />}
      {currentStep === workshopSteps.GENERATE_FRAMES && <AlternativeFrameGeneration onComplete={nextStep} onBack={prevStep}/>}
      {currentStep === workshopSteps.COMMIT_ANCHOR && <CommitAnchor onComplete={nextStep} onBack={prevStep}/>} 
      {/* CommitAnchor's onComplete effectively means "module stage finished, proceed to next main GPS stage" */}

    </div>
  );
}

export default ActivePerceptionReframingWorkshop; 