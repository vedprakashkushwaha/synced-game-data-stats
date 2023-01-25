const express = require('express');
const redisHandler = require('./config/redis');
const app = express();
const port = 3333;

app.get('/', (req, res) => {
    res.send('Hello World!')
}
);
 app.get('/set', async (req, res) => {
   //  await redisHandler.setData('test_suraj_bhai_the_legend', 'test');
     res.send('Data set');
 }
 );

app.get('/get-tag-wise-images-ques', async (req, res) => {
    const tags = ['game_parent_child_tag_group_1','game_parent_child_tag_group_2','game_parent_child_tag_group_3','game_parent_child_tag_group_4','game_parent_child_tag_group_5'];
    childArray = [];
    for(let i=0; i<tags.length; i++) {
        let data = await redisHandler.getData(tags[i]);
        data = JSON.parse(data);
        childArray = [...childArray, ...data]
    }
    const childWihData = {};
    for(let i=0; i<childArray.length; i++) {
        let images = await redisHandler.getData(`game_tag_images_${childArray[i]}`);
        images = JSON.parse(images);

        quesLevels = [1,2,3];

        qCount = 0;
        for(let j=0; j<quesLevels.length; j++) {
            let questions = await redisHandler.getData(`game_tag_questions_${childArray[i]}_${quesLevels[j]}`);
            questions = JSON.parse(questions);
            qCount += questions?.length || 0;
        }
        childWihData[childArray[i].toString()] = {
            images: images?.length || 0,
            questions: qCount
        }
    }

    res.send({data: childWihData});
}
);






async function test() {
    qIds = [4637,4639,4647,4652,4676,4692,4715,4716,4719,4724,4725,4729,4730,4734,4937,4940,4941,4949,4964,4980,4995,5003,5024,5072,5085,5100,5265,5268,5277,5304,5310,5336,5339,5343,5350,5351,5353,5354,5357,5370,5379,5382,5385,5387,5392,
        5397,5400,5403,5426,5433,5507,5513,5519,5547,5561,5565,5566,5567,5568,5573,5577,5579,5696,5704,5705,5708,5711,5725,5736,5796,5802,5813,5822,5825,5828,5853,5864,5873,5885,5888,5892,5945,5949,5954,5958,5966,5986,5988,6008,6017,
        6018,6023,6027,6040,6042,6049,6051,6069,6122,6125,6126,6131,6144,6165,6167,6168,6170,6179,6186,6188,6197,6198,6203,6207,6214,6221,6222,6231,6251,6270,6272,6278,6279,6282,6291,6297,6323,6338,6339,6342,6350,6351,6378,6386,6387,
        6417,6423,6426,6428,6431,6438,6441,6445,6461,6470,6474,6480,6488,6491,6497,6509,6537,6539,6540,6543,6681,6684,6687,6690,6692,6711,6723,6741,6747,6758,6765,6770,6780,6782,6795,6797,6798,6805,6806,6812,6840,6841,6847,6849,6858,
        6868,6873,6876,6882,6954,6964,6976,6986,6987,7030,7035,7039,7041,7044,7045,7053,7065,7072,7085,7088,7097,7105,7124,7130,7145,7149,7155,7160,7161,7162,7166,7167,7185,7194,7200,7201,7218,7220,7221,7227,7238,7247,7254,7266,7287,
        7289,7290,7295,7299,7302,7310,7322,7323,7331,7337,7341,7349,7350,7356,7358,7359,7365,7371,7414,7421,7430,7432,7433,7442,7448,7455,7458,7460,7475,7479,7484,7496,7505,7512,7520,7523,7524,7526,7539,7542,7545,7645,7679,7708,7712,
        7715,7719,7727,7733,7739,7740,7742,7752,7757,7758,7763,7766,7769,7778,7779,7789,7795,7800,7802,7812,7824,7830,7844,7850,7937,7967,8119,8131,8147,8157,8220,8252,8314,8335,9612,9863,10688,10691,11055,11058,13507,14960,15000,
        15042,15106,15618,15621,16130,17336,17337,17541,22233,22788,23469,23596,23659,24097,24099,24171,24336,26161,26215]
        
    for (var i = 0; i < qIds.length; i++) {
        key = `game_question_${qIds[i]}`;
        let data = await redisHandler.getData(key);
        console.log(`key: ${key} --> ${data}`);
    }    
}

async function main() {
    await test();
}

main();













app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
}
);
