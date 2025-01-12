"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandItem,
  CommandEmpty,
  CommandList,
  CommandInput
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, X } from "lucide-react"
import React, { useState } from "react"

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const clearAll = () => {
    onChange([])
    setSearchQuery("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.map((item) => (
              <Badge
                variant="secondary"
                key={item}
                className="mr-1 mb-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelect(item)
                }}
              >
                {item}
                <X className="ml-1 h-3 w-3 hover:text-destructive" />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" >
        <Command>
          <CommandInput
            placeholder="Search items..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-60 overflow-auto">
            <CommandEmpty>No results found.</CommandEmpty>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option}
                onSelect={() => handleSelect(option)}
                className="flex items-center gap-2 m-2"
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => handleSelect(option)}
                />
                {option}
                {selected.includes(option) && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandList>
            <div className="border-t">
              <Button
                variant="ghost"
                className="w-full justify-center text-sm"
                onClick={clearAll}
              >
                Clear all
              </Button>
            </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
