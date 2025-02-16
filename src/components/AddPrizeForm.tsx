
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
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PrizeFormData = {
  name: string;
  description: string;
  quantity: number;
  lotteryId: string;
};

export function AddPrizeForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all active and upcoming lotteries
  const { data: lotteries } = useQuery({
    queryKey: ["active-lotteries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotteries")
        .select("*")
        .eq("is_completed", false)
        .order("draw_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
  
  const form = useForm<PrizeFormData>({
    defaultValues: {
      name: "",
      description: "",
      quantity: 1,
      lotteryId: "",
    },
  });

  const onSubmit = async (data: PrizeFormData) => {
    try {
      setIsLoading(true);
      
      if (!data.lotteryId) {
        toast({
          title: "Error",
          description: "Please select a lottery",
          variant: "destructive",
        });
        return;
      }

      // Get the lottery to access its draw date
      const { data: lottery, error: lotteryError } = await supabase
        .from("lotteries")
        .select("draw_date")
        .eq("id", data.lotteryId)
        .single();

      if (lotteryError) throw lotteryError;
      
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
        draw_date: lottery.draw_date,
        created_by: session.user.id,
        lottery_id: data.lotteryId
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

  if (!lotteries || lotteries.length === 0) {
    return (
      <div className="text-center p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-800">
          No active lotteries found. Please create a lottery first.
        </p>
      </div>
    );
  }

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
          name="lotteryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lottery</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lottery" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  {lotteries.map((lottery) => (
                    <SelectItem 
                      key={lottery.id} 
                      value={lottery.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Draw date: {new Date(lottery.draw_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
