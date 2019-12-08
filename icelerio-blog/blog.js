'use strict';

//lets import aws db library
const AWS = require('aws-sdk');
const uuid = require('uuid');

//lets user local dynamo db
const dynamoDb = new AWS.DynamoDB.DocumentClient({
	region: process.env.REGION,
	endpoint: process.env.HOST,
	accessKeyId: process.env.ACCESS_KEY,
	secretAccessKey: process.env.SECRET
})

//code for creating icelerio blog
module.exports.create = async (event, context) => {
  
	const timestamp = new Date().getTime();
    let data;

    //Let catch if body not provided
    try{
    	data = JSON.parse(event.body)
    }catch(err){
    	console.error(`Could not parse requested JSON ${event.body}: ${err.stack}`);
	    return {
	      statusCode: 500,
	      error: `Could not parse requested JSON: ${err.stack}`
	    };
    }

    //Validate article body
	if (typeof data.article_body !== 'string') {
		console.error('Validation Failed');
		return {
	      statusCode: 400,
	      error: `Could not fetch article body`
	    };
	}

	//If article is valid make param body
	const params = {
		TableName: process.env.DYNAMODB_TABLE,
		Item: {
			id: uuid.v1(),
			article_body: data.article_body,
			createdAt: timestamp,
			updatedAt: timestamp,
		},
	};

	return await new Promise((resolve, reject) => {
		dynamoDb.put(params, (error, data) => {
	
			if (error) {
				console.log(`DB ERROR=${error.stack}`);
				resolve({
					statusCode: 400,
					error: `Could not create blog: ${error.stack}`
				});

			} else {
				console.log(`created Blog data=${JSON.stringify(data)}`);
				resolve({ statusCode: 200, body: JSON.stringify(params.Item) });
			}
		});
	});
}


//lets create function to get list of all blogs
module.exports.list = async (event, context) => {
  
	const params = {
    	TableName: process.env.DYNAMODB_TABLE,
  	};

	
	return await new Promise((resolve, reject) => {
		dynamoDb.scan(params, (error, result) => {
	
			if (error) {
				console.log(`DB ERROR=${error.stack}`);
				resolve({
					statusCode: 401,
					error: `Could not fetch blogs: ${error.stack}`
				});

			} else {
				console.log(`Getting Blog List data=${JSON.stringify(result)}`);
				resolve({ statusCode: 200, body: JSON.stringify(result.Items) });
			}
		});
	});
}


//code for creating icelerio blog
module.exports.get = async (event, context) => {
  
	const params = {
		TableName: process.env.DYNAMODB_TABLE,
		Key: {
			id: event.pathParameters.id,
		},
	};

	
	return await new Promise((resolve, reject) => {
		dynamoDb.get(params, (error, result) => {
	
			if (error) {
				console.log(`DB ERROR=${error.stack}`);
				resolve({
					statusCode: 401,
					error: `Could not fetch blog: ${error.stack}`
				});

			} else {
				console.log(`Getting Blog List data=${JSON.stringify(result)}`);
				resolve({ statusCode: 200, body:  JSON.stringify(result.Item) });
			}
		});
	});
}


//code for updating blog
module.exports.update = async (event, context) => {
	const timestamp = new Date().getTime();
	const data = JSON.parse(event.body);

	  //Validate article body
	if (typeof data.article_body !== 'string') {
		console.error('Validation Failed');
		return {
	      statusCode: 400,
	      error: `Could not update article body`
	    };
	}

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      '#article_body': 'article_body',
    },
    ExpressionAttributeValues: {
      ':article_body': data.article_body,
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET #article_body = :article_body, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };

  return await new Promise((resolve, reject) => {
		dynamoDb.update(params, (error, result) => {
	
			if (error) {
				console.log(`DB ERROR=${error.stack}`);
				resolve({
					statusCode: 400,
					error: `Could not upodate blog: ${error.stack}`
				});

			} else {
				console.log(`updated Blog data=${JSON.stringify(data)}`);
				resolve({ statusCode: 200, body: JSON.stringify(result.Attributes) });
			}
		});
	});
};


//code for deleting icelerio blog
module.exports.delete = async (event, context) => {
  
	const params = {
		TableName: process.env.DYNAMODB_TABLE,
		Key: {
			id: event.pathParameters.id,
		},
	};

	
	return await new Promise((resolve, reject) => {
		dynamoDb.delete(params, (error) => {
	
			if (error) {
				console.log(`DB ERROR=${error.stack}`);
				resolve({
					statusCode: 401,
					error: `Could not delete blog: ${error.stack}`
				});

			} else {
				resolve({ statusCode: 200, body:  JSON.stringify({}) });
			}
		});
	});
}