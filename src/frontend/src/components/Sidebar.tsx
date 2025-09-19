import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  View, 
  Text, 
  Button,
  Icon,
  Divider,
  Badge
} from 'reshaped';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics';
import { 
  Home, 
  Plus, 
  MapPin, 
  Calendar, 
  Settings, 
  User,
  Heart,
  Clock,
  TrendingUp
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const handleNavClick = (item: string) => {
    analyticsService.trackUserInteraction('click', 'sidebar_navigation', { item });
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and recent trips'
    },
    {
      name: 'Create Trip',
      href: '/create',
      icon: Plus,
      description: 'Plan a new adventure',
      highlight: true
    },
    {
      name: 'My Trips',
      href: '/trips',
      icon: MapPin,
      description: 'View all your itineraries',
      badge: '3'
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      description: 'Trip schedule and dates'
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: Heart,
      description: 'Saved places and activities'
    },
    {
      name: 'History',
      href: '/history',
      icon: Clock,
      description: 'Past travel experiences'
    }
  ];

  const bottomItems = [
    {
      name: 'Analytics',
      href: '/analytics',
      icon: TrendingUp,
      description: 'Travel insights'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      description: 'Account settings'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'App preferences'
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <View 
      backgroundColor="neutral-faded" 
      height="100vh" 
      width="256px"
      paddingBlock={4}
      paddingInline={3}
      borderColor="neutral-faded"
      borderRightWidth={1}
    >
      <View gap={6} height="100%">
        {/* User Info */}
        <View gap={3}>
          <View direction="row" align="center" gap={3} paddingInline={3}>
            <View 
              width={10} 
              height={10} 
              borderRadius="full" 
              backgroundColor="primary"
              align="center"
              justify="center"
            >
              <Text variant="body-2" weight="bold" color="primary-contrast">
                {user.displayName?.[0] || user.email?.[0] || 'U'}
              </Text>
            </View>
            <View gap={1}>
              <Text variant="body-2" weight="medium" color="neutral">
                {user.displayName || 'Solo Traveler'}
              </Text>
              <Text variant="body-3" color="neutral-faded">
                {user.email}
              </Text>
            </View>
          </View>
          <Divider />
        </View>

        {/* Main Navigation */}
        <View gap={1} grow>
          {navigationItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.href}
              onClick={() => handleNavClick(item.name.toLowerCase())}
            >
              <Button
                variant={isActivePath(item.href) ? 'solid' : 'ghost'}
                color={isActivePath(item.href) ? 'primary' : 'neutral'}
                size="medium"
                fullWidth
                justify="start"
                startIcon={<Icon svg={item.icon} />}
                endIcon={item.badge ? (
                  <Badge variant="solid" color="primary" size="small">
                    {item.badge}
                  </Badge>
                ) : undefined}
              >
                <View direction="column" align="start" gap={0}>
                  <Text variant="body-2" weight="medium">
                    {item.name}
                  </Text>
                  <Text variant="body-3" color="neutral-faded">
                    {item.description}
                  </Text>
                </View>
              </Button>
            </Link>
          ))}
        </View>

        {/* Bottom Navigation */}
        <View gap={1}>
          <Divider />
          {bottomItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.href}
              onClick={() => handleNavClick(item.name.toLowerCase())}
            >
              <Button
                variant={isActivePath(item.href) ? 'solid' : 'ghost'}
                color={isActivePath(item.href) ? 'primary' : 'neutral'}
                size="medium"
                fullWidth
                justify="start"
                startIcon={<Icon svg={item.icon} />}
              >
                <View direction="column" align="start" gap={0}>
                  <Text variant="body-2" weight="medium">
                    {item.name}
                  </Text>
                  <Text variant="body-3" color="neutral-faded">
                    {item.description}
                  </Text>
                </View>
              </Button>
            </Link>
          ))}
        </View>

        {/* Quick Actions */}
        <View gap={2} paddingTop={2}>
          <Text variant="body-3" weight="medium" color="neutral-faded" paddingInline={3}>
            Quick Actions
          </Text>
          <Link to="/create" onClick={() => handleNavClick('quick_create')}>
            <Button
              variant="solid"
              color="primary"
              size="medium"
              fullWidth
              startIcon={<Icon svg={Plus} />}
            >
              New Trip
            </Button>
          </Link>
        </View>
      </View>
    </View>
  );
};

export default Sidebar;
