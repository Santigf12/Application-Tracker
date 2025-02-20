import { Menu } from "antd";
import { NavLink, useLocation } from "react-router";

const Navbar = () => {
  const location = useLocation()

  return (
    <Menu
        selectedKeys={[location.pathname]}
        mode="horizontal"
        theme="dark"
        style={{ flex: 1, minWidth: 0 }}
    >
        <Menu.Item key="/">
            <NavLink to="/">Home</NavLink>
        </Menu.Item>
        <Menu.Item key="/create">
            <NavLink to='/create'>Create Application</NavLink>
        </Menu.Item>
        <Menu.Item key="/files">
            <NavLink to='/files'>Files</NavLink>
        </Menu.Item>
    </Menu>
  );
};

export default Navbar;
