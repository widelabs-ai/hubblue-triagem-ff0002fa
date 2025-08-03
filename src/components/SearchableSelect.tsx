
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
  label: string;
  options: string[];
  selectedItems: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  placeholder: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  selectedItems,
  onAddItem,
  onRemoveItem,
  placeholder,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    option =>
      !selectedItems.includes(option) &&
      option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddItem = (item: string) => {
    onAddItem(item);
    setSearchTerm('');
    setIsOpen(false); // Fechar dropdown após seleção
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim() && !selectedItems.includes(searchTerm.trim())) {
      e.preventDefault();
      onAddItem(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false); // Fechar dropdown após adicionar novo item
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className={className} ref={containerRef}>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="text-xs h-8 pr-8"
            required
          />
          <ChevronDown 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
        
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option}
                className="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
                onClick={() => handleAddItem(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              {item}
              <button
                onClick={() => onRemoveItem(item)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
