import { useState } from "react";
import { ValidationError } from "yup";
import type { AnyObject, ObjectSchema } from "yup";

type FormErrors = Record<string, string>;

export function useFormValidation<T extends AnyObject>(
  schema: ObjectSchema<T>,
) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = async (data: T): Promise<boolean> => {
    setIsValidating(true);
    try {
      await schema.validate(data, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        const newErrors: FormErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const validateField = async (
    name: keyof T & string,
    value: unknown,
  ): Promise<string | null> => {
    try {
      await schema.validateAt(name, { [name]: value } as AnyObject);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return null;
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorMessage = error.message;
        setErrors((prev) => ({ ...prev, [name]: errorMessage }));
        return errorMessage;
      }
    }
    return null;
  };

  const clearErrors = () => setErrors({});
  const getError = (fieldName: string) => errors[fieldName] || null;

  return {
    errors,
    isValidating,
    validate,
    validateField,
    clearErrors,
    getError,
  };
}
