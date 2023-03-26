import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello World',
    })
})

/*

{
    destination: "",
    departure: "",
    dates: "",
    itinerary: {}
}

Complete the above json object with a vacation plan using the following prompt: 
*/

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
            Fill out the following json with a vacation plan from the prompt: ${prompt}
            If the prompt is not specific enough, then fill in fields with suggestions.

            {
                basic info:
                {
                    destination: "",
                    departure: "",
                    dates: "",
                },
                itinerary: {
                    {day number}: [{list of activities}]
                },
                flight_info:
                {
                    departure_airport_code: "",
                    destination_airport_code: ""
                },
                hotel_info:
                {
                    city_name: ""
                }
            }`
            ,
            temperature: 0.2,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
})

app.listen(5001, ()=> console.log('Server is running on port http://localhost:5001'));


/*


            Complete the above json object with a vacation plan using the following prompt: ${prompt}. Populate the itinerary with a plan of each day with the following format: day: {plan1, plan2, ...}, replacing the day with a number and the plans with stuff to do, be creative.

            const axios = require("axios");

            const options = {
            method: 'GET',
            url: 'https://hotels4.p.rapidapi.com/locations/search',
            params: {query: '{destination}', locale: 'en_US'},
            headers: {
                'X-RapidAPI-Key': '1c08d74bdcmsheabc554769b54f1p1455d2jsn6f0e0abf2ded',
                'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
            }
            };

            axios.request(options).then(function (response) {
                console.log(response.data);
            }).catch(function (error) {
                console.error(error);
            });

            complete the above api call replacing {destination} from the same prompt

            const axios = require("axios");

            const options = {
            method: 'GET',
            url: 'https://timetable-lookup.p.rapidapi.com/TimeTable/{Departing Airport Code}/{Arrival Airport Code}/{Arrival Date}/',
            headers: {
                'X-RapidAPI-Key': '1c08d74bdcmsheabc554769b54f1p1455d2jsn6f0e0abf2ded',
                'X-RapidAPI-Host': 'timetable-lookup.p.rapidapi.com'
            }
            };

            axios.request(options).then(function (response) {
                console.log(response.data);
            }).catch(function (error) {
                console.error(error);
            });

            complete the above api call replacing {Departing Airport Code} and {Arrival Airport Code} from the same prompt. Try to find the closest international airports, also generate the arrival date with the format YYYYMMDD.
            
            return all 3 of these prompts in the same order. Be creative if there is not enough information to work with. 
            `

    */