import React from 'react'

const InputField = ({ Icon, type, placeholder, value, onChange, rightElement, required=true }) => {
  return (
    <div className='input-field-wrapper'>
      {Icon && <Icon className="input-icon" size={20} />}
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {rightElement && (
        <div className='right-element'>
          {rightElement}
        </div>
      )}
    </div>
  )
}

export default InputField