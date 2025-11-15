"use client"
import React, {useEffect, useRef, useState} from "react";
import "react-quill-new/dist/quill.snow.css";
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to ensure it only loads on the client (avoids server-side `document` errors)
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });


export default function RichTextEditor({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const [editorValue, setEditorValue] = useState(value || ""); 
    const quillRef = useRef(false);

    useEffect(() => {
        if (!quillRef.current) {
            quillRef.current = true;

            setTimeout(() => {
                document.querySelectorAll('.ql-editor')
                .forEach((toolbar, index) => {
                    if (index > 0) {
                        toolbar.remove();
                    } 
                });

            }, 100);
        }
    }, []);

    return (
        <div className="relative">
            <ReactQuill
                theme="snow"
                value={editorValue}
                onChange={(content) => {
                    setEditorValue(content);
                    onChange(content);
                }}
                modules={{
                    toolbar: [
                        [{ font: [] }, { size: [] }],                   // Font and size options
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],        // Headings
                        ["bold", "italic", "underline", "strike"],       // Basic formatting
                        [{ color: [] }, { background: [] }],             // Text and background color
                        [{ script: "sub" }, { script: "super" }],        // Subscript/superscript
                        [{ list: "ordered" }, { list: "bullet" }],       // Lists
                        [{ indent: "-1" }, { indent: "+1" }],            // Indentation
                        [{ align: [] }],                                 // Alignment options
                        ["blockquote", "code-block"],                    // Blockquote and code
                        ["link", "image", "video"],                      // Media embeds
                        ["clean"],                                       // Remove formatting
                    ],
                }}
                placeholder="Write a detailed product description here..."
                className="bg-transparent border border-gray-700 text-white rounded-md"
                style={{
                    minHeight: "250px"
                }}
            />
            <style>
                {`
                  .ql-toolbar {
                    background: transparent;
                    border-color: #4B5563;
                  }
                  .ql-container {
                    background: transparent;
                    border-color: #4B5563;}
                    color: white;
                  .ql-picker {
                    color: white!important;
                  }
                  .ql-editor {
                      min-height: 200px;
                    }
                  .ql-snow {
                    border-color: #4B5563;
                  } 
                  .ql-editor.ql-blank::before {
                    color: #6B7280!important;
                  }
                  .ql-picker-options {
                    background: #333!important;
                    color: white!important;
                  }
                  .ql-picker-item {
                    color: white!important;
                  }
                  .ql-stroke {
                    stroke: white!important
                  }
                `}
            </style>
        </div>
    )

}