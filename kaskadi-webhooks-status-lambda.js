const es = require('aws-es-client')({
  id: process.env.ES_ACCESS_ID,
  token: process.env.ES_ACCESS_SECRET,
  url: 'https://search-kaskadi-cl2e6mhgx3zc7ay2e5kkhjet4u.eu-central-1.es.amazonaws.com'
})

const token = process.env.YSWS_TOKEN

module.exports.handler = async (event) => {
  const eventBody = JSON.parse(event.body)
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Webhook data received!'
    })
  }
  if (eventBody.token !== token) {
    response.statusCode = 401
    response.body = JSON.stringify({
      message: 'Unauthorized.'
    })
    return response
  }
  console.log(event.body)
  await esLog(eventBody)
  await updateOrderStatus(eventBody)
  return response
}

async function esLog(eventBody) {
  const timestamp = Date.now()
  const timestampHex = timestamp.toString(16)
  const logDocId = `${timestampHex[0]}-${timestampHex.substr(1, 5)}-${timestampHex.substr(5, 5)}`
  await es.index({
    id: logDocId,
    index: 'ysws-logs',
    body: {
      type: 'status',
      date: timestamp,
      ...eventBody
    }
  })
}

async function updateOrderStatus(eventBody) {
  const id = eventBody.eventData.externalId
  const orderStatus = eventBody.eventData.statusName
  const esData = await es.get({
    id,
    index: 'ysws-orders'
  })
  if (esData._source.kaskadiMeta.orderStatus !== orderStatus) {
    await es.update({
      id,
      index: 'ysws-orders',
      body: {
        kaskadiMeta: {
          orderStatus
        }
      }
    })
  }
}
