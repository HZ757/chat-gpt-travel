import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';

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

app.post('/', async (req, res) => {
    try {
        const messages = req.body.messages;

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messages,
          });

        res.status(200).send({
            bot: response.data.choices[0].message
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
})

app.post('/hotel', async (req, res) => {
    try {
        const location = req.body.location;
        const start_date = req.body.start_date;
        const end_date = req.body.end_date;

        const options = {
            method: 'GET',
            url: 'https://booking-com.p.rapidapi.com/v1/hotels/locations',
            params: {name: location, locale: 'en-gb'},
            headers: {
                'X-RapidAPI-Key': '1c08d74bdcmsheabc554769b54f1p1455d2jsn6f0e0abf2ded',
                'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
            }
        };

        axios.request(options).then(function (response) {
            let dest_id = 0

            for (let i = 0; i < response.data.length; i++) {
                if (response.data[i].dest_type == "city")
                {
                    dest_id = response.data[i].dest_id;
                    break;
                }
            }

            console.log(dest_id);


            const hotel_options = {
                method: 'GET',
                url: 'https://booking-com.p.rapidapi.com/v1/hotels/search',
                params: {
                  adults_number: '1',
                  dest_id: dest_id,
                  locale: 'en-gb',
                  checkin_date: start_date,
                  filter_by_currency: 'CAD',
                  room_number: '1',
                  order_by: 'popularity',
                  units: 'metric',
                  dest_type: 'city',
                  checkout_date: end_date,
                },
                headers: {
                  'X-RapidAPI-Key': '1c08d74bdcmsheabc554769b54f1p1455d2jsn6f0e0abf2ded',
                  'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
                }
              };
              
              axios.request(hotel_options).then(function (hotel_response) {
                  let url = hotel_response.data.result[0].url;
                  let hotel_name = hotel_response.data.result[0].hotel_name_trans;
                  let city_name = hotel_response.data.result[0].city_name_en;
                  let composite_price_breakdown = hotel_response.data.result[0].composite_price_breakdown;
                  let max_photo_url = hotel_response.data.result[0].max_photo_url;

                  res.status(200).send({
                    url: url,
                    hotel_name: hotel_name,
                    city_name: city_name,
                    composite_price_breakdown,
                    max_photo_url: max_photo_url
                  })
              }).catch(function (error) {
                  console.error(error);
                  res.status(500).send({ error });
              });

        }).catch(function (error) {
            console.error(error);
            res.status(500).send({ error });
        });

    } catch (error) {

    }
})

app.listen(5001, ()=> console.log('Server is running on port http://localhost:5001'));