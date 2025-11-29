
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Inbox, Workflow, Users, HelpCircle, Sparkles, ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';

const navigation = [
  {
    name: 'Pipelines',
    href: '/pipelines',
    icon: Workflow
  },
  {
    name: 'Agents',
    href: '/agents',
    icon: Bot
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: Users
  },
  {
    name: 'Inboxes',
    href: '/inboxes',
    icon: Inbox
  }
  // {
  //   name: 'Help',
  //   href: '/help',
  //   icon: HelpCircle
  // }
];

const ModernSidebar = () => {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isMagicPipelinePage = location.pathname === '/magic-pipeline';

  const handleToggleSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="w-56">
      <SidebarHeader>
        <div className="flex items-center justify-between px-[2px] py-[23px]">
          <div className="flex items-center justify-center w-full">
            {state === "expanded" ? (
              <img 
                alt="GenuDo Logo" 
                className="h-12 w-auto object-contain" 
                src="/genudo-main-logo.png" 
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  alt="GenuDo" 
                  src="/genudo-main-logo.png" 
                  className="w-20 h-20 object-contain" 
                />
              </div>
            )}
          </div>
          
          {state === "expanded" && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleToggleSidebar} 
              className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = item.href === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.href);
                const isAIFeature = 'isAI' in item && item.isAI;
                const isNewFeature = 'isNew' in item && item.isNew;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      className={cn(
                        isActive 
                          ? 'bg-primary/10 text-primary font-medium hover:bg-primary/15' 
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        isAIFeature && [
                          isActive 
                            ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-900 border border-purple-200' 
                            : 'text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-900 border border-transparent hover:border-purple-200',
                          'transition-all duration-200'
                        ],
                        'transition-all duration-200'
                      )}
                    >
                      <Link to={item.href} className="flex items-center gap-2 w-full relative">
                        <item.icon 
                          className={cn(
                            'h-5 w-5 flex-shrink-0',
                            isActive ? 'text-primary' : 'text-muted-foreground',
                            isAIFeature && isActive ? 'text-purple-600' : '',
                            isAIFeature && !isActive ? 'text-purple-500' : ''
                          )} 
                        />
                        <span className="flex-1">{item.name}</span>
                        {isNewFeature && state === "expanded" && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            AI
                          </span>
                        )}
                        {isAIFeature && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-ping"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        {state === "expanded" && (
          <div className="px-2 pb-2">
            <div className="block" aria-disabled="true">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-3 text-white text-xs cursor-not-allowed shadow-lg">
                <div className="flex justify-end mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20">Coming Soon!</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold">AI-Powered</span>
                </div>
                <p className="opacity-90 leading-relaxed">
                  Try the new Magic Pipeline - create and modify sales pipelines with natural language!
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced expand button when collapsed - fixed blinking animation */}
        {state === "collapsed" && (
          <div className="flex justify-center px-2 pb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleToggleSidebar} 
              className={cn(
                "transition-all duration-200 rounded-xl shadow-md",
                isMagicPipelinePage 
                  ? "h-16 w-16 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:shadow-lg" 
                  : "h-12 w-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 hover:shadow-lg"
              )}
              title="Expand Sidebar"
            >
              <ChevronRight className={isMagicPipelinePage ? "h-8 w-8" : "h-6 w-6"} />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ModernSidebar;
