import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAbundanceStore } from '../../store/abundanceStore';
import Button from '../common/Button';
import TextareaAutosize from 'react-textarea-autosize'; // npm install react-textarea-autosize
// import { PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline'; // Optional

const SimplePlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SimpleMinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


function EvidenceInventory({ onComplete, onBack }) {
  const {
    currentInterpretation,
    evidenceWrong, updateEvidence: updateStoreEvidenceWrong, addEvidenceBullet: addStoreBulletWrong, removeEvidenceBullet: removeStoreBulletWrong,
    evidenceServing, updateEvidence: updateStoreEvidenceServing, addEvidenceBullet: addStoreBulletServing, removeEvidenceBullet: removeStoreBulletServing,
  } = useAbundanceStore(state => ({
    currentInterpretation: state.currentInterpretation,
    evidenceWrong: state.evidenceWrong,
    updateEvidence: state.updateEvidence, // This will be specialized below
    addEvidenceBullet: state.addEvidenceBullet,
    removeEvidenceBullet: state.removeEvidenceBullet,
    evidenceServing: state.evidenceServing,
  }));
  
  // Local state to manage input focus and potentially local edits before committing to store
  // For simplicity, we'll directly use store actions here

  const firstInputRef = useRef(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleEvidenceChange = (type, index, value) => {
    if (type === 'wrong') {
      updateStoreEvidenceWrong('wrong', index, value);
    } else {
      updateStoreEvidenceServing('serving', index, value);
    }
  };
  
  const handleAddBullet = (type) => {
    if (type === 'wrong') addStoreBulletWrong('wrong');
    else addStoreBulletServing('serving');
  };

  const handleRemoveBullet = (type, index) => {
    if (type === 'wrong') removeStoreBulletWrong('wrong', index);
    else removeStoreBulletServing('serving', index);
  };

  const canProceed = () => {
    // Require at least 2 entries in each column, and they must not be empty
    const wrongValid = evidenceWrong.filter(e => e.trim() !== '').length >= 2;
    const servingValid = evidenceServing.filter(e => e.trim() !== '').length >= 2;
    return wrongValid && servingValid;
  };

  return (
    <div className="space-y-6 animate-slideUp">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Step 2: Evidence Inventory</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Your current interpretation is: <strong className="italic">"{currentInterpretation}"</strong>
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        List 2-3 bullet points for each column below.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Column 1: Evidence This Is Wrong */}
        <div className="space-y-3 p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Evidence This Interpretation is Wrong/Not True</h3>
          {evidenceWrong.map((item, index) => (
            <div key={`wrong-${index}`} className="flex items-start space-x-2">
              <span className="text-gray-500 dark:text-gray-400 pt-1.5">•</span>
              <TextareaAutosize
                ref={index === 0 ? firstInputRef : null}
                value={item}
                onChange={(e) => handleEvidenceChange('wrong', index, e.target.value)}
                placeholder={`Evidence #${index + 1}`}
                className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                minRows={1}
                aria-label={`Evidence interpretation is wrong, item ${index + 1}`}
              />
              {evidenceWrong.length > 2 && (
                 <Button onClick={() => handleRemoveBullet('wrong', index)} variant="link" size="sm" className="p-1 text-red-500 hover:text-red-700" ariaLabel={`Remove evidence wrong item ${index+1}`}>
                    <SimpleMinusIcon />
                </Button>
              )}
            </div>
          ))}
          {evidenceWrong.length < 3 && (
            <Button onClick={() => handleAddBullet('wrong')} variant="link" size="sm" className="text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                <SimplePlusIcon /> <span>Add Evidence</span>
            </Button>
          )}
        </div>

        {/* Column 2: Evidence This Is Serving Me */}
        <div className="space-y-3 p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Evidence This Interpretation is (or was) Serving Me</h3>
          {evidenceServing.map((item, index) => (
            <div key={`serving-${index}`} className="flex items-start space-x-2">
              <span className="text-gray-500 dark:text-gray-400 pt-1.5">•</span>
              <TextareaAutosize
                value={item}
                onChange={(e) => handleEvidenceChange('serving', index, e.target.value)}
                placeholder={`How it serves #${index + 1}`}
                className="w-full p-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                minRows={1}
                aria-label={`Evidence interpretation is serving, item ${index + 1}`}
              />
              {evidenceServing.length > 2 && (
                <Button onClick={() => handleRemoveBullet('serving', index)} variant="link" size="sm" className="p-1 text-red-500 hover:text-red-700" ariaLabel={`Remove evidence serving item ${index+1}`}>
                    <SimpleMinusIcon />
                </Button>
              )}
            </div>
          ))}
          {evidenceServing.length < 3 && (
             <Button onClick={() => handleAddBullet('serving')} variant="link" size="sm" className="text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                <SimplePlusIcon /> <span>Add Evidence</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onComplete} disabled={!canProceed()}>
          Next: Generate Alternative Frames
        </Button>
      </div>
    </div>
  );
}

EvidenceInventory.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default EvidenceInventory;