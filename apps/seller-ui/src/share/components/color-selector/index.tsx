import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Controller } from "react-hook-form";

export const defaultColors: string[] = [
    "#ffffff", // white
    "#000000", // black
    "#ff4d4f", // red
    "#52c41a", // green
    "#1890ff", // blue
    "#faad14", // orange
    "#722ed1", // purple
    "#13c2c2", // teal
    "#bfbfbf", // gray
];

const ColorSelector = ({ control, errors}: any) => {
    const [customColors, setCustomColors] = useState<string[]>([]);
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [newColor, setNewColor] = useState<string>("#000000");

    return (
        <div className="mt-2">
            <label className="block mb-2 font-medium text-gray-700">Select Colors</label>
            <Controller<any, any>
                name="colors"
                control={control}
                defaultValue={[]}
                render={({ field }: any) => (
                <div className="flex flex-wrap gap-2">
                    {[...defaultColors, ...customColors].map((color) => {
                        const lcColor = color.toLowerCase();
                        const currentValues = ((field.value || []) as string[]).map((v: string) => (v || '').toLowerCase());
                        const isSelected = currentValues.includes(lcColor);
                        const isLightColor = ["#ffffff", "#ffff00"].includes(lcColor);

                        return <button type="button" key={lcColor}
                        onClick={() => {
                            const values = ((field.value || []) as string[]) || [];
                            const normalized = values.map((v: string) => (v || '').toLowerCase());
                            if (normalized.includes(lcColor)) {
                              // deselect
                              const next = values.filter((c: string) => (c || '').toLowerCase() !== lcColor);
                              field.onChange(next);
                            } else {
                              // select
                              field.onChange([...(values || []), lcColor]);
                            }
                        }}
                        className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition ${
                            isSelected ? "scale-110 border-white" : "border-transparent"  
                        } ${isLightColor ? "border-gray-400" : ""}`}
                        style={{ backgroundColor: lcColor }}
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
                                    // store custom colors normalized to lowercase
                                    const lc = newColor.toLowerCase();
                                    setCustomColors([...customColors, lc]);
                                    setShowColorPicker(false);
                                    // auto-select the newly added color
                                    const values = (field.value || []) || [];
                                    field.onChange([...(values || []), lc]);
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