import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
}

const Sidebar = ({ isOpen = true }: SidebarProps) => {
  const [location] = useLocation();

  const isActiveRoute = (route: string) => {
    if (route === "/" && location === "/") return true;
    if (route !== "/" && location.startsWith(route)) return true;
    return false;
  };

  return (
    <div className={cn(
      "md:flex md:flex-shrink-0",
      isOpen ? "block" : "hidden"
    )}>
      <div className="flex flex-col w-64 border-r border-neutral-200 bg-white">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
          <h1 className="text-xl font-bold text-white">ProposalForge</h1>
        </div>
        <div className="h-0 flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link href="/">
              <a className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActiveRoute("/")
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </a>
            </Link>
            <Link href="/my-proposals">
              <a className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActiveRoute("/my-proposals")
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                My Proposals
              </a>
            </Link>
            <Link href="/templates">
              <a className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActiveRoute("/templates")
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Templates
              </a>
            </Link>
            <Link href="/crm-integration">
              <a className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActiveRoute("/crm-integration")
                  ? "bg-primary-50 text-primary-600"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
                CRM Integration
              </a>
            </Link>
            <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Help & Support
            </a>
          </nav>
          <div className="border-t border-neutral-200 p-4">
            <a href="#" className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
