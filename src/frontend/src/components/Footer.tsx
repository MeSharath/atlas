import React from 'react';
import { Link } from 'react-router-dom';
import { 
  View, 
  Container, 
  Text, 
  Button,
  Icon,
  Divider
} from 'reshaped';
import { 
  MapPin, 
  Mail, 
  Github, 
  Twitter, 
  Heart 
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'API', href: '/api' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety Tips', href: '/safety' },
      { name: 'Community', href: '/community' },
      { name: 'Status', href: '/status' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' }
    ]
  };

  return (
    <View backgroundColor="neutral-faded" paddingTop={12} paddingBottom={6}>
      <Container maxWidth="7xl">
        <View gap={8}>
          {/* Main Footer Content */}
          <View direction="row" gap={8} wrap>
            {/* Brand Section */}
            <View minWidth="280px" gap={4}>
              <View direction="row" align="center" gap={2}>
                <Icon svg={MapPin} size={6} color="primary" />
                <Text variant="title-4" weight="bold" color="primary">
                  SoloAI
                </Text>
              </View>
              
              <Text variant="body-2" color="neutral-faded" maxWidth="280px">
                AI-powered travel planning for solo adventurers. Discover personalized 
                itineraries that adapt to weather and prioritize your safety.
              </Text>
              
              <View direction="row" gap={3}>
                <Button variant="ghost" size="small" color="neutral">
                  <Icon svg={Twitter} size={4} />
                </Button>
                <Button variant="ghost" size="small" color="neutral">
                  <Icon svg={Github} size={4} />
                </Button>
                <Button variant="ghost" size="small" color="neutral">
                  <Icon svg={Mail} size={4} />
                </Button>
              </View>
            </View>

            {/* Links Sections */}
            <View direction="row" gap={8} wrap grow>
              <View gap={4} minWidth="120px">
                <Text variant="body-1" weight="medium" color="neutral">
                  Product
                </Text>
                <View gap={2}>
                  {footerLinks.product.map((link) => (
                    <Link key={link.name} to={link.href}>
                      <Text variant="body-2" color="neutral-faded" hover={{ color: 'primary' }}>
                        {link.name}
                      </Text>
                    </Link>
                  ))}
                </View>
              </View>

              <View gap={4} minWidth="120px">
                <Text variant="body-1" weight="medium" color="neutral">
                  Company
                </Text>
                <View gap={2}>
                  {footerLinks.company.map((link) => (
                    <Link key={link.name} to={link.href}>
                      <Text variant="body-2" color="neutral-faded" hover={{ color: 'primary' }}>
                        {link.name}
                      </Text>
                    </Link>
                  ))}
                </View>
              </View>

              <View gap={4} minWidth="120px">
                <Text variant="body-1" weight="medium" color="neutral">
                  Support
                </Text>
                <View gap={2}>
                  {footerLinks.support.map((link) => (
                    <Link key={link.name} to={link.href}>
                      <Text variant="body-2" color="neutral-faded" hover={{ color: 'primary' }}>
                        {link.name}
                      </Text>
                    </Link>
                  ))}
                </View>
              </View>

              <View gap={4} minWidth="120px">
                <Text variant="body-1" weight="medium" color="neutral">
                  Legal
                </Text>
                <View gap={2}>
                  {footerLinks.legal.map((link) => (
                    <Link key={link.name} to={link.href}>
                      <Text variant="body-2" color="neutral-faded" hover={{ color: 'primary' }}>
                        {link.name}
                      </Text>
                    </Link>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <Divider />

          {/* Bottom Section */}
          <View direction="row" align="center" justify="space-between" wrap gap={4}>
            <Text variant="body-3" color="neutral-faded">
              © {currentYear} SoloAI. All rights reserved.
            </Text>
            
            <View direction="row" align="center" gap={1}>
              <Text variant="body-3" color="neutral-faded">
                Made with
              </Text>
              <Icon svg={Heart} size={3} color="critical" />
              <Text variant="body-3" color="neutral-faded">
                for solo travelers
              </Text>
            </View>
          </View>
        </View>
      </Container>
    </View>
  );
};

export default Footer;
