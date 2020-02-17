const es = require('aws-es-client')({
  id: process.env.ES_ACCESS_ID,
  token: process.env.ES_ACCESS_SECRET,
  url: 'https://search-kaskadi-cl2e6mhgx3zc7ay2e5kkhjet4u.eu-central-1.es.amazonaws.com'
})


module.exports.handler = async (event) => {
  console.log(event.body)
  const eventBody = JSON.parse(event.body)
  const body = {
    kaskadiMeta: {
      orderStatus: eventBody.eventData.statusName
    }
  }
  es.update({
    id: eventBody.eventData.externalId,
    index: 'ysws-orders',
    body
  })
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Webhook data received!'
    })
  }
}
