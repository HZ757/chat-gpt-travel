import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')
const itineraryContainer = document.querySelector('#itinerary')
const hotelContainer = document.querySelector('#hotel')
const flightContainer = document.querySelector('#flight')

let loadInterval;

let messages = [{role: "system", content: `

You are a helpful assistant who aims to help the user plan a vacation. Talk to the user and ask them questions until you can confidently extract the following info about the vacation: Itinerary, departure airport code, arrival airport code, destination city, dates of vacation. Do not leave the itinerary empty, describe each day of the vacation in a few sentences. The current year is 2023. Do not ask irrelevant questions here.

Then once the neccesary info is collected or when the user says "I'm done here", output a JSON object with the following structure: {vacation_location: '', departure_code: '', arrival_code: '', start_date: '', end_date: '', itinerary: {}}, if not all neccesary info is collected, then generate suggested info in its place.

dates shall be in the format: YYYY-MM-DD

`},
                {role: "assistant", content: "Hello, how may I help you plan a vacation?"}]

chatContainer.innerHTML += chatStripe(true, "Hello, how may I help you plan a vacation?", 0);


function loader(element) {
  element.textContext = '';
  
  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }

  }, 300)
}

function typeText(element, text) {
  let index = 0;

  console.log(text)
  console.log(element)

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? 'bot' : 'user'}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

function addItinerary(itinerary) {
  console.log(itinerary)
  itineraryContainer.innerHTML = ``

  for (var key in itinerary)
  {
    itineraryContainer.innerHTML +=  
    `
     <div class="wrapper">
        <div class="chat">
          <div class="profile">
            <div>${key}</div>
          </div>
          <div class="message">${itinerary[key]}</div>
        </div>
      </div>
      `;
  }
}

function addFlight(departure_code, arrival_code, start_date, end_date){
  console.log(departure_code, arrival_code, start_date, end_date)
  flightContainer.innerHTML = ``

  flightContainer.innerHTML +=
  `
  <div class="wrapper">
    <div class="chat">
      <div class="profile">
        <div>DEP</div>
      </div>
      <div class="message">${departure_code}</div>
    </div>
  </div>
  `;

  flightContainer.innerHTML +=
  `
  <div class="wrapper">
    <div class="chat">
      <div class="profile">
        <div>ARR</div>
      </div>
      <div class="message">${arrival_code}</div>
    </div>
  </div>
  `;

  flightContainer.innerHTML +=
  `
  <div class="wrapper">
    <div class="chat">
      <div class="profile">
        <div>Dates</div>
      </div>
      <div class="message">${start_date} - ${end_date}</div>
    </div>
  </div>
  `;

  flightContainer.innerHTML +=
  `
  <div class="wrapper">
    <div class="chat">
      <div class="profile">
        <div>Link</div>
      </div>
      <a href="https://www.kayak.com/flights/${departure_code}-${arrival_code}/${start_date}/${end_date}/?sort=bestflight_a"  class="message">See Flights</a>
    </div>
  </div>
  `;

}

function addHotel(url, hotel_name, city_name, composite_price_breakdown, max_photo_url) {
  hotelContainer.innerHTML = ``

  hotelContainer.innerHTML +=
  `
  <div class="wrapper">
    <img src="${max_photo_url}" alt="Hotel Image" width="160", height="90">
  </div>
  `;

  hotelContainer.innerHTML +=
  `
  <div class="wrapper">
    <div class="chat">
      <div class="profile">
        <div>Hotel</div>
      </div>
      <div class="message">${hotel_name}</div>
    </div>
  </div>
  `;

  hotelContainer.innerHTML +=
  `
  <div class="wrapper">
    <div class="chat">
      <div class="profile">
        <div>City</div>
      </div>
      <div class="message">${city_name}</div>
    </div>
  </div>
  `;

  hotelContainer.innerHTML +=
  `
  <div class="wrapper">
    <div class="chat">
      <div class="profile">
        <div>Price</div>
      </div>
      <div class="message">${composite_price_breakdown.all_inclusive_amount.value.toString()} ${composite_price_breakdown.all_inclusive_amount.currency}</div>
    </div>
  </div>
  `;

  hotelContainer.innerHTML +=
  `
  <div class="wrapper">
    <div class="chat">
      <div class="profile">
        <div>Link</div>
      </div>
      <a href="${url}" class="message">Book Here</a>
    </div>
  </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  messages.push({role: "user", content: data.get('prompt')})

  form.reset();

  // bot's chatstripe

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  console.log(chatContainer.innterHTML);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response

  const response = await fetch('http://localhost:5001', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: messages
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.content;

    console.log({parsedData})

    typeText(messageDiv, parsedData);

    messages.push({role: "assistant", content: parsedData})

    // check if the parsedData has '{', find first '{' and last '}', very likely to contain the json object

    if (parsedData.indexOf("{") > 0 || parsedData.lastIndexOf("}") > parsedData.indexOf("{"))
    {
      let startJson = parsedData.indexOf("{")
      let lastJson = parsedData.lastIndexOf("}")
      
      let tripJSON = JSON.parse(parsedData.substring(startJson, lastJson + 1))

      console.log(tripJSON)

      const hotelResponse = await fetch('http://localhost:5001/hotel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: tripJSON.vacation_location,
          start_date: tripJSON.start_date,
          end_date: tripJSON.end_date
        })
      })

      if (hotelResponse.ok) {
        const hotelData = await hotelResponse.json();
        console.log(hotelData)

        addHotel(hotelData.url, hotelData.hotel_name, hotelData.city_name, hotelData.composite_price_breakdown, hotelData.max_photo_url)
      } else {
        const err = await hotelResponse.text();
    
        messageDiv.innerHTML = "Something went wrong";
    
        alert(err);
      }

      addItinerary(tripJSON.itinerary)
      addFlight(tripJSON.departure_code, tripJSON.arrival_code, tripJSON.start_date, tripJSON.end_date)
    }
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})