/******* basket_cost **********************************************************
 * Расчет стоимости корзины товаров в разных валютах.
 * Сервер.
 * На любую ошибку выдается 500 - Internal error.
 *
 * NodeJs  8.12
 * Express 4.17.1
 ******************************************************************************/

'use strict'

const express = require('express');
const app = express();

// Время жизни кэша курсов валют, мс:
const RATES_CACHE_TTL = 60000;  // 1 мин

// Список валют:
let currencyList = [ 'RUB', 'USD', 'EUR' ];

// Кэш курсов валют
//  .current - текущие курсы
//  .last    - предыдущие:
let currencyRates = {};

// Клиент:
app.use(express.static('client'));

// Запрос списка валют:
app.get('/get_currency_list', (req, resp) => resp.json(currencyList));

// Расчет козины:
app.use('/count_basket', express.json());
app.post('/count_basket', countBasket_req);

app.listen(3000, () => console.log('BasketCount app listening on port 3000!'));

// Цикл сброса кэша:
setInterval(rotateRatesCache, RATES_CACHE_TTL);

/******* countBasket_req ******************************************************
 * Расчет корзины.
 * Вход - JS-массив товаров.
 * Выход - JS-объект общей стоимости корзины в валютах из currencyList.
 ******************************************************************************/
function countBasket_req(req, resp)
 {
// Курсы закэшированы или корзина пуста:
  if (currencyRates.current || !(req.body && req.body.length))
   countBasket_resp(req, resp, currencyRates.current);
  else
// Запрос курсов ЦБ:
   fetchRates(() => countBasket_resp(req, resp,
                                     currencyRates.current || currencyRates.last));
 }

/******* fetchRates ***********************************************************
 * Запрос курсов ЦБ.
 * https://www.cbr-xml-daily.ru/daily_json.js
 ******************************************************************************/
function fetchRates(callback)
 {
  const https = require('https');

  const req = https.request({
                             host: 'www.cbr-xml-daily.ru',
                             port: 443,
                             path: '/daily_json.js',
                             method: 'GET'
                            },
                            processRatesResponse);

  req.on('error', function(err)
                   {
                    console.log('Error fetching currency rates: ' + err.message);
                    callback();
                   });

  req.end();

/******* processRatesResponse *************************************************
 * Запись курсов валют в кэш.
 */
  function processRatesResponse(resp)
   {
    let data = '';

    resp.setEncoding('utf8');

    resp.on('data', (chunk) => data += chunk);

    resp.on('end', function()
                    {
                     try
                      {
                       currencyRates.current = JSON.parse(data);

// Для единообразия расчета единичный курс рубля:
                       currencyRates.current.Valute.RUB =
                        {
                         Nominal: 1,
                         Value: 1
                        };
                      }
                     catch (e)
                      {
                       console.log('Error parsing currency rates: ' + e.message);
                      }

                     callback();
                    });
   }
 }

/******* countBasket_resp *****************************************************
 * Расчет стоимости по курсам rates и отправка результата.
 ******************************************************************************/
function countBasket_resp(req, resp, rates)
 {
  let valute = (rates && rates.Valute);

  try
   {
    let res = {};

// Инициализация результата, стоимость во всех валютах - 0:
    currencyList.forEach((currency) => res[currency] = 0);

// Расчет:
    req.body.forEach((product) =>
                      currencyList.forEach((currency) =>
                                            res[currency] += getProductCost(product, currency)));

    resp.json(res);
   }
  catch (e)
   {
    console.log('Error counting basket: ' + e.message);
    resp.status(500).send('Internal error');
   }

/******* getProductCost *******************************************************
 * Стоимость продукта в определенной валюте.
 */
   function getProductCost(product, currency)
    {
// Стоимость продукта в "родной" валюте:
     let productCost = product.price * product.quantity;

// "Родная" валюта без пересчета:
     if (product.currency == currency)
      return (productCost);

// Остальные - пересчет через рубль:
     return (productCost * valute[product.currency].Value / valute[product.currency].Nominal /
             valute[currency].Value * valute[currency].Nominal);
    }
 }

/******* rotateRatesCache *****************************************************
 * Сброс кэша курсов валют.
 ******************************************************************************/
function rotateRatesCache()
 {
// Перемещаем корректный текущий кэш в last:
  if (currencyRates.current)
   {
    currencyRates.last = currencyRates.current;
    currencyRates.current = null;
   }
 }
