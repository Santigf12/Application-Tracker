'use client';

import Navbar from '@/app/components/Navbar';
import { App, ConfigProvider, Layout } from 'antd';
import enUS from 'antd/es/locale/en_US';

const { Header, Content } = Layout;

export default function AppShell({ children, }: { children: React.ReactNode; }) {
  return (
    <ConfigProvider locale={enUS}>
      <App>
        <Layout
          style={{
            padding: 8,
            minHeight: '100vh',
            width: '100vw',
          }}
        >
          <div className="demo-logo" />
          <Header
            style={{
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <Navbar />
          </Header>

          <Content style={{ padding: '20px' }}>{children}</Content>
        </Layout>
      </App>
    </ConfigProvider>
  );
}