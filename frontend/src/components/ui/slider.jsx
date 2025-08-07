"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onValueChange,
  showValue = false,
  label,
  description,
  ...props
}) {
  const _values = React.useMemo(() =>
    Array.isArray(value)
      ? value
      : Array.isArray(defaultValue)
        ? defaultValue
        : [min], [value, defaultValue, min])

  const currentValue = _values[0] || min;

  return (
    <div className="space-y-3">
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {label}
              </label>
              {showValue && (
                <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md">
                  {currentValue}
                </span>
              )}
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      <SliderPrimitive.Root
        data-slot="slider"
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          "relative flex w-full touch-none items-center select-none py-4",
          disabled && "opacity-50 cursor-not-allowed",
          "data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
          className
        )}
        {...props}>
        
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "bg-gray-200 dark:bg-gray-700 relative grow overflow-hidden rounded-full",
            "data-[orientation=horizontal]:h-2 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2",
            "transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
          )}>
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn(
              "bg-gradient-to-r from-blue-500 to-purple-600 absolute rounded-full",
              "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
              "transition-all duration-200"
            )} />
        </SliderPrimitive.Track>
        
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className={cn(
              "border-2 border-blue-500 bg-white dark:bg-gray-800 shadow-lg",
              "block size-5 shrink-0 rounded-full transition-all duration-200",
              "hover:scale-110 hover:border-blue-600 hover:shadow-xl",
              "focus-visible:ring-4 focus-visible:ring-blue-500/30 focus-visible:outline-none",
              "active:scale-95",
              disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
              "disabled:pointer-events-none disabled:opacity-50"
            )} />
        ))}
      </SliderPrimitive.Root>
      
      {/* Value indicators */}
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 px-1">
        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{min}</span>
        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{max}</span>
      </div>
    </div>
  );
}

export { Slider }
