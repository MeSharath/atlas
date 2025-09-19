import { View } from 'reshaped';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <View minHeight="100vh">
      <main>
        {children}
      </main>
    </View>
  );
};

export default Layout;
