import { useState, useEffect } from "react";

const CustomSelect = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isCustomInput, setIsCustomInput] = useState(false);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleSelect = (option) => {
    setSelected(option.label);
    onChange(option.value);
    setIsOpen(false);
    setIsCustomInput(false);
    setInputValue("");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleCustomInput = () => {
    if (inputValue.trim()) {
      setSelected(inputValue);
      onChange(inputValue);
      setIsOpen(false);
      setIsCustomInput(false);
      setInputValue("");
    }
  };

  return (
    <div className="relative inline-block w-full">
      <button
        type="button"
        className="flex justify-between items-center w-full px-3 py-2 border bg-gray-50 dark:bg-zinc-800 text-black dark:text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected || "Choose a role"}
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 border rounded-md shadow-lg">
          <div className="sticky top-0 bg-white dark:bg-zinc-800 border-b">
            <button
              type="button"
              className="w-full px-4 py-2 text-indigo-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsCustomInput(true)}
            >
              Custom Role
            </button>
          </div>

          {isCustomInput && (
            <div className="px-4 py-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type and press Enter"
                className="w-full px-2 py-1 border rounded-md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomInput();
                  }
                }}
              />
              <button
                type="button"
                className="mt-2 px-2 py-1 bg-indigo-600 text-white rounded-md"
                onClick={handleCustomInput}
              >
                Add Role
              </button>
            </div>
          )}

          <div className="overflow-y-auto max-h-48">
            <ul>
              {options.map((option) => (
                <li
                  key={option.value}
                  className="px-4 py-2 hover:bg-indigo-700 hover:text-white cursor-pointer rounded-md"
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
