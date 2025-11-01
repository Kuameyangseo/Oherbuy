import { Controller} from "react-hook-form"
import React, { useEffect, useState } from "react";
import {Plus, X } from "lucide-react";
import Input from "../input";



const CustomProperties = ({control, errors}:any) => {
    const [properties, setProperties] = useState<
    {label: string; values: string[] }[]>([]);

    const [newLabel, setNewLabel] = useState("");
    const [newValues, setNewValues] = useState("");



    return (
        <div>
            <div className="flex flex-col gap-3">
                <Controller 
                    name="customProperties"
                    control={control}
                    render={({field}) => {
                        useEffect(() => {
                            field.onChange(properties);
                        }, [properties]);

                        const addProperty = () => {
                            if (!newLabel.trim()) return;
                            setProperties([ ...properties,{label: newLabel, values:[]}]);
                            setNewLabel("");
                        };

                        const addValue = (index: number) => {
                            if (!newValues.trim()) return; 
                            const updatedProperties = [...properties];
                            updatedProperties[index].values.push(newValues);
                            setProperties(updatedProperties);
                            setNewValues("");
                        };

                        const removeProperty = (index: number) => {
                            setProperties(properties.filter((_, i) => i !== index));
                        }

                        return (
                            <div className="mt-2">
                                <label className="block font-semibold text-gray-300 mb-1">
                                    Custom Properties
                                </label>
                                {properties.map((property, index) => (
                                    <div key={index} className="mb-4 border p-3 rounded-lg bg-gray-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-300">{property.label}</span>
                                            <button 
                                              type="button" 
                                              className="text-red-500 hover:text-red-700" 
                                              onClick={() => removeProperty(index)}>
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="flex flex-col">
                                           <input 
                                             type="text"
                                                className="p-2 rounded mb-2 bg-gray-700 text-white border border-gray-600"
                                                placeholder="Add value"
                                                value={newValues}
                                                onChange={(e) => setNewValues(e.target.value)}
                                            />      
                                            <button
                                              type="button"
                                              className="px-3 py-1 bg-blue-500 text-white rounded-md"
                                              onClick={() => addValue(index)}
                                            >
                                              Add
                                            </button>   
                                        </div>
                                        <div className="mt-2 flex gap-2 flex-wrap">
                                            {property.values.map((value, i) => (
                                                <span 
                                                  key={i} 
                                                  className="block text-sm text-gray-300 rounded bg-gray-700 p-1 mb-1"
                                                  > 
                                                  {value}
                                                  </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                       placeholder="Enter property label (e.g., Material, Warranty)"
                                       value={newLabel}
                                       onChange={(e: any) => setNewLabel(e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      className="px-3 py-1 bg-green-500 text-white rounded-md flex items-center gap-2"
                                      onClick={addProperty}
                                    >
                                      <Plus size={20} /> Add
                                    </button>
                                </div>
                                {errors.custom_specifications && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.custom_specifications.message}
                                </p>
                            )}
                            </div>
                        );
                    }}
                />
            </div>
        </div>
    )
}


export default CustomProperties
