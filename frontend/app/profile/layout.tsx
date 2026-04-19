'use client';

import { Card, Col, Row } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export default function ProfileLayout({ children, }: { children: ReactNode; }) {
  const pathname = usePathname();
  const router = useRouter();

  const tabList = [
    { key: 'skills', tab: 'Skills' },
    { key: 'experience', tab: 'Experience' },
    { key: 'projects', tab: 'Projects' },
  ];

  const routeMap: Record<string, string> = {
    skills: '/profile/skills',
    experience: '/profile/experience',
    projects: '/profile/projects',
  };

  const activeTabKey =
    pathname === '/profile/experience'
      ? 'experience'
      : pathname === '/profile/projects'
        ? 'projects'
        : 'skills';

  return (
    <>
      <Col flex="auto">
        <Row justify="center" align="middle">
          <Col flex="auto">
            <Card
              title="Profile"
              style={{ minHeight: 50, width: '100%', marginTop: 10, textAlign: 'center' }}
              tabList={tabList}
              activeTabKey={activeTabKey}
              onTabChange={(key) => router.push(routeMap[key])}
              tabProps={{ size: 'middle' }}
            >
              {children}
            </Card>
          </Col>
        </Row>
      </Col>
    </>
  );
}