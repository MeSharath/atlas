import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  View, 
  Button, 
  Text, 
  Avatar, 
  Dropdown, 
  Icon,
  Hidden,
  Container
} from 'reshaped';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics';
import { 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  MapPin,
  Plus,
  Home
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      analyticsService.trackEvent('user_signout', { source: 'header' });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavClick = (item: string) => {
    analyticsService.trackUserInteraction('click', 'navigation', { item });
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <View
      position="fixed"
      insetTop={0}
      insetInline={0}
      zIndex={50}
      backgroundColor="neutral-faded"
      borderColor="neutral-faded"
      borderBottomWidth={1}
      paddingBlock={3}
    >
      <Container maxWidth="7xl">
        <View direction="row" align="center" justify="space-between">
          {/* Logo */}
          <View direction="row" align="center" gap={2}>
            <Link to="/" onClick={() => handleNavClick('logo')}>
              <View direction="row" align="center" gap={2}>
                <Icon svg={MapPin} size={8} color="primary" />
                <Text variant="title-4" weight="bold" color="primary">
                  SoloAI
                </Text>
              </View>
            </Link>
          </View>

          {/* Desktop Navigation */}
          <Hidden below="s">
            <View direction="row" align="center" gap={6}>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => handleNavClick('dashboard')}>
                    <Button
                      variant={isActivePath('/dashboard') ? 'solid' : 'ghost'}
                      color={isActivePath('/dashboard') ? 'primary' : 'neutral'}
                      startIcon={<Icon svg={Home} />}
                    >
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Link to="/create" onClick={() => handleNavClick('create')}>
                    <Button
                      variant={isActivePath('/create') ? 'solid' : 'ghost'}
                      color={isActivePath('/create') ? 'primary' : 'neutral'}
                      startIcon={<Icon svg={Plus} />}
                    >
                      Create Trip
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" onClick={() => handleNavClick('home')}>
                    <Button
                      variant={isActivePath('/') ? 'solid' : 'ghost'}
                      color={isActivePath('/') ? 'primary' : 'neutral'}
                    >
                      Home
                    </Button>
                  </Link>
                  
                  <a href="#features" onClick={() => handleNavClick('features')}>
                    <Button variant="ghost" color="neutral">
                      Features
                    </Button>
                  </a>
                  
                  <a href="#how-it-works" onClick={() => handleNavClick('how-it-works')}>
                    <Button variant="ghost" color="neutral">
                      How It Works
                    </Button>
                  </a>
                </>
              )}
            </View>
          </Hidden>

          {/* User Menu / Auth Buttons */}
          <View direction="row" align="center" gap={3}>
            {user ? (
              <Dropdown>
                <Dropdown.Trigger>
                  <Button variant="ghost" color="neutral">
                    <View direction="row" align="center" gap={2}>
                      <Avatar
                        src={user.photoURL || undefined}
                        fallback={user.displayName?.[0] || user.email?.[0] || 'U'}
                        size={8}
                      />
                      <Hidden below="s">
                        <Text variant="body-2" weight="medium">
                          {user.displayName || user.email?.split('@')[0]}
                        </Text>
                      </Hidden>
                    </View>
                  </Button>
                </Dropdown.Trigger>
                
                <Dropdown.Content>
                  <Dropdown.Item
                    startIcon={<Icon svg={Settings} />}
                    onClick={() => {
                      handleNavClick('profile');
                      navigate('/profile');
                    }}
                  >
                    Profile & Settings
                  </Dropdown.Item>
                  
                  <Dropdown.Item
                    startIcon={<Icon svg={LogOut} />}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Content>
              </Dropdown>
            ) : (
              <View direction="row" align="center" gap={3}>
                <Link to="/login" onClick={() => handleNavClick('login')}>
                  <Button variant="ghost" color="neutral">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => handleNavClick('signup')}>
                  <Button variant="solid" color="primary">
                    Get Started
                  </Button>
                </Link>
              </View>
            )}

            {/* Mobile menu button */}
            <Hidden above="s">
              <Button
                variant="ghost"
                color="neutral"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Icon svg={isMobileMenuOpen ? X : Menu} />
              </Button>
            </Hidden>
          </View>
        </View>
      </Container>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <Hidden above="s">
          <View
            backgroundColor="neutral-faded"
            borderColor="neutral-faded"
            borderTopWidth={1}
            paddingBlock={4}
            paddingInline={4}
          >
            <View gap={2}>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => handleNavClick('dashboard')}>
                    <Button
                      variant={isActivePath('/dashboard') ? 'solid' : 'ghost'}
                      color={isActivePath('/dashboard') ? 'primary' : 'neutral'}
                      startIcon={<Icon svg={Home} />}
                      fullWidth
                    >
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Link to="/create" onClick={() => handleNavClick('create')}>
                    <Button
                      variant={isActivePath('/create') ? 'solid' : 'ghost'}
                      color={isActivePath('/create') ? 'primary' : 'neutral'}
                      startIcon={<Icon svg={Plus} />}
                      fullWidth
                    >
                      Create Trip
                    </Button>
                  </Link>
                  
                  <Link to="/profile" onClick={() => handleNavClick('profile')}>
                    <Button
                      variant={isActivePath('/profile') ? 'solid' : 'ghost'}
                      color={isActivePath('/profile') ? 'primary' : 'neutral'}
                      startIcon={<Icon svg={Settings} />}
                      fullWidth
                    >
                      Profile & Settings
                    </Button>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    color="neutral"
                    startIcon={<Icon svg={LogOut} />}
                    onClick={handleSignOut}
                    fullWidth
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/" onClick={() => handleNavClick('home')}>
                    <Button
                      variant={isActivePath('/') ? 'solid' : 'ghost'}
                      color={isActivePath('/') ? 'primary' : 'neutral'}
                      fullWidth
                    >
                      Home
                    </Button>
                  </Link>
                  
                  <a href="#features" onClick={() => handleNavClick('features')}>
                    <Button variant="ghost" color="neutral" fullWidth>
                      Features
                    </Button>
                  </a>
                  
                  <a href="#how-it-works" onClick={() => handleNavClick('how-it-works')}>
                    <Button variant="ghost" color="neutral" fullWidth>
                      How It Works
                    </Button>
                  </a>
                  
                  <View paddingTop={4} borderColor="neutral-faded" borderTopWidth={1}>
                    <View gap={2}>
                      <Link to="/login" onClick={() => handleNavClick('login')}>
                        <Button variant="ghost" color="neutral" fullWidth>
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/signup" onClick={() => handleNavClick('signup')}>
                        <Button variant="solid" color="primary" fullWidth>
                          Get Started
                        </Button>
                      </Link>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </Hidden>
      )}
    </View>
  );
};

export default Header;
