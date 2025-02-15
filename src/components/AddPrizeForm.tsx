
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

type PrizeFormData = {
  name: string;
  description: string;
  quantity: number;
  drawDate: string;
};

export function AddPrizeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<PrizeFormData>({
    defaultValues: {
      name: "",
      description: "",
      quantity: 1,
      drawDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: PrizeFormData) => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to add prizes",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("prizes").insert({
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        remaining_quantity: data.quantity,
        draw_date: data.drawDate,
        created_by: session.user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prize added successfully",
      });

      form.reset();
    } catch (error) {
      console.error("Error adding prize:", error);
      toast({
        title: "Error",
        description: "Failed to add prize. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prize Name</FormLabel>
              <FormControl>
                <Input placeholder="2018 Château Margaux" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter prize description..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="drawDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Draw Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" /> Add Prize
        </Button>
      </form>
    </Form>
  );
}
