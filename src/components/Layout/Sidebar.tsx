import { useState } from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
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
  badge?: number;
}

function SidebarItem({
  label,
  icon,
  active,
  hasChildren,
  expanded,
  level = 0,
  onClick,
  badge,
}: SidebarItemProps) {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
  const pl = level === 0 ? 2 : level === 1 ? 3.5 : 5;

  return (
    <ButtonBase
      onClick={onClick}
      disableRipple={!onClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.25,
        pl,
        pr: 1.5,
        justifyContent: 'flex-start',
        textAlign: 'left',
        borderRadius: '8px',
        mx: 0.75,
        position: 'relative',
        ...(active
          ? {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                borderRadius: '0 2px 2px 0',
                backgroundColor: theme.palette.primary.main,
              },
            }
          : {
              color: neutral?.[700],
              '&:hover': {
                backgroundColor: neutral?.[100],
                color: neutral?.[900],
              },
            }),
      }}
    >
      {icon && (
        <Box
          component="span"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            flexShrink: 0,
            opacity: active ? 1 : 0.85,
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        sx={{
          flex: 1,
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: 1.5,
          fontFamily: theme.typography.fontFamily,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      {badge !== undefined && badge > 0 && (
        <Box
          component="span"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 18,
            height: 18,
            px: 0.5,
            borderRadius: '9px',
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            fontSize: '11px',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {badge > 99 ? '99+' : badge}
        </Box>
      )}
      {hasChildren && (
        <Box component="span" sx={{ display: 'flex', flexShrink: 0, opacity: 0.7 }}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </Box>
      )}
    </ButtonBase>
  );
}

export default function Sidebar() {
  const theme = useTheme();
  const neutral = (theme.palette as { neutral?: Record<string, string> }).neutral;
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
    'loan-applications': <FileText size={18} />,
    'loan-origination': <Building2 size={18} />,
    'loan-servicing': <Briefcase size={18} />,
    'portfolio-recap': <LayoutDashboard size={18} />,
    pulse: <Activity size={18} />,
    'tasks-pending': <ListTodo size={18} />,
    loans: <FolderOpen size={18} />,
    'all-loans': <Home size={18} />,
    conventional: <Building size={18} />,
    commercial: <Building2 size={18} />,
    construction: <HardHat size={18} />,
    'lines-of-credit': <CreditCard size={18} />,
    other: <MoreHorizontal size={18} />,
    'loans-smartviews': <Layers size={18} />,
    properties: <Home size={18} />,
    templates: <FileStack size={18} />,
    'all-lenders': <Users size={18} />,
    'lenders-smartviews': <Layers size={18} />,
    'all-vendors': <Store size={18} />,
    'vendors-smartviews': <Layers size={18} />,
    'tasks-reports': <ClipboardList size={18} />,
    'conversation-log': <MessageSquare size={18} />,
    'text-messages': <MessageCircle size={18} />,
    'e-filing': <FileCheck size={18} />,
    '1098-mortgage': <Receipt size={18} />,
    '1099-int': <DollarSign size={18} />,
    '1099-misc': <FileSpreadsheet size={18} />,
    '1099-nec': <FileSpreadsheet size={18} />,
    't5-statements': <FileSpreadsheet size={18} />,
    'mortgage-pool': <Landmark size={18} />,
    'ach-express': <Zap size={18} />,
    marketplace: <ShoppingBag size={18} />,
    'custom-letters': <Mail size={18} />,
    'trust-accounts': <Shield size={18} />,
    'online-portals': <Globe size={18} />,
    'events-journal': <Calendar size={18} />,
    'business-contacts': <Contact size={18} />,
    'financial-calculator': <Calculator size={18} />,
    'mailing-label': <Tag size={18} />,
    'window-envelope': <Square size={18} />,
    reminders: <Bell size={18} />,
    'user-management': <UserCog size={18} />,
    'company-properties': <Settings size={18} />,
    'order-supplies': <Package size={18} />,
    'feature-request': <Star size={18} />,
  };

  return (
    <Box
      component="aside"
      sx={{
        width: 224,
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.common.white,
        borderRight: `1px solid ${neutral?.[200] ?? '#E1E7EE'}`,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <Box
        sx={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          borderBottom: `1px solid ${neutral?.[200] ?? '#E1E7EE'}`,
          backgroundColor: neutral?.[50],
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '8px',
            backgroundColor: theme.palette.common.white,
            border: `1px solid ${neutral?.[200]}`,
          }}
        >
          <Menu size={18} style={{ color: neutral?.[700] }} />
        </Box>
        <Typography
          sx={{
            fontSize: '15px',
            fontWeight: 500,
            color: neutral?.[900],
            letterSpacing: '-0.01em',
          }}
        >
          TheMortgageOffice
        </Typography>
      </Box>

      <Box
        component="nav"
        className="sidebar-scroll"
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1,
        }}
      >
        <SidebarItem
          label="Loan Applications"
          icon={iconMap['loan-applications']}
          hasChildren
          expanded={expandedSections.has('loan-applications')}
          onClick={() => toggleSection('loan-applications')}
        />

        <SidebarItem
          label="Loan Origination"
          icon={iconMap['loan-origination']}
          hasChildren
          expanded={expandedSections.has('loan-origination')}
          onClick={() => toggleSection('loan-origination')}
        />

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

        <SidebarItem
          label="Mortgage Pool Servicing"
          icon={iconMap['mortgage-pool']}
          hasChildren
        />

        <SidebarItem label="ACH Express" icon={iconMap['ach-express']} />

        <SidebarItem
          label="Marketplace"
          icon={iconMap['marketplace']}
          hasChildren
        />

        <SidebarItem
          label="Custom Letters & Reports"
          icon={iconMap['custom-letters']}
          hasChildren
        />

        <SidebarItem
          label="Trust Accounts"
          icon={iconMap['trust-accounts']}
          hasChildren
        />

        <SidebarItem
          label="Online Portals"
          icon={iconMap['online-portals']}
          hasChildren
        />

        <SidebarItem
          label="Events Journal"
          icon={iconMap['events-journal']}
        />

        <SidebarItem
          label="Business Contacts"
          icon={iconMap['business-contacts']}
          hasChildren
        />

        <SidebarItem
          label="Financial Calculator"
          icon={iconMap['financial-calculator']}
        />

        <SidebarItem
          label="Mailing Label Maintenance"
          icon={iconMap['mailing-label']}
        />

        <SidebarItem
          label="Window Envelope Alignment"
          icon={iconMap['window-envelope']}
        />

        <SidebarItem label="Reminders" icon={iconMap['reminders']} />

        <SidebarItem
          label="User Management"
          icon={iconMap['user-management']}
        />

        <SidebarItem
          label="Company Properties"
          icon={iconMap['company-properties']}
          hasChildren
        />

        <SidebarItem
          label="Order Supplies"
          icon={iconMap['order-supplies']}
        />

        <Box
          sx={{
            borderTop: `1px solid ${neutral?.[200]}`,
            mt: 1,
            pt: 1,
          }}
        >
          <SidebarItem
            label="Feature Request"
            icon={iconMap['feature-request']}
          />
        </Box>
      </Box>
    </Box>
  );
}
