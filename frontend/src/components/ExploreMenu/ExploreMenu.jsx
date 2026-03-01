/* eslint-disable react/prop-types */
import { useContext } from 'react'
import './ExploreMenu.css'
import { menu_list } from '../../assets/assets.js'
import { StoreContext } from '../../context/StoreContext.jsx'

const ExploreMenu = ({category, setCategory}) => {

  // Access the global search state from StoreContext
  const { search } = useContext(StoreContext);

  // Filter the menu list based on the search input
  const filteredList = menu_list.filter(item => 
    search === "" || item.menu_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='explore-menu' id='explore-menu'>
        <div className="explore-menu-header">
            <h1>Craving something <span>Monsterous?</span></h1>
            <p className='explore-menu-text'>
                Dive into a diverse menu featuring a delicious array of dishes crafted with 
                the finest ingredients. Our mission is to elevate your dining experience, 
                one bite at a time.
            </p>
        </div>
        
        <div className='explore-menu-list'>
            {filteredList.length > 0 ? (
                filteredList.map((item, index) => {
                    const isActive = category === item.menu_name;
                    return (
                        <div 
                            onClick={() => setCategory(prev => prev === item.menu_name ? "All" : item.menu_name)} 
                            key={index} 
                            className={`explore-menu-list-item ${isActive ? "active-container" : ""}`}
                        >
                            <div className="img-wrapper">
                                <img 
                                    className={isActive ? "active" : ""} 
                                    src={item.menu_image} 
                                    alt={item.menu_name}
                                />
                            </div>
                            <p className={isActive ? "active-text" : ""}>{item.menu_name}</p>
                        </div>
                    )
                })
            ) : (
                /* Monster-themed No Results Message */
                <div className="search-no-results">
                    <p>The storm cleared... no flavors found matching "<span>{search}</span>"</p>
                </div>
            )}
        </div>
        <hr/>
    </div>
  )
}

export default ExploreMenu