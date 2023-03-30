import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

let messages = [{role: "system", content: "You are a helpful assistant who aims to help the user plan a vacation. Talk to the user and ask them questions until you can confidently extract the following info about the vacation: Itinerary, departure airport code, arrival airport code, destination city, dates of vacation. Do not leave the itinerary empty, suggest some things to do. Then output a JSON object with the following structure: {vacation_location: '', departure_code: '', arrival_code: '', start_date: '', end_date: '', itinerary: {}"},
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

function itinieraryStripe(itinerary) {

}

function flightStripe

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
      
      let jsonString = parsedData.substring(startJson, lastJson + 1)

      console.log(jsonString)
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