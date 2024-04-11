export const BackgroundGalaxy = () => {
    return (
        <>
            <div className="background-galaxy">
                <img className="galaxy-2" src="/static/images/bg-galaxy.jpg?v=1" alt="galaxy" />
                <div className="galaxy-1-container">
                    <img className="galaxy-1" src="/static/images/bg-galaxy.jpg?v=1" alt="galaxy" />
                </div>
            </div>
            <div className="star-field">
                <div className="layer"></div>
                <div className="layer"></div>
                <div className="layer"></div>
            </div>
        </>
    );
};

export default BackgroundGalaxy;
