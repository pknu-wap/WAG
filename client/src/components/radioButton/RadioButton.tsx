interface RadioButtonProps {
  id: string;
  label: string;
  value: string;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  checked?: boolean;
}

const RadioButton = ({
  id,
  label,
  value,
  name,
  onChange,
  checked,
}: RadioButtonProps) => (
  <div className="flex items-center ps-4 border border-gray-200 rounded shadow-sm">
    <input
      id={id}
      type="radio"
      value={value}
      name={name}
      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
      onChange={onChange}
      checked={checked}
    />

    <label htmlFor={id} className="w-full py-4 text-xl font-medium text-gray-900">

      {label}
    </label>
  </div>
);

export default RadioButton;
