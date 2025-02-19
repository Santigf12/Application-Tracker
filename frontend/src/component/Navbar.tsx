import { Menu } from "antd";
import { useState } from "react";
import { NavLink } from "react-router";


const Navbar = () => {
  const [current, setCurrent] = useState("1");

  const handleClick = (e: { key: string }) => {
    setCurrent(e.key);
  };

  return (
    <Menu
        onClick={handleClick}
        selectedKeys={[current]}
        mode="horizontal"
        theme="dark"
        style={{ flex: 1, minWidth: 0 }}
    >
        <Menu.Item key="1">
            <NavLink to="/">Home</NavLink>
        </Menu.Item>
        <Menu.Item key="2">
            <NavLink to='/create'>Create Application</NavLink>
        </Menu.Item>
        <Menu.Item key="3">
            <NavLink to='/files'>Files</NavLink>
        </Menu.Item>
    </Menu>
  );
};

export default Navbar;
