const Home = () => {
    return (
        <div className="row border p-3 bg-body">
            
            <div className="col-md-2 border-end p-3 bg-body">
                Column 1
            </div>
            
            
            <div className="col-md-10">
                <div className="row">
                    <div className="col-12 border-bottom p-3 bg-body">
                        Column 2, Row 1
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 p-3 bg-body">
                        Column 2, Row 2
                    </div>
                </div>
            </div>
        </div>
    );
}
  
export default Home;
  