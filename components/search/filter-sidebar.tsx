"use client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { SearchFilters } from "@/lib/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FilterSidebarProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const cuisineOptions = ["Pakistani", "BBQ", "Continental", "Italian", "Chinese", "Fast Food", "Desserts", "Asian"]

  const priceLevels = ["₨", "₨₨", "₨₨₨", "₨₨₨₨"]

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    const newCuisines = checked ? [...filters.cuisine, cuisine] : filters.cuisine.filter((c) => c !== cuisine)

    onChange({ ...filters, cuisine: newCuisines })
  }

  const handlePriceLevelChange = (level: string, checked: boolean) => {
    const newPriceLevels = checked ? [...filters.priceLevel, level] : filters.priceLevel.filter((p) => p !== level)

    onChange({ ...filters, priceLevel: newPriceLevels })
  }

  const clearFilters = () => {
    onChange({
      city: "",
      cuisine: [],
      halal: null,
      priceLevel: [],
    })
  }

  return (
    <div className="w-full md:w-80 bg-card rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold font-poppins">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-xl">
          Clear All
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["cuisine", "price", "dietary"]} className="w-full">
        <AccordionItem value="cuisine" className="border-b">
          <AccordionTrigger className="text-sm font-medium">Cuisine Type</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {cuisineOptions.map((cuisine) => (
                <div key={cuisine} className="flex items-center space-x-2">
                  <Checkbox
                    id={cuisine}
                    checked={filters.cuisine.includes(cuisine)}
                    onCheckedChange={(checked) => handleCuisineChange(cuisine, checked as boolean)}
                    className="rounded-md"
                  />
                  <Label htmlFor={cuisine} className="text-sm cursor-pointer">
                    {cuisine}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border-b">
          <AccordionTrigger className="text-sm font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {priceLevels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={level}
                    checked={filters.priceLevel.includes(level)}
                    onCheckedChange={(checked) => handlePriceLevelChange(level, checked as boolean)}
                    className="rounded-md"
                  />
                  <Label htmlFor={level} className="text-sm cursor-pointer">
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="dietary" className="border-b-0">
          <AccordionTrigger className="text-sm font-medium">Dietary Options</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="halal"
                  checked={filters.halal === true}
                  onCheckedChange={(checked) => onChange({ ...filters, halal: checked ? true : null })}
                  className="rounded-md"
                />
                <Label htmlFor="halal" className="text-sm cursor-pointer">
                  Halal Only
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
