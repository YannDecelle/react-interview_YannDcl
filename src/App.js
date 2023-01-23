import React, { useState, useEffect } from 'react';
import { movies$ } from './movies.js';
import './App.css';

// state variable to store movie data
const App = () => {
  const [movieData, setMovieData] = useState([]);

  // useEffect to fetch movie data from localStorage or API and store it in movieData state
  useEffect(() => {
    const storedData = localStorage.getItem("movieData");
    if(storedData){
      setMovieData(JSON.parse(storedData));
    }else{
      movies$.then(data => {
        setMovieData(data);
        localStorage.setItem("movieData", JSON.stringify(data));
      });
    }
  }, []);

  // state variables to check if a movie has been liked or disliked
  const [hasLiked, setHasLiked] = useState([]);
  const [hasDisliked, setHasDisliked] = useState([]);
  
  // function to update movie likes and dislikes
  const updateMovie = (id, action) => {
    let updatedMovieData = movieData.map(movie => {
      if(movie.id === id){
        if(action === "increment"){
            if(hasLiked.includes(id)){
                movie.likes--;
                setHasLiked(hasLiked.filter(item => item !== id));
            }else if(hasDisliked.includes(id)){
                movie.dislikes--;
                setHasDisliked(hasDisliked.filter(item => item !== id));
                movie.likes++;
                setHasLiked(hasLiked.concat(id));
            }else{
                movie.likes++;
                setHasLiked(hasLiked.concat(id));
            }
        }else if(action === "decrement"){
            if(hasDisliked.includes(id)){
                movie.dislikes--;
                setHasDisliked(hasDisliked.filter(item => item !== id));
              }else if(hasLiked.includes(id)){
                movie.likes--;
                setHasLiked(hasLiked.filter(item => item !== id));
                movie.dislikes++;
                setHasDisliked(hasDisliked.concat(id));
            }else{
                movie.dislikes++;
                setHasDisliked(hasDisliked.concat(id));
            }
        }
      }
      return movie;
    });
    setMovieData(updatedMovieData);
    localStorage.setItem("movieData", JSON.stringify(updatedMovieData));
  }

  // function to delete a movie
  const deleteMovie = (id) => {
    let updatedMovieData = movieData.filter(movie => movie.id !== id);
    setMovieData(updatedMovieData);
    localStorage.setItem("movieData", JSON.stringify(updatedMovieData));
}

// function to reset movies to original state
const resetMovies = () => {
  movies$.then(data => {
      setMovieData(data);
      localStorage.setItem("movieData", JSON.stringify(data));
  });
}

// state variable to store categories for filtering purposes
const [categories, setCategories] = useState([]);
useEffect(() => {
    setCategories(Array.from(new Set(movieData.map(movie => movie.category))));
}, [movieData]);

//  state variables to store selected category and filtered movies
const [selectedCategory, setSelectedCategory] = useState("");
const [selectedCategories, setSelectedCategories] = useState([]);
const [filteredMovies, setFilteredMovies] = useState(movieData);

// function to filter movies by category
const handleCategoryChange = e => {
  const selectedCategory = e.target.value;
  setSelectedCategory(selectedCategory);
  if (selectedCategory === "All") {
    setSelectedCategories([]);
    setFilteredMovies(movieData);
  } else {
    setSelectedCategories(prevCategories => [...prevCategories, selectedCategory]);
    setFilteredMovies(movieData.filter(movie => movie.category === selectedCategory));
  }
};

//  function to remove a category from the selected categories by cliking on it's token
const handleTokenClick = category => {
  setSelectedCategories(selectedCategories.filter(cat => cat !== category));
};

//  state variables to store movies per page and current page
const [moviesPerPage, setMoviesPerPage] = useState(4);
const [currentPage, setCurrentPage] = useState(1);

//  functions to handle the pagination system
const handleMoviesPerPageChange = e => {
  setMoviesPerPage(e.target.value);
  setCurrentPage(1);
};

// function to handle page change
const handlePageChange = newPage => {
  setCurrentPage(newPage);
};

// state variables to check pages and movies per page tacking into account filtering
const pages = Math.ceil(filteredMovies.length / moviesPerPage);
const startIndex = (currentPage - 1) * moviesPerPage;
const endIndex = startIndex + moviesPerPage;
const currentMovies = movieData.slice(startIndex, endIndex);

// return the JSX for the component
return (
  <div className="App">
    <header className="App-header">
      <h1>Movies</h1>
      <button onClick={() => resetMovies()}>Reset Movies</button>
    </header>
    <div className="App-body">
      <div className="movies-per-page-selector">
      <label>Movies:</label>
        <select value={moviesPerPage} onChange={handleMoviesPerPageChange}>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={12}>12</option>
        </select>
      </div>
      {/* List categories in the drop down menu to filter movies by category. Click on a category token to remove it from the list of selected categories. */}
      <div className="category-selector">
        <label>Select categories:</label>
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="All">All</option>
            {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
              ))}
        </select>
        <div className="selected-categories">
          {selectedCategories.map(category => (
            <div key={category} className="selected-category" onClick={() => handleTokenClick(category)}>
              {category}
            </div>
          ))}
        </div>
      </div>
      
      <div className="movie-list">
      {currentMovies
        .filter(
          movie =>
            selectedCategories.length === 0 ||
            selectedCategories.some(category => movie.category === category)
        )
        .map(movie => (
          <div key={movie.id} className="MovieCard">
            <div className="top-right-button-container">
              <h2>{movie.title}</h2>
              <button onClick={() => deleteMovie(movie.id)}>Delete</button>
            </div>
            <h3>{movie.category}</h3>
            <div className="like-dislike-bar">
              <button className="like-button" onClick={() => updateMovie(movie.id, "increment")}>
                +
              </button>
              <div className="like-bar" style={{ width: `${(movie.likes / (movie.likes + movie.dislikes)) * 100}%` }}></div>
              <div className="dislike-bar" style={{ width: `${(movie.dislikes / (movie.likes + movie.dislikes)) * 100}%` }}></div>
              <button className="dislike-button" onClick={() => updateMovie(movie.id, "decrement")}>
                -
              </button>
            </div>
            <div className="like-dislike-count-container">
              <div className="like-count">{movie.likes}</div>
              <div className="dislike-count">{movie.dislikes}</div>
            </div>
          </div>
        ))}
        </div>
      <div className="page-selector" style={{display: filteredMovies.length === 0 ? 'none': 'block'}}>
        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
          Previous
        </button>
        {[...Array(pages)].map((_, i) => (
          <button key={i} onClick={() => handlePageChange(i + 1)}>
            {i + 1}
          </button>
        ))}
        <button disabled={currentPage === pages} onClick={() => handlePageChange(currentPage + 1)}>
          Next
        </button>
      </div>
    </div>
  </div>
);


}

// export the component
export default App;