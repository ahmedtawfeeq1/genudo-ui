
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

interface KeyConditionPair {
  key: string;
  condition: string;
}

interface KeyConditionEditorProps {
  value: any;
  onChange: (value: any) => void;
  label?: string;
}

const KeyConditionEditor: React.FC<KeyConditionEditorProps> = ({ value, onChange, label }) => {
  const [pairs, setPairs] = useState<KeyConditionPair[]>([{ key: '', condition: '' }]);

  useEffect(() => {
    if (Array.isArray(value)) {
      // If value is already an array (backwards compat? ignore and convert)
      if (value.length === 0) {
        setPairs([{ key: '', condition: '' }]);
      } else if (value.length > 0) {
        setPairs(value);
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Convert object to pairs
      const newPairs = Object.entries(value).map(([key, condition]) => ({
        key,
        condition: String(condition)
      }));
      setPairs(newPairs.length > 0 ? newPairs : [{ key: '', condition: '' }]);
    } else {
      setPairs([{ key: '', condition: '' }]);
    }
  }, [value]);

  const updatePairs = (newPairs: KeyConditionPair[]) => {
    setPairs(newPairs);
    // Output as object with only filled keys
    const jsonObject: any = {};
    newPairs.forEach(pair => {
      if (pair.key.trim()) {
        jsonObject[pair.key.trim()] = pair.condition.trim();
      }
    });
    onChange(Object.keys(jsonObject).length > 0 ? jsonObject : null);
  };

  const addPair = () => {
    updatePairs([...pairs, { key: '', condition: '' }]);
  };

  const removePair = (index: number) => {
    if (pairs.length > 1) {
      updatePairs(pairs.filter((_, i) => i !== index));
    }
  };

  const updatePair = (index: number, field: 'key' | 'condition', v: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: v };
    updatePairs(newPairs);
  };

  return (
    <div className="space-y-4">
      {label && <Label>{label}</Label>}
      <div className="space-y-3">
        {pairs.map((pair, index) => (
          <Card key={index} className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor={`key-${index}`} className="text-sm">Key</Label>
                  <Input
                    id={`key-${index}`}
                    value={pair.key}
                    onChange={(e) => updatePair(index, 'key', e.target.value)}
                    placeholder="Enter key"
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`condition-${index}`} className="text-sm">Condition</Label>
                  <Input
                    id={`condition-${index}`}
                    value={pair.condition}
                    onChange={(e) => updatePair(index, 'condition', e.target.value)}
                    placeholder="Enter condition"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePair(index)}
                  disabled={pairs.length === 1}
                  className="mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={addPair}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Key-Condition Pair
      </Button>
    </div>
  );
};

export default KeyConditionEditor;
