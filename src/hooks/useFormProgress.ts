import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface FormProgressOptions {
  requiredFields?: string[];
  optionalFields?: string[];
  fileFields?: string[];
}

export function useFormProgress<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options: FormProgressOptions = {}
) {
  const [progress, setProgress] = useState(0);
  const [filledFields, setFilledFields] = useState(0);
  const [totalFields, setTotalFields] = useState(0);

  useEffect(() => {
    const subscription = form.watch((data) => {
      calculateProgress(data as T);
    });

    // Calculate initial progress
    calculateProgress(form.getValues());

    return () => subscription.unsubscribe();
  }, [form.watch, options]);

  const calculateProgress = (data: T) => {
    const { requiredFields = [], optionalFields = [], fileFields = [] } = options;
    
    // Combine all fields to track
    const allFields = [...requiredFields, ...optionalFields];
    
    if (allFields.length === 0) {
      // If no fields specified, use all form fields
      const formFields = Object.keys(data);
      return calculateDefaultProgress(data, formFields);
    }

    let filled = 0;
    const total = allFields.length;

    allFields.forEach((fieldName) => {
      const value = data[fieldName];
      
      if (isFieldFilled(value)) {
        filled++;
      }
    });

    const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;
    
    setFilledFields(filled);
    setTotalFields(total);
    setProgress(percentage);
  };

  const calculateDefaultProgress = (data: T, fields: string[]) => {
    let filled = 0;
    
    fields.forEach((fieldName) => {
      const value = data[fieldName];
      if (isFieldFilled(value)) {
        filled++;
      }
    });

    const percentage = fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0;
    
    setFilledFields(filled);
    setTotalFields(fields.length);
    setProgress(percentage);
  };

  const isFieldFilled = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'boolean') return true; // Checkboxes count as filled
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  };

  return {
    progress,
    filledFields,
    totalFields,
    isComplete: progress === 100
  };
}
