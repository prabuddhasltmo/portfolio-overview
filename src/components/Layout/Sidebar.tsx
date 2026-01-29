import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Building2,
  Briefcase,
  LayoutDashboard,
  Activity,
  ListTodo,
  FolderOpen,
  Home,
  Building,
  HardHat,
  CreditCard,
  MoreHorizontal,
  Users,
  FileStack,
  Landmark,
  Store,
  ClipboardList,
  MessageSquare,
  MessageCircle,
  FileCheck,
  Receipt,
  DollarSign,
  FileSpreadsheet,
  Layers,
  Zap,
  ShoppingBag,
  Mail,
  Shield,
  Globe,
  Calendar,
  Contact,
  Calculator,
  Tag,
  Square,
  Bell,
  UserCog,
  Settings,
  Package,
  Menu,
  Star,
} from 'lucide-react';

interface SidebarItemProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
  level?: number;
  onClick?: () => void;
}

function SidebarItem({
  label,
  icon,
  active,
  hasChildren,
  expanded,
  level = 0,
  onClick,
}: SidebarItemProps) {
  const paddingLeft = level === 0 ? 'pl-3' : level === 1 ? 'pl-6' : 'pl-9';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 py-1.5 ${paddingLeft} pr-3 text-[13px] text-left transition-colors relative ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400" />
      )}
      {icon && <span className="w-4 h-4 flex-shrink-0 opacity-80">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      {hasChildren && (
        <span className="w-4 h-4 flex-shrink-0 opacity-60">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
      )}
    </button>
  );
}

