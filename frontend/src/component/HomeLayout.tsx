import { Outlet } from "react-router";

const HomeLayout = () => {
    return (
        <div className="container-fluid p-5 ">
            <Outlet />
        </div>
    );
}

export default HomeLayout;