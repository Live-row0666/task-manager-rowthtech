import { useEffect, useCallback, useRef } from 'react';

const useQuillWordLimit = ({
    quillRef,
    maxWords = 1000,
    // maxWordLength = 45000,
    onLimitExceed,
    setValue, // Add setValue from react-hook-form
    fieldName = 'note', // Form field name to update
}) => {
    const skipFirstRun = useRef(true);

    const trimToWordLimit = (text, limit) => {
        const words = text.trim().split(/\s+/);
        return words.slice(0, limit).join(' ');
    };

    const handleTextChange = useCallback(
        (delta, oldDelta, source) => {
            if (source !== 'user') return;

            const editor = quillRef?.current?.getEditor?.();
            if (!editor) return;

            const text = editor.getText().trim();
            const words = text.split(/\s+/).filter(Boolean);
            const wordCount = words.length;
            // const hasLongWord = words.some(word => word.length > maxWordLength);

            if (skipFirstRun.current) {
                skipFirstRun.current = false;
                return;
            }

            // if (hasLongWord) {
            //     editor.setContents(oldDelta);
            //     onLimitExceed?.({
            //         type: 'long-word',
            //         message: `Words cannot be longer than ${maxWordLength} characters.`,
            //     });
            //     return;
            // }

            if (wordCount > maxWords) {
                // Get the allowed portion
                const limitedText = trimToWordLimit(text, maxWords);
                const htmlContent = editor.root.innerHTML; // Get the HTML content
                const limitedHtml = editor.clipboard.convert(limitedText); // Convert plain text to Quill delta
                editor.setContents(limitedHtml); // Set trimmed content in editor

                // Update the form field value
                if (setValue) {
                    setValue(fieldName, limitedText, { shouldValidate: true });
                }

                onLimitExceed?.({
                    type: 'too-many-words',
                    message: `Note cannot exceed ${maxWords} words. Extra text was removed.`,
                });
            }
        },
        [quillRef, maxWords, onLimitExceed, setValue, fieldName]
    );

    useEffect(() => {
        const editor = quillRef?.current?.getEditor?.();
        if (!editor) return;

        editor.on('text-change', handleTextChange);

        return () => {
            editor.off('text-change', handleTextChange);
        };
    }, [handleTextChange, quillRef]);
};

export default useQuillWordLimit;