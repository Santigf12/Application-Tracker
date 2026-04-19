'use client';

import { Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  const selectedKey = pathname.includes('/profile') ? '/profile' : pathname;

  return (
    <Menu
      selectedKeys={[selectedKey]}
      mode="horizontal"
      theme="dark"
      style={{ flex: 1, minWidth: 0 }}
      items={[
        {
          key: '/',
          label: <Link href="/">Home</Link>,
        },
        {
          key: '/create',
          label: <Link href="/create">Create Application</Link>,
        },
        {
          key: '/files',
          label: <Link href="/files">Files</Link>,
        },
        {
          key: '/profile',
          label: <Link href="/profile/skills">Profile</Link>,
        },
      ]}
    />
  );
};

export default Navbar;