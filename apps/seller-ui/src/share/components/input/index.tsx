import React from 'react';
import {forwardRef} from 'react';

interface BaseProps {
    label?: string;
    type?: "text" | "password" | "email" | "number" | "textarea"; 
    className?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

type TextAreaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextAreaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
    ({ label, type = "text", className, ...props }, ref) => {
        return (
            <div className={`flex flex-col w-full ${className || ''}`}>
                {label && (
                    <label className="mb-2 font-medium text-gray-700">{label}</label>
                )}

                {type === "textarea" ? (
                    <textarea ref={ref as React.Ref<HTMLTextAreaElement>}
                    className={`w-full border border-gray-300 outline-none bg-transparent p-2 rounded-md text-white ${className}`}
                    {...(props as TextAreaProps)}
                    />
                ) : (
                    <input type={type}
                      ref={ref as React.Ref<HTMLInputElement>} className={`w-full border border-gray-300 outline-none bg-transparent p-2 rounded-md text-white ${className}`} 
                      {...(props as InputProps)} />
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
