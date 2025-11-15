import { Controller } from "react-hook-form";

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const SizeSelector = ({control, error}: any) => {
    return (
        <div className="mt-2">
            <label className="block font-semibold text-gray-300 mb-1">Sizes</label>
            <Controller
                name="sizes"
                control={control}
                render={({ field }) => (
                    <div className="flex gap-2 flex-wrap">
                        {sizes.map((size) => {
                            const isSelected = (field.value || []).includes(size);
                            return (
                                <button
                                    type="button"
                                    key={size}
                                    onClick={() => {
                                        field.onChange(
                                            isSelected
                                                ? field.value.filter((s: string) => s !== size)
                                                : [...(field.value || []), size]
                                        );
                                    }}
                                    className={`px-3 py-1 border rounded-full text-sm font-medium ${
                                        isSelected
                                            ? "bg-blue-600 border-blue-600 text-white"
                                            : "bg-transparent border-gray-600 text-gray-300 hover:border-gray-400"
                                    }`}
                                >
                                    {size}
                                </button>
                            )
                        })}
                    </div>
                )}
            />
        </div>
    )
}
export default SizeSelector