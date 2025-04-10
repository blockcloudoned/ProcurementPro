import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface CrmConnectorProps {
  name: string;
  icon?: ReactNode;
  isConnected: boolean;
  onConnect: () => void;
  isPending?: boolean;
}

const CrmConnector = ({ 
  name, 
  icon, 
  isConnected, 
  onConnect, 
  isPending = false 
}: CrmConnectorProps) => {
  return (
    <Card className={`${isConnected ? 'border-primary-200 bg-primary-50' : ''}`}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {icon}
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-neutral-500">
              {isConnected 
                ? `Connected to ${name}` 
                : `Connect to import clients from ${name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {isConnected ? (
            <div className="flex items-center text-primary-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Connected</span>
            </div>
          ) : (
            <Button 
              onClick={onConnect}
              disabled={isPending}
              size="sm"
            >
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CrmConnector;
