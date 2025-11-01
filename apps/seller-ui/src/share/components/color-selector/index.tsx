import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Controller, set } from "react-hook-form";

export const defaultColors: string[] = [
    "#FFFFFF", // white
    "#000000", // black
    "#FF4D4F", // red
    "#52C41A", // green
    "#1890FF", // blue
    "#FAAD14", // orange
    "#722ED1", // purple
    "#13C2C2", // teal
    "#BFBFBF", // gray
];

const ColorSelector = ({ control, errors}: any) => {
    const [customColors, setCustomColors] = useState<string[]>([]);
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [newColor, setNewColor] = useState<string>("#000000");

    return (
        <div className="mt-2">
            <label className="block mb-2 font-medium text-gray-700">Select Colors</label>
            <Controller 
                name="colors"
                control={control}
                render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                    {[...defaultColors, ...customColors].map((color) => {
                        const isSelected = (field.value || []).includes(color);
                        const isLightColor = ["#ffffff", "#ffff00"].includes(color);

                        return <button type="button" key={color}
                        onClick={() => field.onChange(isSelected 
                            ? field.value.filter((c:string) => c !== color) 
                            : [...(field.value || [],color)]
                        )}
                        className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition ${
                            isSelected ? "scale-110 border-white" : "border-transparent"  
                        } ${isLightColor ? "border-gray-400" : ""}`}
                        style={{ backgroundColor: color }}
                        >
                        </button>
                    })}

                    <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 border-dashed border-gray-400 text-gray-400 hover:border-gray-600 hover:text-gray-600 transition"
                    >
                        <Plus size={16} color="white" />
                    </button>

                    {showColorPicker && (
                        <div className=" relative flex items-center gap-2">
                            <input
                                type="color"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="border-2 border-gray-300 rounded-md p-1"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setCustomColors([...customColors, newColor]);
                                    setShowColorPicker(false);
                                }}
                                className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                Add
                            </button>
                        </div>
                    )}
                </div>
                )}
            />
        </div>
    );
};

export default ColorSelector;