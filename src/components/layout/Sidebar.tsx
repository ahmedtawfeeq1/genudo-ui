
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Inbox, 
  Workflow, 
  Users,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const navigation = [
  { name: 'Magic Pipeline', href: '/magic-pipeline', icon: Sparkles, isNew: true, isAI: true },
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pipelines', href: '/pipelines', icon: Workflow },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Inboxes', href: '/inboxes', icon: Inbox },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 relative">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Workflow className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Genudo</h1>
          </div>
        </div>
        <nav className="mt-8 flex-1 space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = item.href === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.href);
            const isAIFeature = 'isAI' in item && item.isAI;
            const isNewFeature = 'isNew' in item && item.isNew;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? isAIFeature 
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-900 border border-purple-200'
                      : 'bg-gray-100 text-gray-900'
                    : isAIFeature
                      ? 'text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-900 border border-transparent hover:border-purple-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md relative transition-all duration-200'
                )}
              >
                <item.icon
                  className={cn(
                    isActive 
                      ? isAIFeature ? 'text-purple-600' : 'text-gray-500' 
                      : isAIFeature ? 'text-purple-500 group-hover:text-purple-600' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isAIFeature && 'animate-pulse'
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {isNewFeature && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white animate-pulse">
                    AI
                  </span>
                )}
                {isAIFeature && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-ping"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* AI Magic Indicator */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-3 text-white text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="font-semibold">AI-Powered</span>
            </div>
            <p className="opacity-90 leading-relaxed">
              Try the new Magic Pipeline - create and modify sales pipelines with natural language!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
