import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Form schema for pricing and terms
const pricingTermsSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().min(1, "Currency is required"),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  validityPeriod: z.string().min(1, "Validity period is required"),
  includesTax: z.boolean().default(false),
  additionalTerms: z.string().optional(),
});

type PricingTermsFormValues = z.infer<typeof pricingTermsSchema>;

interface PricingTermsProps {
  proposalData: any;
  updateProposalData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PricingTerms = ({ proposalData, updateProposalData, onNext, onPrev }: PricingTermsProps) => {
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<PricingTermsFormValues>({
    resolver: zodResolver(pricingTermsSchema),
    defaultValues: {
      amount: proposalData.amount || "",
      currency: "USD",
      paymentTerms: "Net 30",
      validityPeriod: "30 days",
      includesTax: false,
      additionalTerms: "",
    },
  });

  // Form submission
  const onSubmit = (data: PricingTermsFormValues) => {
    // Update proposal with pricing and terms data
    const updatedContent = {
      ...proposalData.content,
      pricing: {
        amount: data.amount,
        currency: data.currency,
        paymentTerms: data.paymentTerms,
        validityPeriod: data.validityPeriod,
        includesTax: data.includesTax,
        additionalTerms: data.additionalTerms,
      }
    };
    
    updateProposalData({
      amount: data.amount,
      content: updatedContent,
    });
    
    toast({
      title: "Pricing and terms saved",
      description: "Your pricing and terms have been saved.",
    });
    
    onNext();
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-neutral-900 mb-4">
        Pricing & Terms
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-neutral-500 sm:text-sm">$</span>
                            </div>
                            <Input 
                              type="text" 
                              placeholder="0.00" 
                              {...field} 
                              className="pl-7"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Total proposal amount
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h4 className="text-base font-medium mb-4">Payment Terms</h4>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                            <SelectItem value="Net 15">Net 15</SelectItem>
                            <SelectItem value="Net 30">Net 30</SelectItem>
                            <SelectItem value="Net 45">Net 45</SelectItem>
                            <SelectItem value="Net 60">Net 60</SelectItem>
                            <SelectItem value="50% Upfront, 50% on Completion">50% Upfront, 50% on Completion</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormField
                    control={form.control}
                    name="validityPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposal Validity</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select validity period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15 days">15 days</SelectItem>
                            <SelectItem value="30 days">30 days</SelectItem>
                            <SelectItem value="45 days">45 days</SelectItem>
                            <SelectItem value="60 days">60 days</SelectItem>
                            <SelectItem value="90 days">90 days</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <FormField
                      control={form.control}
                      name="includesTax"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Price includes tax</FormLabel>
                            <FormDescription>
                              Toggle if the quoted amount includes applicable taxes
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="additionalTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any additional terms and conditions specific to this proposal..." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      These terms will be included in the final proposal document
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrev}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              Continue to Review
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PricingTerms;