export default function Sidebar() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['loan-servicing', 'loans'])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const iconMap: Record<string, React.ReactNode> = {
    'loan-applications': <FileText size={15} />,
    'loan-origination': <Building2 size={15} />,
    'loan-servicing': <Briefcase size={15} />,
    'portfolio-recap': <LayoutDashboard size={15} />,
    pulse: <Activity size={15} />,
    'tasks-pending': <ListTodo size={15} />,
    loans: <FolderOpen size={15} />,
    'all-loans': <Home size={15} />,
    conventional: <Building size={15} />,
    commercial: <Building2 size={15} />,
    construction: <HardHat size={15} />,
    'lines-of-credit': <CreditCard size={15} />,
    other: <MoreHorizontal size={15} />,
    'loans-smartviews': <Layers size={15} />,
    properties: <Home size={15} />,
    templates: <FileStack size={15} />,
    'all-lenders': <Users size={15} />,
    'lenders-smartviews': <Layers size={15} />,
    'all-vendors': <Store size={15} />,
    'vendors-smartviews': <Layers size={15} />,
    'tasks-reports': <ClipboardList size={15} />,
    'conversation-log': <MessageSquare size={15} />,
    'text-messages': <MessageCircle size={15} />,
    'e-filing': <FileCheck size={15} />,
    '1098-mortgage': <Receipt size={15} />,
    '1099-int': <DollarSign size={15} />,
    '1099-misc': <FileSpreadsheet size={15} />,
    '1099-nec': <FileSpreadsheet size={15} />,
    't5-statements': <FileSpreadsheet size={15} />,
    'mortgage-pool': <Landmark size={15} />,
    'ach-express': <Zap size={15} />,
    marketplace: <ShoppingBag size={15} />,
    'custom-letters': <Mail size={15} />,
    'trust-accounts': <Shield size={15} />,
    'online-portals': <Globe size={15} />,
    'events-journal': <Calendar size={15} />,
    'business-contacts': <Contact size={15} />,
    'financial-calculator': <Calculator size={15} />,
    'mailing-label': <Tag size={15} />,
    'window-envelope': <Square size={15} />,
    reminders: <Bell size={15} />,
    'user-management': <UserCog size={15} />,
    'company-properties': <Settings size={15} />,
    'order-supplies': <Package size={15} />,
    'feature-request': <Star size={15} />,
  };

  return (
    <aside className="w-52 bg-slate-900 flex flex-col h-screen flex-shrink-0">
      {/* Logo */}
      <div className="h-11 flex items-center gap-2 px-3 border-b border-slate-700">
        <Menu size={18} className="text-white" />
        <span className="text-white font-semibold text-sm tracking-tight">TheMortgageOffice</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-1">
        {/* Loan Applications */}
        <SidebarItem
          label="Loan Applications"
          icon={iconMap['loan-applications']}
          hasChildren
          expanded={expandedSections.has('loan-applications')}
          onClick={() => toggleSection('loan-applications')}
        />

        {/* Loan Origination */}
        <SidebarItem
          label="Loan Origination"
          icon={iconMap['loan-origination']}
          hasChildren
          expanded={expandedSections.has('loan-origination')}
          onClick={() => toggleSection('loan-origination')}
        />

        {/* Loan Servicing */}
        <SidebarItem
          label="Loan Servicing"
          icon={iconMap['loan-servicing']}
          hasChildren
          expanded={expandedSections.has('loan-servicing')}
          onClick={() => toggleSection('loan-servicing')}
        />
        {expandedSections.has('loan-servicing') && (
          <>
            <SidebarItem
              label="Portfolio Recap"
              icon={iconMap['portfolio-recap']}
              active
              level={1}
            />
            <SidebarItem label="Pulse" icon={iconMap['pulse']} level={1} />
            <SidebarItem
              label="Tasks Pending"
              icon={iconMap['tasks-pending']}
              level={1}
            />
            <SidebarItem
              label="Loans"
              icon={iconMap['loans']}
              hasChildren
              expanded={expandedSections.has('loans')}
              level={1}
              onClick={() => toggleSection('loans')}
            />
            {expandedSections.has('loans') && (
              <>
                <SidebarItem
                  label="All Loans"
                  icon={iconMap['all-loans']}
                  level={2}
                />
                <SidebarItem
                  label="Conventional"
                  icon={iconMap['conventional']}
                  level={2}
                />
                <SidebarItem
                  label="Commercial"
                  icon={iconMap['commercial']}
                  level={2}
                />
                <SidebarItem
                  label="Construction"
                  icon={iconMap['construction']}
                  level={2}
                />
                <SidebarItem
                  label="Lines of Credit"
                  icon={iconMap['lines-of-credit']}
                  level={2}
                />
                <SidebarItem label="Other" icon={iconMap['other']} level={2} />
                <SidebarItem
                  label="Loans SmartViews"
                  icon={iconMap['loans-smartviews']}
                  hasChildren
                  level={2}
                />
              </>
            )}
            <SidebarItem
              label="Properties"
              icon={iconMap['properties']}
              hasChildren
              level={1}
            />
            <SidebarItem
              label="Templates"
              icon={iconMap['templates']}
              level={1}
            />
            <SidebarItem
              label="All Lenders"
              icon={iconMap['all-lenders']}
              level={1}
            />
            <SidebarItem
              label="Lenders SmartViews"
              icon={iconMap['lenders-smartviews']}
              hasChildren
              level={1}
            />
            <SidebarItem
              label="All Vendors"
              icon={iconMap['all-vendors']}
              level={1}
            />
            <SidebarItem
              label="Vendors SmartViews"
              icon={iconMap['vendors-smartviews']}
              hasChildren
              level={1}
            />
            <SidebarItem
              label="Tasks & Reports"
              icon={iconMap['tasks-reports']}
              level={1}
            />
            <SidebarItem
              label="Conversation Log"
              icon={iconMap['conversation-log']}
              level={1}
            />
            <SidebarItem
              label="Text Messages"
              icon={iconMap['text-messages']}
              level={1}
            />
            <SidebarItem
              label="E-Filing"
              icon={iconMap['e-filing']}
              level={1}
            />
            <SidebarItem
              label="1098 Mortgage Interest Statem..."
              icon={iconMap['1098-mortgage']}
              level={1}
            />
            <SidebarItem
              label="1099-INT Interest Income"
              icon={iconMap['1099-int']}
              level={1}
            />
            <SidebarItem
              label="1099-MISC Miscellaneous Inco..."
              icon={iconMap['1099-misc']}
              level={1}
            />
            <SidebarItem
              label="1099-NEC Nonemployee Comp..."
              icon={iconMap['1099-nec']}
              level={1}
            />
            <SidebarItem
              label="T5-Statements of Investment I..."
              icon={iconMap['t5-statements']}
              level={1}
            />
          </>
        )}

        {/* Mortgage Pool Servicing */}
        <SidebarItem
          label="Mortgage Pool Servicing"
          icon={iconMap['mortgage-pool']}
          hasChildren
        />

        {/* ACH Express */}
        <SidebarItem label="ACH Express" icon={iconMap['ach-express']} />

        {/* Marketplace */}
        <SidebarItem
          label="Marketplace"
          icon={iconMap['marketplace']}
          hasChildren
        />

        {/* Custom Letters & Reports */}
        <SidebarItem
          label="Custom Letters & Reports"
          icon={iconMap['custom-letters']}
          hasChildren
        />

        {/* Trust Accounts */}
        <SidebarItem
          label="Trust Accounts"
          icon={iconMap['trust-accounts']}
          hasChildren
        />

        {/* Online Portals */}
        <SidebarItem
          label="Online Portals"
          icon={iconMap['online-portals']}
          hasChildren
        />

        {/* Events Journal */}
        <SidebarItem
          label="Events Journal"
          icon={iconMap['events-journal']}
        />

        {/* Business Contacts */}
        <SidebarItem
          label="Business Contacts"
          icon={iconMap['business-contacts']}
          hasChildren
        />

        {/* Financial Calculator */}
        <SidebarItem
          label="Financial Calculator"
          icon={iconMap['financial-calculator']}
        />

        {/* Mailing Label Maintenance */}
        <SidebarItem
          label="Mailing Label Maintenance"
          icon={iconMap['mailing-label']}
        />

        {/* Window Envelope Alignment */}
        <SidebarItem
          label="Window Envelope Alignment"
          icon={iconMap['window-envelope']}
        />

        {/* Reminders */}
        <SidebarItem label="Reminders" icon={iconMap['reminders']} />

        {/* User Management */}
        <SidebarItem
          label="User Management"
          icon={iconMap['user-management']}
        />

        {/* Company Properties */}
        <SidebarItem
          label="Company Properties"
          icon={iconMap['company-properties']}
          hasChildren
        />

        {/* Order Supplies */}
        <SidebarItem
          label="Order Supplies"
          icon={iconMap['order-supplies']}
        />

        {/* Feature Request */}
        <div className="border-t border-slate-700 mt-1 pt-1">
          <SidebarItem
            label="Feature Request"
            icon={iconMap['feature-request']}
          />
        </div>
      </nav>
    </aside>
  );
}
