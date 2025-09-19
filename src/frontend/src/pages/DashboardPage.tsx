import { Link } from 'react-router-dom';
import { 
  View, 
  Container, 
  Text, 
  Button, 
  Card
} from 'reshaped';
import { Plus, MapPin, Calendar, Sparkles } from 'lucide-react';

const DashboardPage = () => {
  return (
    <Container padding={6}>
      <View gap={8}>
        {/* Header */}
        <View direction="row" align="center" justify="space-between">
          <View>
            <View direction="row" align="center" gap={2}>
              <Sparkles size={24} color="#6366f1" />
              <Text variant="title-3" weight="bold">
                SoloAI Dashboard
              </Text>
            </View>
            <Text variant="body-2" color="neutral-faded">
              Plan your next solo adventure
            </Text>
          </View>
          <Button variant="solid" color="primary" asChild>
            <Link to="/create">
              <View direction="row" align="center" gap={2}>
                <Plus size={16} />
                <Text>Create Trip</Text>
              </View>
            </Link>
          </Button>
        </View>

        {/* Quick Stats */}
        <View direction="row" gap={4}>
          <Card padding={4}>
            <View align="center" gap={2}>
              <MapPin size={24} color="#6366f1" />
              <Text variant="title-6" weight="bold">0</Text>
              <Text variant="body-3" color="neutral-faded">Trips Planned</Text>
            </View>
          </Card>
          
          <Card padding={4}>
            <View align="center" gap={2}>
              <Calendar size={24} color="#059669" />
              <Text variant="title-6" weight="bold">0</Text>
              <Text variant="body-3" color="neutral-faded">Countries Visited</Text>
            </View>
          </Card>
        </View>

        {/* Welcome Message */}
        <Card padding={6}>
          <View align="center" gap={4}>
            <Text variant="title-4" weight="bold">
              Welcome to SoloAI! 🌟
            </Text>
            <Text variant="body-1" color="neutral-faded" align="center">
              You haven't created any trips yet. Start planning your first solo adventure with AI-powered recommendations!
            </Text>
            <Button variant="solid" color="primary" asChild>
              <Link to="/create">Create Your First Trip</Link>
            </Button>
          </View>
        </Card>

        {/* Features Preview */}
        <View gap={4}>
          <Text variant="title-5" weight="bold">
            What You Can Do
          </Text>
          
          <View direction="row" gap={4}>
            <Card padding={4}>
              <View gap={3}>
                <MapPin size={32} color="#6366f1" />
                <Text variant="title-6" weight="bold">AI Trip Planning</Text>
                <Text variant="body-3" color="neutral-faded">
                  Get personalized itineraries based on your preferences and travel style
                </Text>
              </View>
            </Card>
            
            <Card padding={4}>
              <View gap={3}>
                <Calendar size={32} color="#059669" />
                <Text variant="title-6" weight="bold">Smart Scheduling</Text>
                <Text variant="body-3" color="neutral-faded">
                  Optimize your time with intelligent scheduling and route planning
                </Text>
              </View>
            </Card>
          </View>
        </View>
      </View>
    </Container>
  );
};

export default DashboardPage;
