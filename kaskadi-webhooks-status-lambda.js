const es = require('aws-es-client')({
  id: process.env.ES_ACCESS_ID,
  token: process.env.ES_ACCESS_SECRET,
  url: 'https://search-kaskadi-cl2e6mhgx3zc7ay2e5kkhjet4u.eu-central-1.es.amazonaws.com'
})


module.exports.handler = async (event) => {
  console.log(event.body)
  const eventBody = JSON.parse(event.body)
  const id = eventBody.eventData.externalId
  const orderStatus = eventBody.eventData.statusName
  const esData = await es.get({
    id,
    index: 'ysws-orders'
  })
  if (esData._source.kaskadiMeta.orderStatus !== orderStatus) {
    es.update({
      id,
      index: 'ysws-orders',
      body: {
        kaskadiMeta: {
          orderStatus
        }
      }
    })
  }
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
