'use client';

import { App, Button, Card, Col, Row, Space, Typography } from 'antd';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

const tabList = [
  {
    key: 'application',
    label: 'Application',
  },
  {
    key: 'cover-letter',
    label: 'Cover Letter',
  },
  {
    key: 'resume',
    label: 'Resume',
  },
];

export default function ApplicationLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notification } = App.useApp();

  const id = params?.id ?? '';
  const page = searchParams.get('page') || '1';

  const activeTabKey =
    pathname.includes('/cover-letter')
      ? 'cover-letter'
      : pathname.includes('/resume')
        ? 'resume'
        : 'application';

  const handleTabChange = (key: string) => {
    router.push(`/application/${id}/${key}?page=${page}`);
  };

  const handleButtonCopy = async (link: string, title: string) => {
    try {
      await navigator.clipboard.writeText(link);
      notification.success({
        message: `${title} copied`,
        placement: 'topLeft',
        duration: 1,
      });
    } catch (error) {
      notification.error({
        message: 'Failed to copy link',
        placement: 'topLeft',
      });
    }
  };

  return (
    <Row gutter={[8, 0]}>
      <Col span={3}>
        <Card variant="borderless" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Space orientation="vertical" size="small" style={{ width: '100%', flex: 1 }}>
            <Typography.Title level={4}>Useful Links</Typography.Title>

            <Button
              block
              size="large"
              onClick={() =>
                handleButtonCopy('https://www.linkedin.com/in/santiago-f-b50079219/', 'LinkedIn')
              }
            >
              LinkedIn
            </Button>

            <Button
              block
              size="large"
              onClick={() => handleButtonCopy('https://github.com/Santigf12', 'GitHub')}
            >
              GitHub
            </Button>

            <Button
              block
              size="large"
              onClick={() => handleButtonCopy('https://www.fuentes.it.com/', 'Personal Website')}
            >
              Personal Website
            </Button>

            <Button
              block
              size="large"
              onClick={() => handleButtonCopy('mailto:santiago.fuentes@ucalgary.ca', 'School Email')}
            >
              School Email
            </Button>

            <Button
              block
              size="large"
              onClick={() => handleButtonCopy('mailto:santiago@fuentes.it.com', 'Personal Email')}
            >
              Personal Email
            </Button>
          </Space>
        </Card>
      </Col>

      <Col span={21}>
        <Card
          style={{
            padding: 5,
            height: 75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            marginBottom: 10,
          }}
        >
          <Typography.Title level={2} style={{ margin: 0 }}>
            Application Dashboard
          </Typography.Title>

          <Typography.Title level={5} style={{ margin: 0, marginLeft: 85 }}>
            <Link href={`/?page=${page}`}>Back to Applications</Link>
          </Typography.Title>
        </Card>

        <Card
          style={{ width: '100%' }}
          tabList={tabList}
          activeTabKey={activeTabKey}
          onTabChange={handleTabChange}
          tabProps={{ size: 'middle' }}
        >
          {children}
        </Card>
      </Col>
    </Row>
  );
}