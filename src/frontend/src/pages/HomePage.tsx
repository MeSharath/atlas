import { Link } from 'react-router-dom';
import { 
  View, 
  Container, 
  Text, 
  Button, 
  Card
} from 'reshaped';
import { MapPin, Brain, Sparkles } from 'lucide-react';

const HomePage = () => {
  return (
    <Container padding={6}>
      <View gap={8}>
        {/* Hero Section */}
        <View align="center" gap={4}>
          <View direction="row" align="center" gap={2}>
            <Sparkles size={32} color="#6366f1" />
            <Text variant="title-1" weight="bold" align="center">
              SoloAI
            </Text>
          </View>
          <Text variant="title-3" align="center" color="neutral-faded">
            Your AI-powered travel companion for solo adventures
          </Text>
          
          <View direction="row" gap={3}>
            <Button variant="solid" color="primary" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button variant="faded" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </View>
        </View>

        {/* Features */}
        <View gap={6}>
          <Text variant="title-3" weight="bold" align="center">
            Why Choose SoloAI?
          </Text>
          
          <View direction="row" gap={4}>
            <Card padding={5}>
              <View align="center" gap={3}>
                <Brain size={40} color="#6366f1" />
                <Text variant="title-6" weight="bold">AI-Powered Planning</Text>
                <Text align="center" color="neutral-faded">
                  Smart itinerary generation tailored to your preferences and travel style
                </Text>
              </View>
            </Card>
            
            <Card padding={5}>
              <View align="center" gap={3}>
                <MapPin size={40} color="#059669" />
                <Text variant="title-6" weight="bold">Solo-Friendly</Text>
                <Text align="center" color="neutral-faded">
                  Designed specifically for solo travelers with safety and discovery in mind
                </Text>
              </View>
            </Card>
          </View>
        </View>

        {/* CTA Section */}
        <Card padding={6}>
          <View align="center" gap={4}>
            <Text variant="title-4" weight="bold">
              Ready for Your Next Adventure?
            </Text>
            <Text variant="body-1" color="neutral-faded" align="center">
              Join thousands of solo travelers creating unforgettable experiences
            </Text>
            <Button variant="solid" color="primary" asChild>
              <Link to="/signup">Start Planning Now</Link>
            </Button>
          </View>
        </Card>
      </View>
    </Container>
  );
};

export default HomePage;
