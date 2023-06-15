import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
const data = require('./data.json')

function App() {
  const [value, setvalue] = useState('');
  const [hide, setHide] = useState(false);

  const [ratings, setRatings] = useState({imdb: 0, meta: 0, rt: 0, overall: 0});


  const onSearch = (item: string) => {
    setvalue(item);
    getID(item);
  }

  //Получаем id фильма, если он есть
  async function getID(item: string){
    
    const options = {
      method: 'GET',
      url: 'https://movie-database-alternative.p.rapidapi.com/',
      params: {
        s: item,
        r: 'json',
        page: '1'
      },
      headers: {
        'X-RapidAPI-Key': '9ea1eb2dd8msh541cb11e21d8a29p105cf6jsn1d4e16f4dd12',
        'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
      }
    };
    
    try {
      const response = await axios.request(options);
      console.log(response.data.Search[0].imdbID);
      getRatings(response.data.Search[0].imdbID);
    } catch (error) {
      console.error(error);
      alert('Movie not found. Please try again.')
      setvalue('');
    }
  }

  async function getRatings (response: string){
    const options2 = {
      method: 'GET',
      url: 'https://movie-database-alternative.p.rapidapi.com/',
      params: {
        r: 'json',
        i: response
      },
      headers: {
        'X-RapidAPI-Key': '9ea1eb2dd8msh541cb11e21d8a29p105cf6jsn1d4e16f4dd12',
        'X-RapidAPI-Host': 'movie-database-alternative.p.rapidapi.com'
      }
    };
    
    try {
      const response2 = await axios.request(options2);
      const overall: number = ((response2.data.imdbRating * 10) + parseInt(response2.data.Ratings[1].Value.slice(0, -1)) + parseInt(response2.data.Ratings[2].Value.slice(0, -4)))/3;

      setRatings({imdb: response2.data.imdbRating, meta: response2.data.Ratings[2].Value, rt: response2.data.Ratings[1].Value, overall: Math.round(overall)})
      setHide(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      <section>
      <div className='descTop'>
        <h1>Get movie rating from the most popular review websites</h1>
      </div>
      <div className='searchTop'>
        <input type='text' placeholder='e.g. Interstellar...' value={value} onFocus={()=> {setHide(false); setvalue('')}} onChange={(e)=> {setvalue(e.target.value);}}></input>
        <button onClick={()=>onSearch(value)}><img src='send.png' className='svgR'></img></button>
      </div>
      <div className='downWrap'>
      <div className={"dropdown " + (hide ? 'hidden' : '')}>
        {data.filter((item: string) => {
          const searchTerm = value.toLowerCase();
          const fullName = item.toLowerCase();
          return searchTerm && fullName.startsWith(searchTerm) && fullName !== searchTerm;
        })//Чтобы названия фильмов не повторялись
        .reduce((array: string[], currentValue: string) => {
          if (!array.includes(currentValue)) {
            array.push(currentValue);
          }
          return array;
        }, [])
        .map((item: string, index: number)=>{
        // console.log(item);
        return index < 5 && <div key={item} className='dropdown-row' onClick={()=> {onSearch(item);}}>{item}</div>;
        })}
      </div>
      </div>
      <i>(technically, supports series and cartoons too)</i>
      <div className={'ratings ' + (hide ? '' : 'hidden')}>
      <div>
          <img src="Metascore.png" alt="" className='resultImages' />
          <i>Metacritic</i>
          <h3>{ratings.meta}</h3>
        </div>
        <div>
          <img src="rt.png" alt="" className='resultImages'/>
          <i>Rotten Tomatos</i>
          <h3>{ratings.rt}</h3>
        </div>
        <div>
          <img src="imdb.png" alt="" className='resultImages' />
          <i>IMDB</i>
          <h3>{ratings.imdb}</h3>
        </div>

      </div>
      <div className={'overall '+ (hide ? '' : 'hidden')}>
        <h2>{"Overall score: " + ratings.overall}</h2>
      </div>
      </section>
    </div>
  );
}

export default App;
