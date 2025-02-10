import { ConfigProvider, Layout } from "antd";
import enUS from "antd/es/locale/en_US";
import { Outlet } from "react-router";
import Navbar from "./Navbar";

const { Header, Content } = Layout;

const HomeLayout = () => {

    return (
        <ConfigProvider locale={enUS}>
            <Layout style={{ padding: 8, minHeight: "100vh", width: "100vw"}}>
                <div className="demo-logo" />
                <Header style={{ 
                    display: "flex", 
                    alignItems: "center",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                    borderRadius: "10px",  // Rounds the corners
                    overflow: "hidden"
                }}>
                    <Navbar />
                </Header>
                <Content style={{ padding: "20px" }}>
                    <Outlet />
                </Content>
            </Layout>
        </ConfigProvider>
    );
}

export default HomeLayout;