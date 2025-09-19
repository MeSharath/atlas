import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  View, 
  Container, 
  Text, 
  Button, 
  Card
} from 'reshaped';
import { Mail, Lock, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    // TODO: Implement actual authentication
    setTimeout(() => {
      setIsLoading(false);
      alert('Login functionality coming soon!');
    }, 1000);
  };

  return (
    <View minHeight="100vh" align="center" justify="center">
      <Container padding={6}>
        <Card padding={8}>
          <View gap={6}>
            {/* Header */}
            <View align="center" gap={3}>
              <View direction="row" align="center" gap={2}>
                <Sparkles size={24} color="#6366f1" />
                <Text variant="title-4" weight="bold">
                  SoloAI
                </Text>
              </View>
              <Text variant="title-5" weight="bold">
                Welcome Back
              </Text>
              <Text variant="body-2" color="neutral-faded" align="center">
                Sign in to continue planning your solo adventures
              </Text>
            </View>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <View gap={4}>
                <View gap={2}>
                  <Text variant="body-3" weight="medium">
                    Email
                  </Text>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </View>

                <View gap={2}>
                  <Text variant="body-3" weight="medium">
                    Password
                  </Text>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </View>

                <Button
                  type="submit"
                  variant="solid"
                  color="primary"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </View>
            </form>

            {/* Sign Up Link */}
            <View align="center" direction="row" gap={1}>
              <Text variant="body-3" color="neutral-faded">
                Don't have an account?
              </Text>
              <Link 
                to="/signup"
                style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}
              >
                Sign up
              </Link>
            </View>

            {/* Back to Home */}
            <View align="center">
              <Link 
                to="/"
                style={{ color: '#6b7280', textDecoration: 'none', fontSize: '14px' }}
              >
                ← Back to Home
              </Link>
            </View>
          </View>
        </Card>
      </Container>
    </View>
  );
};

export default LoginPage;
