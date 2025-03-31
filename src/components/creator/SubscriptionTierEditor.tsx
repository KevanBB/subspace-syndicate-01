'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

const tierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.string().transform(val => parseFloat(val)),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  benefits: z.array(z.string()).min(1, 'At least one benefit is required'),
});

type TierFormData = z.infer<typeof tierSchema>;

interface SubscriptionTierEditorProps {
  tiers: TierFormData[];
  onAdd: (tier: TierFormData) => void;
  onRemove: (index: number) => void;
}

export function SubscriptionTierEditor({
  tiers,
  onAdd,
  onRemove,
}: SubscriptionTierEditorProps) {
  const [newBenefit, setNewBenefit] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
  });

  const onSubmit = (data: TierFormData) => {
    onAdd({
      ...data,
      benefits,
    });
    reset();
    setBenefits([]);
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tier Name</label>
              <Input
                {...register('name')}
                placeholder="e.g., Basic, Premium, VIP"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Monthly Price ($)</label>
              <Input
                type="number"
                step="0.01"
                min="1"
                {...register('price')}
                placeholder="e.g., 9.99"
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Describe what subscribers get with this tier"
                className="min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Benefits</label>
              <div className="flex gap-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddBenefit}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-muted p-2 rounded"
                  >
                    <span className="flex-1">{benefit}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBenefit(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {errors.benefits && (
                <p className="text-sm text-red-500">{errors.benefits.message}</p>
              )}
            </div>
            <Button type="submit" disabled={benefits.length === 0}>
              Add Tier
            </Button>
          </form>
        </CardContent>
      </Card>

      {tiers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Tiers</h3>
          {tiers.map((tier, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{tier.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${tier.price}/month
                    </p>
                    <p className="mt-2">{tier.description}</p>
                    <ul className="mt-2 space-y-1">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm">• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 