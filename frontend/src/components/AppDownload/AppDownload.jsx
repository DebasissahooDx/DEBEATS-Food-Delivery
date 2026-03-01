import { assets } from '../../assets/assets'
import './AppDownload.css'
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa"

const AppDownload = () => {

    const reviews = [
        { id: 1, name: "Sasmita Mohanty", rating: 5, text: "ଅତି ସୁନ୍ଦର ସେବା! ଖାଦ୍ୟ ବହୁତ ଶୀଘ୍ର ପହଞ୍ଚିଲା ।", status: "Highly Satisfied" },
        { id: 2, name: "Ansuman Dash", rating: 4.5, text: "The app interface is very smooth. Best service in Odisha.", status: "Satisfied" },
        { id: 3, name: "Priyanka Sahoo", rating: 5, text: "Excellent experience. The delivery partner was very polite.", status: "Highly Satisfied" },
        { id: 4, name: "Rajesh Kumar", rating: 5, text: "ମୋ ପସନ୍ଦର ଆପ୍, ସବୁବେଳେ ତାଜା ଖାଦ୍ୟ ମିଳୁଛି ।", status: "Highly Satisfied" },
        { id: 5, name: "Subhalaxmi Patra", rating: 4.5, text: "Great variety of restaurants. Highly recommended!", status: "Satisfied" },
        { id: 6, name: "Rajesh Mohanty", rating: 5, text: "Fast delivery and great food quality!", status: "Highly Satisfied" }
    ];

    return (
        <div className='app-download' id='app-download'>
            <div className="app-reviews-wrapper">
                <div className="review-title">
                    <span className="live-pulse"></span>
                    <h3>USER INTEL // FEEDBACK</h3>
                </div>

                <div className="reviews-grid">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="review-card">

                            <div className="review-card-header">
                                <p className="reviewer-name">{rev.name}</p>

                                <div className="rating-stars">
                                    {Array.from({ length: 5 }, (_, i) => {
                                        if (rev.rating >= i + 1) {
                                            return <FaStar key={i} />
                                        } else if (rev.rating >= i + 0.5) {
                                            return <FaStarHalfAlt key={i} />
                                        } else {
                                            return <FaRegStar key={i} />
                                        }
                                    })}
                                </div>
                            </div>

                            <p className="review-message">"{rev.text}"</p>

                            <div className="satisfaction-badge">
                                <span>{rev.status}</span>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            <div className="app-download-content">
                <p>
                    For a Faster & Better Experience <br />
                    Download the <span>DebEATS</span> App
                </p>

                <div className='app-download-platforms'>
                    <div className="store-button">
                        <img src={assets.play_store} alt="Play Store" />
                    </div>
                    <div className="store-button">
                        <img src={assets.app_store} alt="App Store" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppDownload