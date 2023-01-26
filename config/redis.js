const redis = require("redis");
const redisHandler = {}
const redisClient = redis.createClient(
    {
        socket: {
            port: 6379,
           host: "127.0.0.1"
	    // host: 'superone-game-royale-0001-001.jlnwgb.0001.euw2.cache.amazonaws.com'
        }
    }
);

(async () => {
	await redisClient.connect();
})();



redisClient.on("ready", () => {
	console.log("Connected!");
});

redisClient.on("error", (err) => {
	console.log("Error in the Connection");
});

redisHandler.setData = async (key, value) => {
    try {
        await redisClient.set(key, value, (err, reply) => {
            if (err) {
                console.log("error while setting data: ", err);
            }
            console.log('Data set into cache: ', key, reply);
        });
        console.log('Setting Key ', key);
    } catch (err) {
        console.log("Error while setting: ", err);
    };
}

redisHandler.getData = async (key) => {
    const cacheResults = await redisClient.get(key);
    return cacheResults;
}

module.exports = redisHandler;
