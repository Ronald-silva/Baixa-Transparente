import React, { useState, useCallback } from 'react';
import { masks } from '../../utils/masks';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: 'currency' | 'cpf' | 'cnpj' | 'phone' | 'none';
  value: string;
  onChange: (value: string, unmaskedValue: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  value,
  onChange,
  label,
  error,
  required,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let maskedValue = inputValue;
    let unmaskedValue = inputValue;

    switch (mask) {
      case 'currency':
        maskedValue = masks.currency(inputValue);
        unmaskedValue = masks.currencyToNumber(maskedValue).toString();
        break;
      case 'cpf':
        maskedValue = masks.cpf(inputValue);
        unmaskedValue = masks.unmask(maskedValue);
        break;
      case 'cnpj':
        maskedValue = masks.cnpj(inputValue);
        unmaskedValue = masks.unmask(maskedValue);
        break;
      case 'phone':
        maskedValue = masks.phone(inputValue);
        unmaskedValue = masks.unmask(maskedValue);
        break;
      default:
        unmaskedValue = inputValue;
    }

    onChange(maskedValue, unmaskedValue);
  }, [mask, onChange]);

  const baseClasses = `
    w-full px-5 py-4 bg-white/5 border rounded-xl outline-none 
    text-sm text-white placeholder:text-white/20 transition-all 
    hover:border-white/20 focus:bg-white/[0.08]
    ${error 
      ? 'border-rose-500/50 focus:border-rose-500' 
      : 'border-white/10 focus:border-[#c5a059]'
    }
    ${mask === 'currency' ? 'font-mono text-lg' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs uppercase tracking-wider font-semibold text-[#c5a059]">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          {...props}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={baseClasses}
          autoComplete="off"
        />
        
        {mask === 'currency' && !focused && !value && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none font-mono text-lg">
            R$ 0,00
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-rose-400"></span>
          {error}
        </p>
      )}
    </div>
  );
};